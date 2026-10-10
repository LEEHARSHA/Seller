'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateSellerProfileApi } from '../../lib/api/seller';
import { User, Store, Phone, Mail, MapPin, ShieldCheck, Save, Building } from 'lucide-react';

export default function ProfilePage() {
  const { sellerProfile, user, refreshProfile, authError } = useAuth();
  const toast = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sellerProfile) return;
    setBusinessName(sellerProfile.businessName);
    setOwnerName(sellerProfile.ownerName);
    setPhone(sellerProfile.phone);
    setAddress(sellerProfile.businessAddress?.address || '');
    setCity(sellerProfile.businessAddress?.city || '');
    setState(sellerProfile.businessAddress?.state || '');
    setPostalCode(sellerProfile.businessAddress?.postalCode || '');
  }, [sellerProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSellerProfileApi({
        businessName,
        ownerName,
        phone,
        businessAddress: {
          address,
          city,
          state,
          country: 'India',
          postalCode,
        },
      });
      await refreshProfile();
      toast.success('Profile Saved', 'Store information updated successfully.');
    } catch (err: any) {
      toast.error('Update Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Seller Profile</h1>
              <p className="text-xs text-slate-400 mt-1">Manage your commercial business profile and contact address.</p>
            </div>
            {sellerProfile ? (
              <Badge status={sellerProfile.status} size="md" />
            ) : (
              <Badge status="neutral" size="md">Profile setup required</Badge>
            )}
          </div>
        </div>

        {authError && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
            {authError}
          </div>
        )}

        {/* Profile Card Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Business Info */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" /> Store & Business Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registered Store / Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                icon={<Building className="w-4 h-4" />}
                required
              />

              <Input
                label="Owner / Managing Director Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Store Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                required
              />

              <Input
                label="Account Email (System Immutable)"
                value={user?.email || sellerProfile?.email || ''}
                disabled
                icon={<Mail className="w-4 h-4" />}
                helperText="Email is managed via Firebase Auth security."
              />
            </div>
          </Card>

          {/* Section 2: Address */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" /> Commercial Business Address
            </h3>

            <Input
              label="Street Address / Building"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
              <Input label="Postal / Pincode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </Card>

          {/* Role Security Note */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seller profile: <strong>{sellerProfile?.status || 'Setup required'}</strong></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">UID: {user?.uid || 'Unavailable'}</span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={saving} icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
