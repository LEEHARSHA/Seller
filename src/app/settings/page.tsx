'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Bell, Info, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white tracking-tight">Portal Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Review account security and available portal preferences.</p>
        </div>

        <div className="space-y-6">
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" /> Notification Preferences
            </h3>
            <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-200">Notification settings are unavailable</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  The seller service does not currently provide a settings endpoint. No notification preferences have been loaded or saved.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> Account Security & Firebase Authentication
            </h3>
            <p className="text-xs text-slate-400">
              Your session credentials are secure and token-verified on every API call. To change your account password, use the Firebase Auth password reset option on login.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
