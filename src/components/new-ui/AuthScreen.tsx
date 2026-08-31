'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  ArrowLeft,
  HelpCircle,
  Lock,
  ShieldCheck,
  Headphones,
  Eye,
  EyeOff,
} from 'lucide-react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
  ? process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '')
  : '';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
}

export default function AuthScreen({ initialMode = 'signup' }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/account' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }

      try {
        // 1. Check if email already exists in Directus database
        const checkRes = await fetch(
          `${DIRECTUS_URL}/items/user?filter[email][_eq]=${encodeURIComponent(cleanEmail)}`
        );
        const checkJson = await checkRes.json();
        if (Array.isArray(checkJson?.data) && checkJson.data.length > 0) {
          setMessage('An account with this email already exists. Please sign in.');
          setMode('signin');
          setLoading(false);
          return;
        }

        // 2. Format phone number
        const cleanPhone = phone.trim();
        const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91 ${cleanPhone}`;

        // 3. Save new user into Directus database
        const createRes = await fetch(`${DIRECTUS_URL}/items/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            email: cleanEmail,
            phone: formattedPhone,
            created_at: new Date().toISOString(),
          }),
        });

        const createJson = await createRes.json();
        if (!createRes.ok || !createJson?.data) {
          throw new Error(createJson?.errors?.[0]?.message || 'Failed to save account in database.');
        }

        const newUser = createJson.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('encender_user_profile', JSON.stringify(newUser));
        }

        setMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/account';
        }, 800);
      } catch (err: any) {
        setMessage(err.message || 'Error connecting to database. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // mode === 'signin'
      try {
        const checkRes = await fetch(
          `${DIRECTUS_URL}/items/user?filter[email][_eq]=${encodeURIComponent(cleanEmail)}`
        );
        const checkJson = await checkRes.json();
        if (!Array.isArray(checkJson?.data) || checkJson.data.length === 0) {
          setMessage('No account found with this email. Please click "Create Account" to register.');
          setLoading(false);
          return;
        }

        const foundUser = checkJson.data[0];
        if (typeof window !== 'undefined') {
          localStorage.setItem('encender_user_profile', JSON.stringify(foundUser));
        }

        setMessage('Signed in successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/account';
        }, 800);
      } catch (err: any) {
        setMessage(err.message || 'Error connecting to database. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] font-sans antialiased flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="w-full top-0 shadow-xs bg-[#fbf9f6] border-b border-[#e4e2df]">
        <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1280px] mx-auto">
          <Link href="/" className="font-serif text-2xl font-bold text-[#80182a] tracking-tight">
            Encender
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-[#574142] hover:text-[#80182a] transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <a
              href="https://wa.me/919028502581?text=Hi%2C%20I%20need%20help%20with%20Encender%20Account"
              target="_blank"
              rel="noreferrer"
              className="text-[#574142] hover:text-[#80182a] transition-colors duration-200"
              title="Need Help?"
            >
              <HelpCircle className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-start justify-center py-8 md:py-12 px-4 md:px-6 max-w-[1180px] mx-auto w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Stable Editorial Image Card (Separated & Fixed Shape) */}
          <div className="hidden md:flex relative rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#e4e2df] h-[640px] flex-col justify-end p-8 lg:p-10 bg-[#e4e2df]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUDYjzJuDJtLZsGnweKPhK9NrmU_67J67oOjR5BJHWPHqzspF7w5uLP5KTz_2rYefJEo8whvZXxULmIqs40redlT8L_l7-dzyEEUPIKS9dsYxO9fd9y9Jl5Kvt4FFWhV9XXowZVfK2p4mqZQk9zaD6FH7pcV8vWazbet-a6Vc1OqQMsxLiqNxO2zGz6dtI_csfPrtq_6hbQTsTMS2KE_BdnrkeZKgXblHrMfHi2uQeKTXGtNvlXKERNA"
              alt="Encender Modern Heritage"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
            <div className="relative z-20 text-white">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wider uppercase mb-3 text-amber-200 border border-white/20">
                Artisanal Luxury
              </span>
              <h2 className="font-serif text-3xl font-bold mb-2 leading-tight drop-shadow-sm">
                Modern Heritage
              </h2>
              <p className="text-white/90 text-sm leading-relaxed max-w-sm font-light">
                Curated gifting that balances artisanal tradition with seamless modern convenience.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Form (Separate White Box) */}
          <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#e4e2df] p-6 sm:p-10 flex flex-col justify-center max-w-md mx-auto md:max-w-none">
            <div className="w-full">
              
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1c1a] text-center mb-6">
                Welcome to Encender
              </h1>

              {/* Auth Tabs */}
              <div className="flex border-b border-[#e4e2df] mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setMessage(null); }}
                  className={`flex-1 text-center py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'text-[#80182a] border-b-2 border-[#80182a] font-bold'
                      : 'text-[#574142] hover:text-[#80182a]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setMessage(null); }}
                  className={`flex-1 text-center py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'text-[#80182a] border-b-2 border-[#80182a] font-bold'
                      : 'text-[#574142] hover:text-[#80182a]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
                  {message}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Full Name
                    </label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#fbf9f6] border border-[#e4e2df] rounded-lg px-3.5 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#8a7172] focus:border-[#80182a] focus:ring-1 focus:ring-[#80182a] transition-colors outline-none"
                      placeholder="Enter your full name"
                      type="text"
                    />
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      WhatsApp Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-[#e4e2df] bg-[#f5f3f0] text-[#574142] rounded-l-lg text-sm font-medium">
                        +91
                      </span>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#fbf9f6] border border-[#e4e2df] rounded-r-lg px-3.5 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#8a7172] focus:border-[#80182a] focus:ring-1 focus:ring-[#80182a] transition-colors outline-none"
                        placeholder="Mobile number"
                        type="tel"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fbf9f6] border border-[#e4e2df] rounded-lg px-3.5 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#8a7172] focus:border-[#80182a] focus:ring-1 focus:ring-[#80182a] transition-colors outline-none"
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#fbf9f6] border border-[#e4e2df] rounded-lg px-3.5 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#8a7172] focus:border-[#80182a] focus:ring-1 focus:ring-[#80182a] transition-colors outline-none pr-10"
                      placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7172] hover:text-[#80182a] transition-colors p-1"
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1b1c1a] mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#fbf9f6] border border-[#e4e2df] rounded-lg px-3.5 py-2.5 text-sm text-[#1b1c1a] placeholder:text-[#8a7172] focus:border-[#80182a] focus:ring-1 focus:ring-[#80182a] transition-colors outline-none pr-10"
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7172] hover:text-[#80182a] transition-colors p-1"
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#80182a] text-white font-bold text-sm py-3 rounded-lg hover:bg-[#5f0017] transition-colors shadow-xs flex justify-center items-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? 'Processing...' : mode === 'signup' ? 'Verify & Proceed' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[#e4e2df]" />
                <span className="mx-4 text-xs text-[#8a7172] uppercase tracking-wider font-semibold">
                  or
                </span>
                <div className="flex-grow border-t border-[#e4e2df]" />
              </div>

              {/* Social Auth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white border border-[#e4e2df] text-[#1b1c1a] font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-[#fbf9f6] hover:border-[#8a7172] transition-colors flex justify-center items-center gap-3 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <a
                  href="https://wa.me/919028502581?text=Hi%20Encender!%20I%20would%20like%20to%20inquire%20about%20my%20account"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#fbf9f6] border border-[#e4e2df] text-[#1b1c1a] font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-colors flex justify-center items-center gap-3 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.027-.478-1.614-.668-2.651-2.316-2.731-2.424-.08-.108-.65-8.66-.65-1.654 0-.787.41-1.177.556-1.336.145-.16.318-.199.424-.199.106 0 .212.001.305.006.098.005.23-.037.36.275.133.318.455 1.111.494 1.192.039.08.066.175.013.281-.053.106-.08.172-.16.265-.08.093-.168.207-.24.278-.08.079-.163.165-.07.324.093.16.413.681.885 1.102.608.542 1.121.71 1.28.79.16.079.252.066.345-.04.093-.106.398-.464.504-.623.106-.16.212-.133.358-.079.146.053.928.437 1.087.516.16.08.265.12.305.186.04.066.04.385-.104.79z"/>
                  </svg>
                  Continue with WhatsApp
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex justify-between items-center px-2 pt-4 border-t border-[#e4e2df] opacity-80">
                <div className="flex items-center gap-1.5 text-[#574142]">
                  <Lock className="w-3.5 h-3.5 text-[#80182a]" />
                  <span className="text-[11px] font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#574142]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#80182a]" />
                  <span className="text-[11px] font-medium">Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#574142]">
                  <Headphones className="w-3.5 h-3.5 text-[#80182a]" />
                  <span className="text-[11px] font-medium">Support</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
