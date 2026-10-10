'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { authState, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (authState === 'signed-in') {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [authState, loading, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Loading Seller Portal...</p>
      </div>
    </div>
  );
}
