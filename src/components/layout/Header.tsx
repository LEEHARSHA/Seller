'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../ui/Dropdown';

export interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const router = useRouter();
  const { user, sellerProfile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notifications = [
    {
      id: '1',
      title: 'Product Review Submitted',
      desc: 'High-Protein Crunch Energy Bar submitted for review.',
      time: '10 mins ago',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: '2',
      title: 'Store Verification Active',
      desc: 'Apex Performance Nutrition seller account is active.',
      time: '1 hour ago',
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: '3',
      title: 'Image Guideline Note',
      desc: 'Remember to upload high resolution 800x800px product photos.',
      time: 'Yesterday',
      icon: CheckCircle2,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
  ];

  const profileMenuItems = [
    {
      label: 'Store Profile',
      icon: <User className="w-4 h-4 text-slate-400" />,
      onClick: () => router.push('/profile'),
    },
    {
      label: 'Help & Guidelines',
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      onClick: () => router.push('/help'),
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: async () => {
        await logout();
        router.push('/login');
      },
      danger: true,
    },
  ];

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search store products, SKU, category..."
            className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </form>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Store Alerts</h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3.5 hover:bg-slate-800/50 transition-colors flex space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <Dropdown
          align="right"
          items={profileMenuItems}
          trigger={
            <button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-md">
                {user?.displayName?.charAt(0) || 'S'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                  {user?.displayName || 'Seller Account'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {sellerProfile?.businessName || 'Apex Performance'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            </button>
          }
        />
      </div>
    </header>
  );
};
