'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { getSellerProductByIdApi } from '../../../lib/api/products';
import { Product } from '../../../types';
import {
  ArrowLeft,
  Edit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const item = await getSellerProductByIdApi(productId);
        setProduct(item);
      } catch (err) {
        setProduct(null);
        setLoadError(err instanceof Error ? err.message : 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/4" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <div className="text-center py-16 space-y-4">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">{loadError ? 'Product Unavailable' : 'Product Not Found'}</h2>
          <p className="text-xs text-slate-400">
            {loadError || 'This product record does not exist or has been removed.'}
          </p>
          <Button variant="primary" onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </AppShell>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
    : [];

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/products')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Products
          </Button>

          <Button
            variant="primary"
            onClick={() => router.push(`/products/${product.id}/edit`)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit Product
          </Button>
        </div>

        {/* PROMINENT REJECTION PANEL (IF REJECTED) */}
        {product.status === 'rejected' && (
          <Card variant="default" padding="lg" className="border-rose-500/40 bg-rose-950/40 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-rose-200">Changes Required Before Approval</h3>
                  <Badge status="rejected" size="sm" />
                </div>
                <p className="text-xs text-rose-300 mt-1 font-semibold">Rejection Reason:</p>
                <div className="mt-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
                  {product.rejectionReason || 'Specifications or image quality did not meet standard marketplace requirements.'}
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-rose-900/40">
                  <p className="text-xs text-rose-300/80">
                    Make requested updates and click resubmit. Your product will return to pending review.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                    icon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Edit & Resubmit
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Product Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              {images[selectedImageIndex] ? (
                <img src={images[selectedImageIndex]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <Package className="h-12 w-12" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border overflow-hidden shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Badge status={product.status} />
                <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl font-black text-white leading-tight">{product.name}</h1>
              <p className="text-xs font-semibold text-slate-400 mt-1">Brand: {product.brand}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Selling Price</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl font-black text-emerald-400">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-slate-500 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Stock Quantity</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">{product.stock} units</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h4>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">{product.category}</span>
                <span className="text-slate-500">/</span>
                <span className="px-3 py-1 rounded-lg bg-slate-800/60 text-slate-300">{product.subCategory || 'General'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {product.description || 'No detailed description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Specifications & Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specs */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Technical Specifications
            </h3>
            <div className="divide-y divide-slate-800 text-xs">
              {Object.entries(product.specifications || {}).length === 0 ? (
                <p className="text-slate-500 py-3 text-center">No specifications defined.</p>
              ) : (
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="font-semibold text-slate-100">{value}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Variants */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Product Variants
            </h3>
            <div className="divide-y divide-slate-800 text-xs">
              {!product.variants || product.variants.length === 0 ? (
                <p className="text-slate-500 py-3 text-center">Standard single product entry (no variants).</p>
              ) : (
                product.variants.map((v) => (
                  <div key={v.id} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-white">{v.title}</span>
                    <span className="text-slate-400">Stock: {v.stock} units</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
