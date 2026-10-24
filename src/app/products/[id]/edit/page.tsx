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
import { useAuth } from '../../../../context/AuthContext';
import { getSellerProductByIdApi, updateSellerProductApi } from '../../../../lib/api/products';
import { ALLOWED_CATEGORIES, AllowedCategory } from '../../../../types';
import { ArrowLeft, Trash2, AlertTriangle, Send, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { firebaseUser, loading: authLoading, authState } = useAuth();
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
  const [urlInputError, setUrlInputError] = useState<string | undefined>(undefined);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!firebaseUser || authState !== 'signed-in') {
        setLoading(false);
        return;
      }
      if (!productId) return;
      setLoading(true);
      setLoadError(null);
      try {
        const p = await getSellerProductByIdApi(firebaseUser, productId);
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
          const imgs = Array.isArray(p.images) ? p.images : [];
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
  }, [authLoading, authState, firebaseUser, productId]);

  const isValidHttpsUrl = (urlString: string) => {
    try {
      const parsed = new URL(urlString.trim());
      return parsed.protocol === 'https:' && parsed.hostname.length > 0;
    } catch {
      return false;
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      setUrlInputError('Please enter a product image URL.');
      return;
    }

    if (!isValidHttpsUrl(trimmed)) {
      setUrlInputError('Image URL must be a valid, public HTTPS URL starting with https://');
      return;
    }

    if (imageUrls.includes(trimmed)) {
      setUrlInputError('This image URL has already been added.');
      return;
    }

    if (imageUrls.length >= 30) {
      setUrlInputError('A product can have no more than 30 images.');
      return;
    }

    setImageUrls((current) => [...current, trimmed]);
    setNewImageUrl('');
    setUrlInputError(undefined);
  };

  const handleRemoveImage = (index: number) => {
    const targetUrl = imageUrls[index];
    setImageUrls((current) => current.filter((_, i) => i !== index));
    if (targetUrl) {
      setFailedImageUrls((current) => {
        const next = { ...current };
        delete next[targetUrl];
        return next;
      });
    }
  };

  const handleImageLoadError = (url: string) => {
    setFailedImageUrls((current) => ({ ...current, [url]: true }));
  };

  const handleImageLoadSuccess = (url: string) => {
    setFailedImageUrls((current) => {
      if (!current[url]) return current;
      const next = { ...current };
      delete next[url];
      return next;
    });
  };

  const handleSaveConfirmed = async () => {
    let finalImages = [...imageUrls];
    if (newImageUrl.trim()) {
      const pending = newImageUrl.trim();
      if (!isValidHttpsUrl(pending)) {
        setUrlInputError('Image URL must be a valid, public HTTPS URL starting with https://');
        toast.error('Invalid image URL', 'Each product image must use a valid HTTPS URL.');
        return;
      }
      if (finalImages.includes(pending)) {
        setUrlInputError('This image URL has already been added.');
        toast.error('Duplicate image URL', 'This product image URL has already been added.');
        return;
      }
      if (finalImages.length >= 30) {
        setUrlInputError('A product can have no more than 30 images.');
        toast.error('Image limit reached', 'A product can have no more than 30 images.');
        return;
      }
      finalImages = [...finalImages, pending];
      setImageUrls(finalImages);
      setNewImageUrl('');
      setUrlInputError(undefined);
    }

    if (finalImages.length === 0) {
      toast.error('Image required', 'Provide at least one valid HTTPS product image URL.');
      return;
    }

    if (finalImages.length > 30) {
      toast.error('Image limit reached', 'A product can have no more than 30 images.');
      return;
    }

    if (finalImages.some((url) => !isValidHttpsUrl(url))) {
      toast.error('Invalid image URL', 'Each product image must use a valid HTTPS URL.');
      return;
    }

    if (finalImages.some((url) => failedImageUrls[url])) {
      toast.error('Image load failed', 'One or more image URLs failed to load. Fix or remove invalid image URLs.');
      return;
    }

    if (!firebaseUser || authLoading || authState !== 'signed-in') {
      toast.error('Sign-in required', 'Sign in again before updating this product.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedProduct = await updateSellerProductApi(firebaseUser, productId, {
        name,
        brand,
        sku,
        category,
        subCategory,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock),
        images: finalImages,
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
            <Button variant="outline" type="button" onClick={() => router.push('/products')}>Back to Products</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Button variant="ghost" type="button" onClick={() => router.push(`/products/${productId}`)} icon={<ArrowLeft className="w-4 h-4" />}>
            Cancel Edit
          </Button>
          <Button variant="primary" type="button" onClick={() => setIsConfirmOpen(true)} icon={<Send className="w-4 h-4" />}>
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

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Product Images</label>
              <span className="text-xs text-slate-400">Direct Public Image URLs</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Provide direct HTTPS image URLs for your product. Image URLs must be publicly accessible without requiring login or authentication.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Product Image URL"
                  placeholder="https://example.com/product-image.jpg"
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    if (urlInputError) setUrlInputError(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  error={urlInputError ?? undefined}
                />
              </div>
              <div className="sm:self-end pt-1 sm:pt-0">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleAddImageUrl}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Image URL
                </Button>
              </div>
            </div>

            {/* Added Image Previews */}
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                {imageUrls.map((url, idx) => {
                  const hasError = failedImageUrls[url];
                  return (
                    <div
                      key={`${url}-${idx}`}
                      className={`relative group rounded-xl bg-slate-950 border overflow-hidden aspect-square flex flex-col items-center justify-center ${
                        hasError ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800'
                      }`}
                    >
                      {!hasError ? (
                        <img
                          src={url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageLoadError(url)}
                          onLoad={() => handleImageLoadSuccess(url)}
                        />
                      ) : (
                        <div className="p-3 text-center space-y-1">
                          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
                          <p className="text-[11px] font-semibold text-rose-300">Failed to load</p>
                          <p className="text-[10px] text-slate-400 break-all line-clamp-2 px-1">{url}</p>
                        </div>
                      )}

                      {idx === 0 && !hasError && (
                        <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                          Primary
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove image URL"
                        className="absolute top-2 right-2 p-1.5 bg-rose-950/90 text-rose-300 hover:text-white rounded-lg shadow transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No image URLs added yet.</p>
                <p className="text-[11px] text-slate-500">
                  Enter an HTTPS image URL above and click &quot;Add Image URL&quot;. At least one product image is required.
                </p>
              </div>
            )}
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
