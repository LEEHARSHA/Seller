'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { PackageSearch, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl">
          <PackageSearch className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or seller portal resource you requested does not exist or has been moved.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Back to Seller Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
