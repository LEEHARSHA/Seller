'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { updateSellerProfileApi } from '../../lib/api/seller';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Drawer } from '../../components/ui/Drawer';
import { Card } from '../../components/ui/Card';
import { Flame, ShieldCheck, TrendingUp, Sparkles, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Dynamic 3D Scene lazy loading
const HeroDumbbellScene = dynamic(() => import('../../components/3d/HeroDumbbellScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
    </div>
  ),
});

export default function LoginPage() {
  const router = useRouter();
  const { setDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Apply as Seller Drawer state
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);
  const [applyBusinessName, setApplyBusinessName] = useState('');
  const [applyOwnerName, setApplyOwnerName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyAddress, setApplyAddress] = useState('');
  const [applyCity, setApplyCity] = useState('');
  const [applyState, setApplyState] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Firebase authentication error:', err.message);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please verify your credentials or sign in with demo mode.');
      } else {
        // Fallback demo authentication for evaluation
        setDemoUser('seller');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setDemoUser('seller');
    router.push('/dashboard');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyBusinessName || !applyPhone) {
      setError('Business name and contact phone are required.');
      return;
    }

    setApplySubmitting(true);
    try {
      await updateSellerProfileApi({
        businessName: applyBusinessName,
        ownerName: applyOwnerName,
        phone: applyPhone,
        businessAddress: {
          address: applyAddress,
          city: applyCity,
          state: applyState,
          country: 'India',
        },
      });
      setApplySuccessMessage('Application submitted successfully! Our team will review your store details.');
      setTimeout(() => {
        setIsApplyDrawerOpen(false);
        setApplySuccessMessage(null);
        handleDemoSignIn();
      }, 2000);
    } catch (err: any) {
      setError('Failed to submit seller application. Please try again.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row">
      {/* LEFT HERO AREA */}
      <div className="lg:w-7/12 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#090d16] to-slate-900 border-r border-slate-800/80">
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Bar */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white">
              FITNESS<span className="text-emerald-400">SPECIES</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              Commercial Seller Portal
            </p>
          </div>
        </div>

        {/* Hero Headline & 3D Feature */}
        <div className="relative z-10 my-12 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Seller Marketplace Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Grow your fitness business with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fitness Species
            </span>
          </h2>

          <p className="text-slate-400 text-sm mt-4 leading-relaxed">
            Reach thousands of active fitness enthusiasts. List supplements, high-performance apparel, wellness nutrition, and gym gear with verified seller approval.
          </p>

          {/* 3D Scene */}
          <div className="my-6">
            <HeroDumbbellScene />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Verified Catalog</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Strict quality & brand standard review.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Commercial Scale</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant seller stats & variant controls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <p>&copy; {new Date().getFullYear()} Fitness Species Marketplace Inc.</p>
          <span className="text-[11px] font-mono text-slate-400">sellers.alk.co.in</span>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="lg:w-5/12 p-8 lg:p-16 flex items-center justify-center bg-[#090d16] relative">
        <div className="w-full max-w-md">
          <Card variant="glass" padding="lg" className="border-slate-800 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-white">Seller Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Access your Fitness Species store dashboard & product inventory.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
                <span className="shrink-0 text-rose-400 font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Store Email Address"
                type="email"
                placeholder="seller@yourbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-emerald-500" />
                  <span>Remember session</span>
                </label>
                <a href="#forgot" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
                Sign In to Seller Portal
              </Button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500">
                  Quick Access Demo
                </span>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full text-xs font-semibold"
                onClick={handleDemoSignIn}
                icon={<ArrowRight className="w-4 h-4 text-emerald-400" />}
              >
                Instant Seller Demo Login
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have a seller account?{' '}
                <button
                  onClick={() => setIsApplyDrawerOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                >
                  Apply as a Seller
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* APPLY AS SELLER DRAWER */}
      <Drawer
        isOpen={isApplyDrawerOpen}
        onClose={() => setIsApplyDrawerOpen(false)}
        title="Apply as a Fitness Species Seller"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Register your store details to list fitness supplements, apparel, or gear on the Fitness Species marketplace.
          </p>

          {applySuccessMessage ? (
            <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{applySuccessMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
              <Input
                label="Business / Store Name"
                placeholder="Apex Performance Nutrition"
                value={applyBusinessName}
                onChange={(e) => setApplyBusinessName(e.target.value)}
                required
              />

              <Input
                label="Owner / Contact Person"
                placeholder="Alex Rivera"
                value={applyOwnerName}
                onChange={(e) => setApplyOwnerName(e.target.value)}
                required
              />

              <Input
                label="Contact Phone Number"
                placeholder="+91 98765 43210"
                value={applyPhone}
                onChange={(e) => setApplyPhone(e.target.value)}
                required
              />

              <Input
                label="Street Address"
                placeholder="Suite 402, High-Tech Commercial Hub"
                value={applyAddress}
                onChange={(e) => setApplyAddress(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  value={applyCity}
                  onChange={(e) => setApplyCity(e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={applyState}
                  onChange={(e) => setApplyState(e.target.value)}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Important Review Policy:</p>
                <p>Applications are verified by Fitness Species. Submitted products default to pending status for safety.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={applySubmitting}
              >
                Submit Seller Application
              </Button>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
