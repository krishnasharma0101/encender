'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import Modal from '@/components/Modal';
import AuthScreen from '@/components/new-ui/AuthScreen';
import { getAssetUrl } from '@/lib/directus';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Edit,
  Plus,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Shield,
  Eye,
  Home,
  Sparkles,
  Check,
  Trash2,
} from 'lucide-react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

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

const INITIAL_GUEST_PROFILE = {
  id: 'guest-101',
  name: 'Guest Member',
  email: 'guest@encenderfashion.com',
  phone: '+91 90285 02581',
  address: '101 Heritage Villa, Park Avenue',
  city: 'Mumbai',
  state: 'Maharashtra',
  zip: '400001',
  country: 'India',
  date_created: new Date().toISOString(),
};

export default function NewUIAccountPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);
  const [orderProducts, setOrderProducts] = useState<Record<string, unknown>[]>([]);
  const [orderProductsLoading, setOrderProductsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('encender_user_addresses');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [addressSaving, setAddressSaving] = useState(false);

  // Fetch or create user in Directus
  useEffect(() => {
    if (status === 'loading') return;

    // If not logged in with NextAuth, check stored Directus user profile
    if (!session) {
      const savedProfile =
        typeof window !== 'undefined' ? localStorage.getItem('encender_user_profile') : null;
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && parsed.id && !String(parsed.id).startsWith('guest')) {
            setProfile(parsed);
            setEditProfile({
              name: (parsed.name as string) || '',
              phone: (parsed.phone as string) || '',
              address: (parsed.address as string) || '',
              city: (parsed.city as string) || '',
              state: (parsed.state as string) || '',
              zip: (parsed.zip as string) || '',
              country: (parsed.country as string) || 'India',
            });
            // Fetch real user orders & addresses from Directus
            fetch(`${DIRECTUS_URL}/items/orders?filter[users][_eq]=${parsed.id}&sort=-created_at`)
              .then((r) => r.json())
              .then((j) => setOrders(j.data || []))
              .catch(() => setOrders([]));
            fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${parsed.id}`)
              .then((r) => r.json())
              .then((j) => {
                if (Array.isArray(j.data) && j.data.length > 0) {
                  let fetchedAddrs: Address[] = j.data;
                  const hasDefault = fetchedAddrs.some((a) => a.is_default === true);
                  if (!hasDefault) {
                    const savedStr = typeof window !== 'undefined' ? localStorage.getItem('encender_user_addresses') : null;
                    const savedAddrs: Address[] = savedStr ? JSON.parse(savedStr) : [];
                    const savedDef = savedAddrs.find((a) => a.is_default);
                    const matchId = savedDef ? String(savedDef.id) : null;
                    fetchedAddrs = fetchedAddrs.map((a, idx) => ({
                      ...a,
                      is_default: matchId ? String(a.id) === matchId : idx === 0,
                    }));
                  }
                  setAddresses(fetchedAddrs);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('encender_user_addresses', JSON.stringify(fetchedAddrs));
                  }
                  const def = fetchedAddrs.find((a) => a.is_default) || fetchedAddrs[0];
                  if (def) {
                    const fullAddr = [def.address_line1, def.address_line2].filter(Boolean).join(', ');
                    setProfile((prev) => prev ? {
                      ...prev,
                      address: fullAddr,
                      city: def.city,
                      state: def.state,
                      zip: def.pincode,
                      phone: def.phone || (prev.phone as string) || '',
                    } : prev);
                  }
                }
              })
              .catch(() => {});
            setLoading(false);
            return;
          }
        } catch {}
      }
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchOrCreateUser = async () => {
      setError(null);
      try {
        const userObj = session.user as Record<string, unknown>;
        const googleId =
          typeof userObj?.sub === 'string'
            ? userObj.sub
            : typeof userObj?.id === 'string'
            ? userObj.id
            : undefined;
        const email = typeof userObj?.email === 'string' ? userObj.email : undefined;
        let user = null;
        if (googleId) {
          try {
            const res = await fetch(`${DIRECTUS_URL}/items/user?filter[google_id][_eq]=${googleId}`);
            const json = await res.json();
            user = json.data && json.data[0];
          } catch (e) {
            // directus offline fallback
          }
        }
        if (!user && email) {
          try {
            const res2 = await fetch(`${DIRECTUS_URL}/items/user?filter[email][_eq]=${email}`);
            const json2 = await res2.json();
            user = json2.data && json2.data[0];
          } catch (e) {}
        }
        if (!user && email) {
          try {
            const createRes = await fetch(`${DIRECTUS_URL}/items/user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                google_id: googleId || '',
                name: userObj?.name || 'Encender User',
                avatar: userObj?.image,
              }),
            });
            const createJson = await createRes.json();
            user = createJson.data;
          } catch (e) {}
        }

        const finalUser = user || {
          id: googleId || 'user-1',
          name: userObj?.name || 'Encender Member',
          email: email || 'user@encenderfashion.com',
          avatar: userObj?.image,
          phone: '+91 90285 02581',
        };

        setProfile(finalUser);
        setEditProfile({
          name: finalUser?.name || '',
          phone: finalUser?.phone || '',
          address: finalUser?.address || '',
          city: finalUser?.city || '',
          state: finalUser?.state || '',
          zip: finalUser?.zip || '',
          country: finalUser?.country || '',
        });

        if (finalUser && finalUser.id) {
          try {
            const ordersRes = await fetch(
              `${DIRECTUS_URL}/items/orders?filter[users][_eq]=${finalUser.id}&sort=-created_at`
            );
            const ordersJson = await ordersRes.json();
            setOrders(ordersJson.data || []);
            const addrRes = await fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${finalUser.id}`);
            const addrJson = await addrRes.json();
            if (Array.isArray(addrJson.data) && addrJson.data.length > 0) {
              let fetchedAddrs: Address[] = addrJson.data;
              const hasDefault = fetchedAddrs.some((a) => a.is_default === true);
              if (!hasDefault) {
                const savedStr = typeof window !== 'undefined' ? localStorage.getItem('encender_user_addresses') : null;
                const savedAddrs: Address[] = savedStr ? JSON.parse(savedStr) : [];
                const savedDef = savedAddrs.find((a) => a.is_default);
                const matchId = savedDef ? String(savedDef.id) : null;
                fetchedAddrs = fetchedAddrs.map((a, idx) => ({
                  ...a,
                  is_default: matchId ? String(a.id) === matchId : idx === 0,
                }));
              }
              setAddresses(fetchedAddrs);
              if (typeof window !== 'undefined') {
                localStorage.setItem('encender_user_addresses', JSON.stringify(fetchedAddrs));
              }
              const def = fetchedAddrs.find((a) => a.is_default) || fetchedAddrs[0];
              if (def) {
                const fullAddr = [def.address_line1, def.address_line2].filter(Boolean).join(', ');
                finalUser.address = fullAddr;
                finalUser.city = def.city;
                finalUser.state = def.state;
                finalUser.zip = def.pincode;
                finalUser.phone = def.phone || finalUser.phone;
                setProfile({ ...finalUser });
              }
            } else {
              const savedStr = typeof window !== 'undefined' ? localStorage.getItem('encender_user_addresses') : null;
              if (savedStr) {
                setAddresses(JSON.parse(savedStr));
              }
            }
          } catch (e) {}
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
    const productIds = selectedOrder.items
      .map((id: any) => (typeof id === 'object' && id.Products_id ? id.Products_id : id))
      .filter(Boolean);
    if (productIds.length === 0) {
      setOrderProducts([]);
      return;
    }
    setOrderProductsLoading(true);
    fetch(
      `${DIRECTUS_URL}/items/Products?fields=*,images.*&limit=-1&filter[id][_in]=${productIds.join(',')}`
    )
      .then((res) => res.json())
      .then((json) => setOrderProducts(json.data || []))
      .finally(() => setOrderProductsLoading(false));
  }, [selectedOrder]);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('encender_user_profile');
      localStorage.removeItem('encender_user_addresses');
    }
    setProfile(INITIAL_GUEST_PROFILE);
    setAddresses([
      {
        id: 'addr-1',
        address_line1: '101 Heritage Villa, Park Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91 90285 02581',
        is_default: true,
      },
    ]);
    if (session) {
      await signOut({ callbackUrl: '/account' });
    }
  };

  // Helper to get status color and styling
  function getStatusStyle(status: string) {
    switch (status) {
      case 'pending_payment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  // Edit profile handlers
  const handleOpenEditModal = () => {
    const def = addresses.find((a) => a.is_default) || (addresses.length > 0 ? addresses[0] : null);
    setEditProfile({
      name: (profile?.name as string) || '',
      phone: (profile?.phone as string) || def?.phone || '',
      address: def?.address_line1 || (profile?.address as string) || '',
      city: def?.city || (profile?.city as string) || '',
      state: def?.state || (profile?.state as string) || '',
      zip: def?.pincode || (profile?.zip as string) || '',
      country: (profile?.country as string) || 'India',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setEditSaving(true);

    const updatedProfile = {
      ...(profile || {}),
      name: editProfile.name,
      phone: editProfile.phone,
      address: editProfile.address,
      city: editProfile.city,
      state: editProfile.state,
      zip: editProfile.zip,
      country: editProfile.country,
    };
    setProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('encender_user_profile', JSON.stringify(updatedProfile));
    }

    // Synchronize active default address with the updated info
    const targetDef = addresses.find((a) => a.is_default) || (addresses.length > 0 ? addresses[0] : null);
    if (targetDef) {
      const updatedAddresses = addresses.map((a) => {
        if (String(a.id) === String(targetDef.id)) {
          return {
            ...a,
            address_line1: editProfile.address || a.address_line1,
            city: editProfile.city || a.city,
            state: editProfile.state || a.state,
            pincode: editProfile.zip || a.pincode,
            phone: editProfile.phone || a.phone,
            is_default: true,
          };
        }
        return a;
      });
      setAddresses(updatedAddresses);
      if (typeof window !== 'undefined') {
        localStorage.setItem('encender_user_addresses', JSON.stringify(updatedAddresses));
      }

      // Persist address changes to Directus
      if (!String(targetDef.id).startsWith('addr-')) {
        try {
          await fetch(`${DIRECTUS_URL}/items/addresses/${targetDef.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address_line1: editProfile.address,
              city: editProfile.city,
              state: editProfile.state,
              pincode: editProfile.zip,
              phone: editProfile.phone,
            }),
          });
        } catch (e) {
          console.log('Directus address update error:', e);
        }
      }
    } else if (editProfile.address) {
      // If no address exists yet, create one
      const newAddr: Address = {
        id: 'addr-' + Date.now(),
        address_line1: editProfile.address,
        address_line2: '',
        city: editProfile.city || '',
        state: editProfile.state || '',
        pincode: editProfile.zip || '',
        phone: editProfile.phone || '',
        is_default: true,
      };
      if (profile?.id && !String(profile.id).startsWith('guest')) {
        try {
          const res = await fetch(`${DIRECTUS_URL}/items/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address_line1: editProfile.address,
              address_line2: '',
              city: editProfile.city || '',
              state: editProfile.state || '',
              pincode: editProfile.zip || '',
              phone: editProfile.phone || '',
              is_default: true,
              user: profile.id,
            }),
          });
          const json = await res.json();
          if (json?.data?.id) newAddr.id = json.data.id;
        } catch (e) {}
      }
      const updated = [newAddr];
      setAddresses(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('encender_user_addresses', JSON.stringify(updated));
      }
    }

    // Sync profile to Directus
    if (profile?.id && !String(profile.id).startsWith('guest')) {
      try {
        await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editProfile.name,
            phone: editProfile.phone,
            address: editProfile.address,
            city: editProfile.city,
            state: editProfile.state,
            zip: editProfile.zip,
            country: editProfile.country,
          }),
        });
      } catch (e) {
        console.log('Directus profile sync skipped:', e);
      }
    }

    setEditModalOpen(false);
    setEditSaving(false);
  };

  // Address book handlers
  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddressSaving(true);

    const isFirst = addresses.length === 0;
    const addressData = {
      address_line1: addressForm.address_line1 || '',
      address_line2: addressForm.address_line2 || '',
      city: addressForm.city || '',
      state: addressForm.state || '',
      pincode: addressForm.pincode || '',
      phone: addressForm.phone || (profile?.phone as string) || '+91 90285 02581',
      is_default: isFirst,
    };

    let newAddress: Address = {
      id: 'addr-' + Date.now(),
      ...addressData,
    };

    // Persist to Directus API and capture real ID
    if (profile?.id && !String(profile.id).startsWith('guest')) {
      try {
        const res = await fetch(`${DIRECTUS_URL}/items/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...addressData, user: profile.id }),
        });
        const resJson = await res.json();
        if (resJson?.data?.id) {
          newAddress.id = resJson.data.id;
        }
      } catch (e) {
        console.log('Directus address save error:', e);
      }
    }

    const updated = [...addresses, newAddress];
    setAddresses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('encender_user_addresses', JSON.stringify(updated));
    }

    // If it's the first address, immediately set as billing address
    if (isFirst) {
      const fullAddress = [newAddress.address_line1, newAddress.address_line2].filter(Boolean).join(', ');
      const updatedProfile = {
        ...(profile || {}),
        address: fullAddress,
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.pincode,
        phone: newAddress.phone,
      };
      setProfile(updatedProfile);
      setEditProfile((prev) => ({
        ...prev,
        address: fullAddress,
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.pincode,
        phone: newAddress.phone,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('encender_user_profile', JSON.stringify(updatedProfile));
      }
      if (profile?.id && !String(profile.id).startsWith('guest')) {
        try {
          await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: fullAddress,
              city: newAddress.city,
              state: newAddress.state,
              zip: newAddress.pincode,
              phone: newAddress.phone,
            }),
          });
        } catch {}
      }
    }

    setAddressModalOpen(false);
    setAddressForm({});
    setAddressSaving(false);
  };

  const handleDeleteAddress = async (id: string | number) => {
    const deletedAddr = addresses.find((a) => String(a.id) === String(id));
    let updated = addresses.filter((a) => String(a.id) !== String(id));

    // Actually delete from Directus API
    if (profile?.id && !String(profile.id).startsWith('guest') && !String(id).startsWith('addr-')) {
      try {
        await fetch(`${DIRECTUS_URL}/items/addresses/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.log('Directus address delete error:', e);
      }
    }

    // If the deleted address was default, promote the first remaining one to default
    if (deletedAddr?.is_default && updated.length > 0) {
      updated = updated.map((a, idx) => ({ ...a, is_default: idx === 0 }));
      const newDef = updated[0];
      const fullAddress = [newDef.address_line1, newDef.address_line2].filter(Boolean).join(', ');
      const updatedProfile = {
        ...(profile || {}),
        address: fullAddress,
        city: newDef.city,
        state: newDef.state,
        zip: newDef.pincode,
        phone: newDef.phone || (profile?.phone as string) || '',
      };
      setProfile(updatedProfile);
      setEditProfile((prev) => ({
        ...prev,
        address: fullAddress,
        city: newDef.city,
        state: newDef.state,
        zip: newDef.pincode,
        phone: newDef.phone || prev.phone || '',
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('encender_user_profile', JSON.stringify(updatedProfile));
      }
      if (profile?.id && !String(profile.id).startsWith('guest') && !String(newDef.id).startsWith('addr-')) {
        try {
          await fetch(`${DIRECTUS_URL}/items/addresses/${newDef.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_default: true }),
          });
          await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: fullAddress,
              city: newDef.city,
              state: newDef.state,
              zip: newDef.pincode,
              phone: newDef.phone,
            }),
          });
        } catch {}
      }
    } else if (updated.length === 0) {
      const updatedProfile = {
        ...(profile || {}),
        address: '',
        city: '',
        state: '',
        zip: '',
      };
      setProfile(updatedProfile);
      setEditProfile((prev) => ({
        ...prev,
        address: '',
        city: '',
        state: '',
        zip: '',
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('encender_user_profile', JSON.stringify(updatedProfile));
      }
      if (profile?.id && !String(profile.id).startsWith('guest')) {
        try {
          await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: '', city: '', state: '', zip: '' }),
          });
        } catch {}
      }
    }

    setAddresses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('encender_user_addresses', JSON.stringify(updated));
    }
  };

  const handleSetDefaultAddress = async (id: string | number) => {
    const targetAddr = addresses.find((a) => String(a.id) === String(id));
    if (!targetAddr) return;

    const updatedAddresses = addresses.map((a) => ({
      ...a,
      is_default: String(a.id) === String(id),
    }));
    setAddresses(updatedAddresses);

    if (typeof window !== 'undefined') {
      localStorage.setItem('encender_user_addresses', JSON.stringify(updatedAddresses));
    }

    // Immediately reflect under Billing Address in the profile sidebar
    const fullAddress = [targetAddr.address_line1, targetAddr.address_line2].filter(Boolean).join(', ');
    const updatedProfile = {
      ...(profile || {}),
      address: fullAddress,
      city: targetAddr.city,
      state: targetAddr.state,
      zip: targetAddr.pincode,
      phone: targetAddr.phone || (profile?.phone as string) || '',
    };
    setProfile(updatedProfile);
    setEditProfile((prev) => ({
      ...prev,
      address: fullAddress,
      city: targetAddr.city,
      state: targetAddr.state,
      zip: targetAddr.pincode,
      phone: targetAddr.phone || prev.phone || '',
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('encender_user_profile', JSON.stringify(updatedProfile));
    }

    // Persist is_default to Directus for all addresses
    if (profile?.id && !String(profile.id).startsWith('guest')) {
      try {
        // Set is_default: true on selected address
        if (!String(id).startsWith('addr-')) {
          await fetch(`${DIRECTUS_URL}/items/addresses/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_default: true }),
          });
        }

        // Set is_default: false on all other addresses
        for (const addr of addresses) {
          if (String(addr.id) !== String(id) && !String(addr.id).startsWith('addr-')) {
            await fetch(`${DIRECTUS_URL}/items/addresses/${addr.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_default: false }),
            });
          }
        }

        // Update user profile billing address in Directus
        await fetch(`${DIRECTUS_URL}/items/user/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: fullAddress,
            city: targetAddr.city,
            state: targetAddr.state,
            zip: targetAddr.pincode,
            phone: targetAddr.phone,
          }),
        });
      } catch (e) {
        console.log('Directus address update error:', e);
      }
    }
  };

  // Order stats
  const orderCount = orders.length;
  const totalSpent = orders.reduce(
    (sum, o) => sum + (typeof o.total === 'number' ? o.total : Number(o.total) || 0),
    0
  );
  const memberSince = profile?.date_created
    ? new Date(profile.date_created as string).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      })
    : 'N/A';

  // Active default address derived directly from addresses state
  const defaultAddress = addresses.find((a) => a.is_default) || (addresses.length > 0 ? addresses[0] : null);
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-12 font-serif">
        <div className="animate-pulse text-[#80182a] font-semibold text-base">
          Loading account...
        </div>
      </div>
    );
  }

  const hasLoggedInUser = Boolean(
    session?.user || (profile?.id && !String(profile.id).startsWith('guest'))
  );

  if (!hasLoggedInUser) {
    return <AuthScreen initialMode="signin" />;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans antialiased flex flex-col">
      {/* External Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style jsx global>{`
        .font-serif-heading {
          font-family: 'Playfair Display', serif;
        }
        .font-sans-body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <Navbar />

      {/* Main Profile Body Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 font-sans-body flex-grow">
        {/* Welcome Section */}
        <div className="mb-10">
          <span className="text-[11px] uppercase tracking-widest text-[#855300] font-bold">
            My Account
          </span>
          <h1 className="font-serif-heading text-3xl md:text-4xl font-bold text-gray-900 mt-1">
            Hello, <em className="italic font-normal text-[#855300]">{profile.name as string}</em>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back to your personalized dashboard.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              {/* Avatar Frame */}
              <div
                className="relative mb-4 group cursor-pointer"
                onClick={() => alert('Avatar upload coming soon!')}
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#855300] to-[#f59e0b] rounded-full blur-sm opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <img
                  src={
                    (profile.avatar as string) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      (profile.name as string) || 'U'
                    )}&background=855300&color=fff`
                  }
                  alt="avatar"
                  className="relative w-28 h-28 rounded-full border-4 border-white shadow-md object-cover hover:scale-[1.02] transition duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition duration-200">
                  <Edit className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Basic Details */}
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {profile.name as string}
              </h2>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {profile.email as string}
              </p>



              {/* Stats Widgets */}
              <div className="grid grid-cols-3 gap-3 w-full mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Orders
                  </span>
                  <span className="text-lg font-black text-[#855300] mt-0.5 block">{orderCount}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Spent
                  </span>
                  <span className="text-lg font-black text-[#855300] mt-0.5 block">
                    ₹{totalSpent}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100/50">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Joined
                  </span>
                  <span className="text-xs font-black text-gray-700 mt-1.5 block truncate">
                    {memberSince}
                  </span>
                </div>
              </div>

              {/* Contact / Delivery details inside sidebar */}
              <div className="w-full text-left mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      Phone Number
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {(profile.phone as string) || defaultAddress?.phone || 'Not set'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#855300] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Default Billing Address
                      </span>
                      {defaultAddress && (
                        <span className="text-[9px] font-bold text-[#855300] bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 leading-relaxed mt-1">
                      {defaultAddress ? (
                        <>
                          <div className="text-gray-900 font-bold">{defaultAddress.address_line1}</div>
                          {defaultAddress.address_line2 && (
                            <div className="text-xs text-gray-600 mt-0.5">{defaultAddress.address_line2}</div>
                          )}
                          <div className="text-xs text-gray-600 mt-0.5">
                            {defaultAddress.city}, {defaultAddress.state} -{' '}
                            <span className="font-semibold text-gray-900">{defaultAddress.pincode}</span>
                          </div>
                        </>
                      ) : profile.address ? (
                        `${profile.address}, ${profile.city || ''}, ${profile.state || ''} ${
                          profile.zip || ''
                        }`
                      ) : (
                        <span className="text-gray-400 italic font-normal">No default address set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit / Sign Out CTA Buttons */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleOpenEditModal}
                  className="w-full bg-[#855300]/10 text-[#855300] hover:bg-[#855300] hover:text-white py-2.5 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Edit Info
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white py-2.5 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Address Book & Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Book Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Address Book</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your shipping destinations</p>
                </div>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="bg-[#855300] text-white hover:bg-[#653e00] py-2 px-4 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No addresses saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative ${
                        addr.is_default
                          ? 'border-2 border-[#855300] bg-amber-50/20 shadow-sm'
                          : 'border border-gray-200 bg-white hover:border-[#855300]/40 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              addr.is_default
                                ? 'bg-[#855300] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Home className="w-4 h-4" />
                          </div>
                          {addr.is_default && (
                            <span className="inline-flex items-center gap-1 bg-[#855300] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Default Billing
                            </span>
                          )}
                        </div>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete address"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Address Lines */}
                      <div className="space-y-1 mb-4 flex-1">
                        <div className="font-bold text-sm text-gray-900 leading-snug">
                          {addr.address_line1}
                        </div>
                        {addr.address_line2 && (
                          <div className="text-xs text-gray-600">{addr.address_line2}</div>
                        )}
                        <div className="text-xs text-gray-600">
                          {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium pt-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {addr.phone}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        {addr.is_default ? (
                          <span className="text-xs font-semibold text-[#855300] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#855300] animate-pulse"></span>
                            Active Billing Address
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="inline-flex items-center text-xs font-bold text-gray-700 hover:text-[#855300] bg-white hover:bg-amber-50 border border-gray-300 hover:border-[#855300] px-3.5 py-1.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Order History</h2>
                <p className="text-xs text-gray-500 mt-0.5">Track your shopping history and status</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    You haven&apos;t placed any orders yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    When you buy products, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id as string | number}
                      className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-[#855300]/15 transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-gray-900 text-sm">
                            Order #{order.id as string | number}
                          </div>
                          <span
                            className={`inline-block text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-full border ${getStatusStyle(
                              order.status as string
                            )}`}
                          >
                            {String(order.status).replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at as string).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-md">
                          <span className="font-semibold text-gray-600">Ship to:</span>{' '}
                          {order.shipping_address as string}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Total Amount
                          </span>
                          <span className="text-base font-black text-gray-900 block">
                            ₹{Number(order.total || 0).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-[#855300]/10 text-[#855300] hover:bg-[#855300] hover:text-white p-2.5 rounded-xl transition duration-200 flex items-center gap-1 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEditSave();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
              <input
                name="name"
                required
                value={editProfile.name || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
              <input
                name="phone"
                value={editProfile.phone || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
            <input
              name="address"
              value={editProfile.address || ''}
              onChange={handleEditChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
              <input
                name="city"
                value={editProfile.city || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
              <input
                name="state"
                value={editProfile.state || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ZIP / Pincode</label>
              <input
                name="zip"
                value={editProfile.zip || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
              <input
                name="country"
                value={editProfile.country || ''}
                onChange={handleEditChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition duration-150"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#855300] text-white hover:bg-[#653e00] font-bold text-xs transition duration-150 shadow-sm"
              disabled={editSaving}
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Address Modal */}
      <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add Address">
        <form className="space-y-4" onSubmit={handleAddAddress}>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 1</label>
            <input
              required
              name="address_line1"
              placeholder="House, Flat, Building name"
              value={addressForm.address_line1 || ''}
              onChange={handleAddressFormChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              name="address_line2"
              placeholder="Street, Landmark, Locality"
              value={addressForm.address_line2 || ''}
              onChange={handleAddressFormChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
              <input
                required
                name="city"
                placeholder="City"
                value={addressForm.city || ''}
                onChange={handleAddressFormChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
              <input
                required
                name="state"
                placeholder="State"
                value={addressForm.state || ''}
                onChange={handleAddressFormChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Pincode</label>
              <input
                required
                name="pincode"
                placeholder="6-digit Pincode"
                value={addressForm.pincode || ''}
                onChange={handleAddressFormChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
              <input
                required
                name="phone"
                placeholder="Contact Number"
                value={addressForm.phone || ''}
                onChange={handleAddressFormChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#855300]/20 focus:border-[#855300] outline-none transition duration-150"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition duration-150"
              onClick={() => setAddressModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#855300] text-white hover:bg-[#653e00] font-bold text-xs transition duration-150 shadow-sm"
              disabled={addressSaving}
            >
              {addressSaving ? 'Saving...' : 'Add Address'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.id} Details` : ''}
      >
        {selectedOrder && (
          <div className="space-y-5 pt-2 font-sans-body">
            {/* Status & Price widgets inside Modal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Status
                </span>
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mt-1.5 ${getStatusStyle(
                    selectedOrder.status as string
                  )}`}
                >
                  {String(selectedOrder.status).replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  Total Paid
                </span>
                <span className="text-lg font-black text-gray-900 mt-1 block">
                  ₹{Number(selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Placement Details */}
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
              <div>
                <span className="font-semibold text-gray-500">Shipping Address:</span>
                <p className="text-gray-800 font-medium mt-0.5 leading-relaxed">
                  {selectedOrder.shipping_address as string}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-500">Placed On:</span>
                <p className="text-gray-800 font-medium mt-0.5">
                  {new Date(selectedOrder.created_at as string).toLocaleString(undefined, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Product items in Order */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Order Items
              </div>
              {orderProductsLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-4">
                  <div className="w-4 h-4 border-2 border-[#855300] border-t-transparent rounded-full animate-spin"></div>
                  Loading order items...
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white">
                  {orderProducts.length === 0 ? (
                    <div className="p-4 text-xs text-gray-500 italic">No product details found.</div>
                  ) : (
                    orderProducts.map((product) => (
                      <div
                        key={product.id as string | number}
                        className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition duration-150"
                      >
                        {product.images &&
                        Array.isArray(product.images) &&
                        product.images.length > 0 &&
                        product.images[0]?.directus_files_id ? (
                          <img
                            src={getAssetUrl(product.images[0].directus_files_id)}
                            alt={product.name as string}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] text-gray-400 border border-gray-100 shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 leading-snug truncate">
                            {product.name as string}
                          </h4>
                          <span className="text-xs text-gray-500">{product.category as string}</span>
                        </div>
                        <div className="text-right font-black text-sm text-[#855300]">
                          ₹{Number(product.Discounter_price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition duration-150"
                onClick={() => setSelectedOrder(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* New UI Footer */}
      <footer className="bg-[#2f312f] text-white py-12 px-6 md:px-10 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8 font-sans-body">
          <div className="flex flex-col gap-3">
            <span className="font-serif-heading text-2xl font-bold text-[#ffddb8]">Encender</span>
            <p className="text-sm text-gray-300">© 2026 Encender. Crafted with Heritage across India.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto text-sm text-gray-300">
            <div className="flex flex-col gap-2">
              <Link href="/shipping" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <Link href="/refunds" className="hover:text-white transition-colors">
                Refunds
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/919028502581"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors text-[#f59e0b] font-medium"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
