'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/layout/AppShell';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useToast } from '../../../../context/ToastContext';
import { getSellerProductByIdApi, updateSellerProductApi } from '../../../../lib/api/products';
import { ALLOWED_CATEGORIES, AllowedCategory, Product } from '../../../../types';
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle, Send } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<AllowedCategory>('Supplements');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const p = await getSellerProductByIdApi(productId);
        if (p) {
          setName(p.name);
          setBrand(p.brand);
          setSku(p.sku);
          setCategory(p.category);
          setSubCategory(p.subCategory || '');
          setDescription(p.description || '');
          setPrice(String(p.price));
          setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '');
          setStock(String(p.stock));
          const imgs = Array.isArray(p.images)
            ? p.images.map((img) => (typeof img === 'string' ? img : img.url))
            : [];
          setImageUrls(imgs);
        } else {
          setLoadError('Product not found or access denied.');
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Unable to load product for editing.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSaveConfirmed = async () => {
    setSubmitting(true);
    try {
      const updatedProduct = await updateSellerProductApi(productId, {
        name,
        brand,
        sku,
        category,
        subCategory,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock),
        images: imageUrls,
      });

      setIsConfirmOpen(false);
      toast.success('Product updated', `The backend returned status: ${updatedProduct.status}.`);
      router.push(`/products/${productId}`);
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/4" />
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <div role="alert" className="mx-auto max-w-4xl rounded-xl border border-rose-500/30 bg-rose-950/40 p-6 text-sm text-rose-200">
          Product data is unavailable: {loadError}
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/products')}>Back to Products</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Button variant="ghost" onClick={() => router.push(`/products/${productId}`)} icon={<ArrowLeft className="w-4 h-4" />}>
            Cancel Edit
          </Button>
          <Button variant="primary" onClick={() => setIsConfirmOpen(true)} icon={<Send className="w-4 h-4" />}>
            Resubmit for Review
          </Button>
        </div>

        {/* Re-approval notice */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-200">Re-Approval Policy Notice</p>
            <p className="mt-0.5 text-amber-300/80">
              Editing product details will automatically set the status back to <strong className="text-amber-200">Pending Review</strong>. The admin team will verify changes before publishing updates to live app users.
            </p>
          </div>
        </div>

        <Card variant="default" padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-white">Edit Product Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <Input label="Brand Name" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as AllowedCategory)}
              options={ALLOWED_CATEGORIES}
            />
            <Input label="Subcategory" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />

            <Input label="Selling Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input label="Compare-at Price (₹)" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
            <Input label="Stock Quantity" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>

          <Textarea label="Product Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Product Images</label>
            <div className="flex space-x-2">
              <Input placeholder="Image URL..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1" />
              <Button variant="secondary" onClick={handleAddImage} icon={<Plus className="w-4 h-4" />}>Add</Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group rounded-xl bg-slate-950 border border-slate-800 overflow-hidden aspect-square">
                  <img src={url} alt="Thumb" className="w-full h-full object-cover" />
                  <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 p-1 bg-rose-950 text-rose-300 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleSaveConfirmed}
          title="Resubmit Product Changes?"
          message="Updating this product will force its status back to pending for admin re-approval."
          confirmText="Resubmit for Review"
          isLoading={submitting}
        />
      </div>
    </AppShell>
  );
}
