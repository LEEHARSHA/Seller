'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Bell, Lock, Palette, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const toast = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings Saved', 'Notification preferences updated.');
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white tracking-tight">Portal Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Configure email notifications, security preferences, and portal options.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Notifications */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" /> Notification Preferences
            </h3>

            <div className="space-y-3 divide-y divide-slate-800/60">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-bold text-white">Product Review & Approval Alerts</p>
                  <p className="text-[11px] text-slate-400">Receive notifications when your pending products are approved or rejected.</p>
                </div>
                <input
                  type="checkbox"
                  checked={approvalAlerts}
                  onChange={(e) => setApprovalAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-bold text-white">Low Stock Inventory Warnings</p>
                  <p className="text-[11px] text-slate-400">Get alerted when stock drops below configured low-stock thresholds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={lowStockAlerts}
                  onChange={(e) => setLowStockAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-bold text-white">System Email Newsletters</p>
                  <p className="text-[11px] text-slate-400">Receive monthly marketplace performance reports & seller policy updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> Account Security & Firebase Authentication
            </h3>
            <p className="text-xs text-slate-400">
              Your session credentials are secure and token-verified on every API call. To change your account password, use the Firebase Auth password reset option on login.
            </p>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
