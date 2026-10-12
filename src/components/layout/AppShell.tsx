'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { authState, loading, authError } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    const protectedPaths = ['/dashboard', '/products', '/profile', '/settings', '/inventory', '/analytics'];
    const shouldProtect = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (shouldProtect && authState !== 'signed-in') {
      router.replace('/login');
    }
  }, [authState, loading, pathname, router]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-slate-950">
        {authState === 'signed-in' && (
          <>
            <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Header onMobileMenuToggle={() => setMobileSidebarOpen(true)} />
              {authError && (
                <div role="alert" className="mx-4 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 lg:mx-8">
                  {authError}
                </div>
              )}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
              <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-400">
                Fitness Species Seller Portal &copy; {new Date().getFullYear()} Fitness Species Marketplace. All rights reserved.
              </footer>
            </div>
          </>
        )}

        {authState !== 'signed-in' && (
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
            {authError && (
              <div className="px-6 pb-4 text-xs text-rose-300">{authError}</div>
            )}
          </div>
        )}
      </div>
    </ToastProvider>
  );
};
