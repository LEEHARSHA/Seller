'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Product, ProductStatus } from '../../types';
import { getSellerProductsApi } from '../../lib/api/products';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Eye,
  Edit,
  ShieldCheck,
} from 'lucide-react';

const MarketplaceSphereScene = dynamic(() => import('../../components/3d/MarketplaceSphereScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[160px] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
    </div>
  ),
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, sellerProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setProductsError(null);
      try {
        const data = await getSellerProductsApi('all');
        setProducts(data);
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
        setProductsError(err instanceof Error ? err.message : 'Unable to load seller products.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProducts = products.length;
  const pendingCount = products.filter((p) => p.status === 'pending').length;
  const approvedCount = products.filter((p) => p.status === 'approved').length;
  const rejectedCount = products.filter((p) => p.status === 'rejected').length;

  const tableColumns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
            {typeof p.images[0] === 'string' ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div>
            <p className="font-bold text-white text-xs line-clamp-1">{p.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (p) => <span className="text-xs font-medium text-slate-300">{p.category}</span>,
    },
    {
      header: 'Price',
      cell: (p) => (
        <div>
          <p className="font-bold text-emerald-400 text-xs">₹{p.price.toLocaleString('en-IN')}</p>
          {p.compareAtPrice && (
            <p className="text-[10px] text-slate-500 line-through">₹{p.compareAtPrice.toLocaleString('en-IN')}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      cell: (p) => (
        <span
          className={`text-xs font-semibold ${
            p.stock === 0
              ? 'text-rose-400'
              : p.stock < (p.lowStockThreshold || 10)
              ? 'text-amber-400'
              : 'text-slate-300'
          }`}
        >
          {p.stock} units
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => <Badge status={p.status} size="sm" />,
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${p.id}`);
            }}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${p.id}/edit`);
            }}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Hero Banner */}
        <Card variant="glass" padding="none" className="overflow-hidden border-slate-800/80 relative">
          <div className="p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Store Overview & Commercial Metrics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Good morning,{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {sellerProfile?.ownerName || user?.displayName || 'Store Partner'}
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {sellerProfile ? (
                  <>Here is what is happening with <strong className="text-slate-200">{sellerProfile.businessName}</strong>. Manage inventory, monitor approvals, and submit new product lines.</>
                ) : (
                  <>Seller profile setup is required before your business details can be displayed.</>
                )}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => router.push('/products/new')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  List New Product
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/products')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  View All Products
                </Button>
              </div>
            </div>

            {/* 3D Sphere Element */}
            <div className="w-full md:w-56 h-40 shrink-0">
              <MarketplaceSphereScene />
            </div>
          </div>
        </Card>

      {productsError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
          Product data is unavailable: {productsError}
        </div>
      )}

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" padding="md" className="border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
                <h3 className="text-2xl font-black text-white mt-1">{totalProducts}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Active product entries in store
            </p>
          </Card>

          <Card variant="default" padding="md" className="border-amber-500/20 bg-amber-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Approval</p>
                <h3 className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-amber-400/80 mt-4">Under review by Fitness Species team</p>
          </Card>

          <Card variant="default" padding="md" className="border-emerald-500/20 bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Products</p>
                <h3 className="text-2xl font-black text-emerald-300 mt-1">{approvedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-4">Visible in live marketplace app</p>
          </Card>

          <Card variant="default" padding="md" className="border-rose-500/20 bg-rose-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Rejected / Action Needed</p>
                <h3 className="text-2xl font-black text-rose-300 mt-1">{rejectedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-rose-400/80 mt-4">Requires seller updates & resubmission</p>
          </Card>
        </div>

        {/* Product Status Explanation Cards */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Approval Workflow Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 flex space-x-3 items-start">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">Pending Review</h4>
                <p className="text-[11px] text-amber-200/70 mt-1 leading-snug">
                  Submitted products wait for admin team quality check before listing.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex space-x-3 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-300">Approved & Live</h4>
                <p className="text-[11px] text-emerald-200/70 mt-1 leading-snug">
                  Visible to all Fitness Species app customers after admin approval.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 flex space-x-3 items-start">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300">Rejected / Changes Needed</h4>
                <p className="text-[11px] text-rose-200/70 mt-1 leading-snug">
                  Review rejection reason, edit specifications/photos, and resubmit for re-review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Products</h3>
              <p className="text-xs text-slate-400">Latest product entries and review status tracking.</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Manage Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table
              columns={tableColumns}
              data={products.slice(0, 5)}
              keyExtractor={(p) => p.id}
              isLoading={loading}
              onRowClick={(p) => router.push(`/products/${p.id}`)}
            />
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {products.slice(0, 5).map((p) => (
              <Card
                key={p.id}
                variant="interactive"
                padding="sm"
                onClick={() => router.push(`/products/${p.id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    {typeof p.images[0] === 'string' ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500 m-auto mt-3" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-bold mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                    <div className="mt-1">
                      <Badge status={p.status} size="sm" />
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
