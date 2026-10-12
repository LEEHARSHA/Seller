'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Boxes,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Flame,
  X,
  BadgeAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { sellerProfile } = useAuth();

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Add Product', href: '/products/new', icon: PlusCircle },
  ];

  const comingSoonNav = [
    { label: 'Inventory', href: '/inventory', icon: Boxes },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const accountNav = [
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Help Center', href: '/help', icon: HelpCircle },
  ];

  const content = (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Flame className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                FITNESS<span className="text-emerald-400">SPECIES</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Seller Portal</p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="px-4 py-6 space-y-7 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Main Menu */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Management
            </p>
            <div className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Seller commercial tools */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Commercial Tools
            </p>
            <div className="space-y-1">
              <div
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed"
                title="Orders require an order data model and seller-scoped backend endpoints."
                aria-disabled="true"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>Orders</span>
                </div>
                <span className="text-[9px] font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  Backend required
                </span>
              </div>
              {comingSoonNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account & Support */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              System & Help
            </p>
            <div className="space-y-1">
              {accountNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Status Card Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              {sellerProfile?.businessName?.charAt(0) || 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {sellerProfile?.businessName || 'Fitness Seller'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{sellerProfile?.ownerName || 'Complete seller profile'}</p>
            </div>
          </div>
          {sellerProfile ? (
            <Badge status={sellerProfile.status} size="sm" pulse={false} />
          ) : (
            <Badge status="neutral" size="sm" pulse={false}>Not set up</Badge>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">{content}</div>

      {/* Mobile Slide-Over Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
