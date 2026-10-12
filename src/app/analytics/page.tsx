'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { getSellerProductsApi } from '../../lib/api/products';
import { Product } from '../../types';
import { BarChart3, Boxes, Package, ShoppingBag } from 'lucide-react';

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        setProducts(await getSellerProductsApi('all'));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load seller analytics.');
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, []);

  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  const pendingProducts = products.filter((product) => product.status === 'pending').length;
  const approvedProducts = products.filter((product) => product.status === 'approved').length;
  const categoryCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});

  const metrics = [
    { label: 'Products', value: loading ? 'Loading…' : String(products.length), icon: Package },
    { label: 'Units in stock', value: loading ? 'Loading…' : String(totalStock), icon: Boxes },
    { label: 'Pending review', value: loading ? 'Loading…' : String(pendingProducts), icon: ShoppingBag },
    { label: 'Approved products', value: loading ? 'Loading…' : String(approvedProducts), icon: BarChart3 },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="border-b border-slate-800 pb-5">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <BarChart3 className="h-4 w-4" />
            Seller performance
          </div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">Product and inventory metrics from your seller catalog.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            Analytics data is unavailable: {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label} variant="default" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
                <Icon className="h-6 w-6 text-emerald-400" />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="text-base font-bold text-white">Products by category</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-400">Loading product metrics…</p>
          ) : Object.keys(categoryCounts).length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No product data is available.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-800">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-slate-300">{category}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="border border-amber-500/30 bg-amber-950/20">
          <h2 className="text-sm font-bold text-amber-200">Order analytics unavailable</h2>
          <p className="mt-2 text-sm text-amber-100/80">
            Sales, revenue, and order trends are not shown because the backend does not currently expose seller order records.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
