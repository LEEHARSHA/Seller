'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { uploadSellerProductImage } from '../../../../lib/product-images';
import { ALLOWED_CATEGORIES, AllowedCategory, Product } from '../../../../types';
import { ArrowLeft, Save, Trash2, AlertTriangle, Send, Upload } from 'lucide-react';

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
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFilePosition, setUploadFilePosition] = useState(0);
  const [uploadFileCount, setUploadFileCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadInProgress = useRef(false);
  const uploadController = useRef<AbortController | null>(null);

  useEffect(() => () => uploadController.current?.abort(), []);
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

  const handleImageFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (files.length === 0) return;
    if (uploadInProgress.current) return;
    if (!firebaseUser || authState !== 'signed-in') {
      toast.error('Sign-in required', 'Sign in again before uploading product images.');
      return;
    }
    if (imageUrls.length + files.length > 30) {
      toast.error('Too many images', 'A product can have no more than 30 images.');
      return;
    }

    const invalidFile = files.find((file) =>
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      || !file.size
      || file.size > 10 * 1024 * 1024,
    );
    if (invalidFile) {
      const message = invalidFile.size > 10 * 1024 * 1024
        ? 'Each image must be smaller than 10 MB.'
        : 'Use a JPEG, PNG, or WebP image.';
      setUploadError(message);
      toast.error('Image upload failed', message);
      return;
    }

    uploadInProgress.current = true;
    const controller = new AbortController();
    uploadController.current = controller;
    setIsUploadingImages(true);
    setUploadProgress(0);
    setUploadFilePosition(0);
    setUploadFileCount(files.length);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setUploadFilePosition(index + 1);
        setUploadProgress(0);
        const url = await uploadSellerProductImage(firebaseUser, file, {
          onProgress: ({ percentage }) => setUploadProgress(percentage),
          signal: controller.signal,
        });
        uploadedUrls.push(url);
        setImageUrls((current) => [...current, url]);
      }
      toast.success('Images uploaded', `${uploadedUrls.length} product image(s) are ready.`);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'Unable to upload product images.';
      setUploadError(message);
      toast.error(
        'Image upload failed',
        message,
      );
    } finally {
      uploadInProgress.current = false;
      uploadController.current = null;
      if (!controller.signal.aborted) setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSaveConfirmed = async () => {
    if (uploadInProgress.current || isUploadingImages) {
      toast.error('Images are still uploading', 'Wait for all product images to finish uploading.');
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
            {uploadError && <p role="alert" className="text-xs text-rose-400 font-medium">{uploadError}</p>}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300 hover:border-emerald-500">
              <Upload className="h-5 w-5 text-emerald-400" />
              <span>
                {isUploadingImages
                  ? `Uploading image ${uploadFilePosition} of ${uploadFileCount}… ${uploadProgress}%`
                  : 'Add JPEG, PNG, or WebP images (max 10 MB each)'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isUploadingImages}
                onChange={(event) => void handleImageFiles(event)}
                className="sr-only"
              />
            </label>
            {isUploadingImages && (
              <div
                role="progressbar"
                aria-label={`Uploading image ${uploadFilePosition} of ${uploadFileCount}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                className="h-2 overflow-hidden rounded-full bg-slate-800"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

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
