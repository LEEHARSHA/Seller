'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { HelpCircle, CheckCircle2, ShieldAlert, Image, Mail, Phone, FileText } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'Why are my newly submitted products in Pending status?',
      a: 'All seller product listings undergo quality and safety verification by the Fitness Species admin team to ensure marketplace authenticity and compliance. Approvals are typically completed within 24 hours.',
    },
    {
      q: 'What happens if a product is Rejected?',
      a: 'If a product is rejected, a prominent panel will display the exact rejection reason on the product detail page. You can click Edit & Resubmit to update the specifications or photos and submit again for approval.',
    },
    {
      q: 'Can I sell prescription medicines on Fitness Species?',
      a: 'No. Prescription medicines are strictly prohibited. Sellers may only list approved health supplements, wellness products, gym wear, fitness equipment, footwear, and healthy protein snacks.',
    },
    {
      q: 'What are the product image resolution guidelines?',
      a: 'Product images must be high resolution (minimum 800x800px recommended), clear, well-lit, and presented against clean backgrounds without watermark clutter.',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white tracking-tight">Seller Help Center & Guidelines</h1>
          <p className="text-xs text-slate-400 mt-1">Review listing requirements, product approval rules, and seller support FAQs.</p>
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="default" padding="md" className="space-y-2 border-emerald-500/20 bg-emerald-950/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Allowed Categories</h3>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Supplements, Wellness Nutrition, Gym Apparel, Exercise Equipment, Footwear, & Protein Snacks.
            </p>
          </Card>

          <Card variant="default" padding="md" className="space-y-2 border-rose-500/20 bg-rose-950/20">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Prohibited Items</h3>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              Prescription pharmaceuticals, illegal steroids, misleading health claims, and unverified drugs.
            </p>
          </Card>

          <Card variant="default" padding="md" className="space-y-2 border-cyan-500/20 bg-cyan-950/20">
            <Image className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Media Guidelines</h3>
            <p className="text-[11px] text-cyan-200/80 leading-relaxed">
              Minimum 800x800px resolution, clean lighting, no third-party watermarks or price tags on photos.
            </p>
          </Card>
        </div>

        {/* FAQs */}
        <Card variant="default" padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" /> Frequently Asked Questions
          </h3>

          <div className="divide-y divide-slate-800/80 space-y-4 pt-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-1">
                <h4 className="text-xs font-bold text-white">{faq.q}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Support Panel */}
        <Card variant="glass" padding="md" className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Need Additional Assistance?</h3>
            <p className="text-xs text-slate-400">Our seller support team is available Monday through Saturday (9 AM - 6 PM IST).</p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-400 shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>sellers@fitnessspecies.com</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
