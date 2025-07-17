"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

// Add address type for address book
interface Address {
  id: string | number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default?: boolean;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);
  const [orderProducts, setOrderProducts] = useState<Record<string, unknown>[]>([]);
  const [orderProductsLoading, setOrderProductsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [addressSaving, setAddressSaving] = useState(false);

  // Fetch or create user in Directus
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn('google');
      return;
    }
    const fetchOrCreateUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const userObj = session.user as Record<string, unknown>;
        const googleId = typeof userObj?.sub === 'string' ? userObj.sub : (typeof userObj?.id === 'string' ? userObj.id : undefined);
        const email = typeof userObj?.email === 'string' ? userObj.email : undefined;
        let user = null;
        if (googleId) {
          const res = await fetch(`${DIRECTUS_URL}/items/user?filter[google_id][_eq]=${googleId}`);
          const json = await res.json();
          user = json.data && json.data[0];
        }
        if (!user && email) {
          const res2 = await fetch(`${DIRECTUS_URL}/items/user?filter[email][_eq]=${email}`);
          const json2 = await res2.json();
          user = json2.data && json2.data[0];
        }
        if (!user && email) {
          const createRes = await fetch(`${DIRECTUS_URL}/items/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              google_id: googleId || '',
              name: userObj?.name,
              avatar: userObj?.image,
            }),
          });
          const createJson = await createRes.json();
          user = createJson.data;
        }
        setProfile(user);
        setEditProfile({
          name: user?.name || '',
          phone: user?.phone || '',
          address: user?.address || '',
          city: user?.city || '',
          state: user?.state || '',
          zip: user?.zip || '',
          country: user?.country || '',
        });
        if (user && user.id) {
          const ordersRes = await fetch(`${DIRECTUS_URL}/items/orders?filter[users][_eq]=${user.id}&sort=-created_at`);
          const ordersJson = await ordersRes.json();
          setOrders(ordersJson.data || []);
          // Fetch addresses for address book
          const addrRes = await fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${user.id}`);
          const addrJson = await addrRes.json();
          setAddresses(addrJson.data || []);
        }
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrCreateUser();
  }, [session, status]);

  // Fetch product details for selected order
  useEffect(() => {
    if (!selectedOrder || !Array.isArray(selectedOrder.items) || selectedOrder.items.length === 0) {
      setOrderProducts([]);
      return;
    }
    const productIds = selectedOrder.items.map((id: any) => typeof id === 'object' && id.Products_id ? id.Products_id : id).filter(Boolean);
    if (productIds.length === 0) {
      setOrderProducts([]);
      return;
    }
    setOrderProductsLoading(true);
    fetch(`${DIRECTUS_URL}/items/Products?fields=*,images.*&filter[id][_in]=${productIds.join(',')}`)
      .then(res => res.json())
      .then(json => setOrderProducts(json.data || []))
      .finally(() => setOrderProductsLoading(false));
  }, [selectedOrder]);

  // Helper to get status color
  function getStatusColor(status: string) {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // Edit profile handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    if (!profile || !profile.id) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile),
      });
      if (!res.ok) throw new Error('Failed to save');
      setProfile({ ...profile, ...editProfile });
      setEditModalOpen(false);
    } catch {
      alert('Failed to save profile.');
    } finally {
      setEditSaving(false);
    }
  };

  // Address book handlers
  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };
  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile || !profile.id) return;
    setAddressSaving(true);
    try {
      const res = await fetch(`${DIRECTUS_URL}/items/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressForm, user: profile.id }),
      });
      if (!res.ok) throw new Error('Failed to add address');
      setAddressModalOpen(false);
      setAddressForm({});
      // Refresh addresses
      const addrRes = await fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${profile.id}`);
      const addrJson = await addrRes.json();
      setAddresses(addrJson.data || []);
    } catch {
      alert('Failed to add address.');
    } finally {
      setAddressSaving(false);
    }
  };

  // Order stats
  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : Number(o.total) || 0), 0);
  const memberSince = profile?.date_created ? new Date(profile.date_created as string).toLocaleDateString() : 'N/A';

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Header />
      <main className="max-w-3xl mx-auto py-12 px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 relative flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative group">
            <img
              src={profile.avatar as string || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name as string || 'U')}`}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-indigo-100 shadow object-cover cursor-pointer hover:opacity-80"
              onClick={() => alert('Avatar upload coming soon!')}
            />
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">Change</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-2xl font-bold text-gray-900">{profile.name as string}</div>
              <button className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200" onClick={() => setEditModalOpen(true)}>Edit Profile</button>
              <button className="ml-auto text-gray-400 hover:text-red-500 font-semibold text-sm" onClick={() => signOut()}>Sign out</button>
            </div>
            <div className="text-gray-600 text-sm mb-1">{profile.email as string}</div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium mb-2">Google Account</span>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mt-4">
              <div><span className="font-semibold text-gray-600">Phone</span><br />{profile.phone as string || <span className="text-gray-400">Not set</span>}</div>
              <div><span className="font-semibold text-gray-600">Address</span><br />{profile.address as string || <span className="text-gray-400">Not set</span>}</div>
              <div><span className="font-semibold text-gray-600">City</span><br />{profile.city as string || <span className="text-gray-400">Not set</span>}</div>
              <div><span className="font-semibold text-gray-600">State</span><br />{profile.state as string || <span className="text-gray-400">Not set</span>}</div>
              <div><span className="font-semibold text-gray-600">ZIP</span><br />{profile.zip as string || <span className="text-gray-400">Not set</span>}</div>
              <div><span className="font-semibold text-gray-600">Country</span><br />{profile.country as string || <span className="text-gray-400">Not set</span>}</div>
            </div>
            <div className="flex gap-8 mt-6 text-sm">
              <div><span className="font-semibold text-gray-600">Member since</span><br />{memberSince}</div>
              <div><span className="font-semibold text-gray-600">Orders</span><br />{orderCount}</div>
              <div><span className="font-semibold text-gray-600">Total Spent</span><br />₹{totalSpent.toFixed(2)}</div>
            </div>
          </div>
        </div>
        {/* Address Book */}
        <div className="bg-white rounded-2xl shadow p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-indigo-700">Address Book</h2>
            <button className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200" onClick={() => setAddressModalOpen(true)}>Add Address</button>
          </div>
          {addresses.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No addresses saved.</div>
          ) : (
            <ul className="space-y-2">
              {addresses.map(addr => (
                <li key={addr.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50">
                  <div>
                    <div className="font-semibold text-gray-800">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</div>
                    <div className="text-xs text-gray-600">Phone: {addr.phone}</div>
                  </div>
                  {addr.is_default && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Default</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Order History */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">Order History</h2>
          <div className="bg-white rounded-2xl shadow p-6">
            {orders.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <span className="block text-4xl mb-2">🛒</span>
                <span>No orders yet.</span>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id as string | number} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                      <div className="font-semibold text-gray-800">Order #{order.id as string | number}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at as string).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status as string)}`}>{order.status as string}</span>
                      <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">₹{order.total as string | number}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">Shipping: {order.shipping_address as string}</div>
                    <button className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 mt-2" onClick={() => setSelectedOrder(order)}>View Details</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Edit Profile Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
              <input name="name" value={editProfile.name || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <input name="phone" value={editProfile.phone || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input name="address" value={editProfile.address || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input name="city" value={editProfile.city || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
              <input name="state" value={editProfile.state || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ZIP</label>
              <input name="zip" value={editProfile.zip || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
              <input name="country" value={editProfile.country || ''} onChange={handleEditChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" onClick={() => setEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700" disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
      {/* Address Modal */}
      <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add Address">
        <form className="space-y-4" onSubmit={handleAddAddress}>
          <input required className="w-full border rounded px-3 py-2" placeholder="Address Line 1" name="address_line1" value={addressForm.address_line1 || ''} onChange={handleAddressFormChange} />
          <input className="w-full border rounded px-3 py-2" placeholder="Address Line 2" name="address_line2" value={addressForm.address_line2 || ''} onChange={handleAddressFormChange} />
          <input required className="w-full border rounded px-3 py-2" placeholder="City" name="city" value={addressForm.city || ''} onChange={handleAddressFormChange} />
          <input required className="w-full border rounded px-3 py-2" placeholder="State" name="state" value={addressForm.state || ''} onChange={handleAddressFormChange} />
          <input required className="w-full border rounded px-3 py-2" placeholder="Pincode" name="pincode" value={addressForm.pincode || ''} onChange={handleAddressFormChange} />
          <input required className="w-full border rounded px-3 py-2" placeholder="Phone" name="phone" value={addressForm.phone || ''} onChange={handleAddressFormChange} />
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" onClick={() => setAddressModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700" disabled={addressSaving}>{addressSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
      {/* Order Details Modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `Order #${selectedOrder.id} Details` : ''}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-2">
              <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedOrder.status as string)}`}>{selectedOrder.status as string}</span>
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">₹{selectedOrder.total as string | number}</span>
            </div>
            <div className="text-xs text-gray-600 mb-2">Shipping: {selectedOrder.shipping_address as string}</div>
            <div className="text-xs text-gray-500 mb-2">Placed: {new Date(selectedOrder.created_at as string).toLocaleString()}</div>
            <div className="text-xs text-gray-700">Items:</div>
            {orderProductsLoading ? (
              <div>Loading products...</div>
            ) : (
              <ul className="list-disc ml-6">
                {orderProducts.length === 0 ? (
                  <li>No product details found.</li>
                ) : (
                  orderProducts.map((product) => (
                    <li key={product.id as string | number} className="flex items-center gap-3 mb-2">
                      {product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.directus_files_id && (
                        <img src={`${DIRECTUS_URL}/assets/${product.images[0].directus_files_id}`} alt={product.name as string} className="w-10 h-10 object-cover rounded border" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{product.name as string}</div>
                        <div className="text-xs text-gray-600">₹{product.Discounter_price as string | number}</div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}
      </Modal>
      <Footer />
    </div>
  );
} 