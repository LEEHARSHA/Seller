'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { createSellerProductApi } from '../../../lib/api/products';
import { ALLOWED_CATEGORIES, AllowedCategory, Product } from '../../../types';
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Eye,
  Send,
  Save,
  Package,
  AlertCircle,
  HelpCircle,
  Star,
} from 'lucide-react';

const ProductBoxScene = dynamic(() => import('../../../components/3d/ProductBoxScene'), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-slate-900/50 rounded-2xl animate-pulse" />,
});

const SuccessBadgeScene = dynamic(() => import('../../../components/3d/SuccessBadgeScene'), {
  ssr: false,
  loading: () => <div className="w-full h-[180px] bg-slate-900/50 rounded-2xl animate-pulse" />,
});

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    firebaseUser,
    loading: authLoading,
    authState,
    sellerProfileSetupRequired,
  } = useAuth();

  // Section 1: Basic Info
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<AllowedCategory>('Supplements');
  const [subCategory, setSubCategory] = useState('');

  // Section 2: Description
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Section 3: Pricing
  const [price, setPrice] = useState<string>('');
  const [compareAtPrice, setCompareAtPrice] = useState<string>('');

  // Section 4: Inventory
  const [stock, setStock] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('10');

  // Section 5: Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [urlInputError, setUrlInputError] = useState<string | null>(null);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});

  // Section 6: Variants
  const [variants, setVariants] = useState<Array<{ id: string; title: string; stock: number }>>([]);
  const [variantTitle, setVariantTitle] = useState('');
  const [variantStock, setVariantStock] = useState('');

  // Section 7: Specifications
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // UI state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationSummary, setValidationSummary] = useState('');
  const [backendRequiresProfileCompletion, setBackendRequiresProfileCompletion] = useState(false);
  const [submittedProduct, setSubmittedProduct] = useState<Product | null>(null);
  const submissionInProgress = useRef(false);
  const profileSetupRequired = sellerProfileSetupRequired || backendRequiresProfileCompletion;

  const formSummaryRef = useRef<HTMLFormElement>(null);

  const calculateDiscount = () => {
    const p = parseFloat(price);
    const cp = parseFloat(compareAtPrice);
    if (p && cp && cp > p) {
      return Math.round(((cp - p) / cp) * 100);
    }
    return 0;
  };

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
    setUrlInputError(null);
    setErrors((current) => {
      const remaining = { ...current };
      delete remaining.images;
      return remaining;
    });
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

  const addVariant = () => {
    if (variantTitle.trim()) {
      setVariants([
        ...variants,
        { id: String(Date.now()), title: variantTitle.trim(), stock: parseInt(variantStock) || 0 },
      ]);
      setVariantTitle('');
      setVariantStock('');
    }
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const addSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecs([...specs, { key: specKey.trim(), value: specVal.trim() }]);
      setSpecKey('');
      setSpecVal('');
    }
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    let currentImages = [...imageUrls];
    if (newImageUrl.trim()) {
      const pending = newImageUrl.trim();
      if (isValidHttpsUrl(pending) && !currentImages.includes(pending) && currentImages.length < 30) {
        currentImages = [...currentImages, pending];
        setImageUrls(currentImages);
        setNewImageUrl('');
        setUrlInputError(null);
      }
    }

    if (name.trim().length < 2 || name.trim().length > 200) {
      errs.name = 'Product name must be between 2 and 200 characters.';
    }
    if (!brand.trim() || brand.trim().length > 120) {
      errs.brand = 'Brand name is required and must be 120 characters or fewer.';
    }
    if (sku.length > 100) errs.sku = 'SKU must be 100 characters or fewer.';
    if (!category || !ALLOWED_CATEGORIES.includes(category)) errs.category = 'Category is required.';
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      errs.price = 'Valid price greater than 0 is required.';
    }
    if (compareAtPrice.trim()) {
      const comparePrice = Number(compareAtPrice);
      if (!Number.isFinite(comparePrice) || comparePrice <= Number(price)) {
        errs.compareAtPrice = 'Compare-at price must be greater than the selling price.';
      }
    }
    if (!stock.trim() || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      errs.stock = 'Valid stock quantity is required (non-negative whole number).';
    }
    if (!lowStockThreshold.trim() || !Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
      errs.lowStockThreshold = 'Low-stock threshold must be a non-negative whole number.';
    }
    if (currentImages.length === 0) {
      errs.images = 'At least one product image URL is required.';
    } else if (currentImages.length > 30) {
      errs.images = 'A product can have no more than 30 images.';
    } else if (currentImages.some((url) => !isValidHttpsUrl(url))) {
      errs.images = 'Each product image must use a valid, public HTTPS URL.';
    } else if (currentImages.some((url) => failedImageUrls[url])) {
      errs.images = 'One or more image URLs failed to load. Please fix or remove invalid image URLs before submitting.';
    }
    if (variants.length > 100) errs.variants = 'A product can have no more than 100 variants.';
    if (description.length > 10000) errs.description = 'Description must be 10,000 characters or fewer.';
    if (shortDescription.length > 500) errs.shortDescription = 'Short description must be 500 characters or fewer.';
    if (subCategory.trim().length > 120) errs.subCategory = 'Subcategory must be 120 characters or fewer.';

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setValidationSummary(
        'Submission is blocked. Please correct the highlighted fields, including the required product image, then try again.',
      );
      toast.error(
        'Validation Error',
        'Please correct the highlighted fields before submitting.',
      );
      setTimeout(() => {
        formSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return false;
    }

    setValidationSummary('');
    return true;
  };

  const openConfirmation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (uploadInProgress.current || isUploadingImages) {
      toast.error('Images are still uploading', 'Wait for all product images to finish uploading.');
      return;
    }
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleSubmitConfirmed = async () => {
    if (submissionInProgress.current) return;
    if (uploadInProgress.current || isUploadingImages) {
      toast.error('Images are still uploading', 'Wait for all product images to finish uploading.');
      return;
    }
    if (!validateForm()) {
      return;
    }
    if (authLoading || !firebaseUser || authState !== 'signed-in') {
      toast.error('Sign-in required', 'Your Firebase session is not ready. Sign in again before submitting this product.');
      return;
    }
    if (profileSetupRequired) {
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    try {
      const specObj: Record<string, string> = {};
      specs.forEach((s) => {
        specObj[s.key] = s.value;
      });

      const createdProduct = await createSellerProductApi(firebaseUser, {
        name,
        brand,
        sku,
        category,
        subCategory,
        description,
        shortDescription,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        discountPercent: calculateDiscount(),
        stock: parseInt(stock),
        lowStockThreshold: parseInt(lowStockThreshold),
        images: imageUrls,
        variants: variants.map((v) => ({
          id: v.id,
          title: v.title,
          stock: v.stock,
          attributes: {},
        })),
        specifications: specObj,
      });

      setSubmittedProduct(createdProduct);
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      toast.success(
        'Product submitted',
        `Product ${createdProduct.id} was saved with status ${createdProduct.status}.`,
      );
    } catch (err) {
      const status = typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status?: number }).status
        : undefined;
      if (status === 409) {
        setBackendRequiresProfileCompletion(true);
        toast.error(
          'Complete your seller profile',
          'The backend requires a complete seller profile before it can accept products.',
        );
        return;
      }
      const message = err instanceof Error ? err.message : 'The product could not be submitted.';
      toast.error('Submission Failed', message);
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <form
        ref={formSummaryRef}
        onSubmit={openConfirmation}
        noValidate
        className="space-y-8 max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Section Product Entry Form</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Create & List Product</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit product details to Fitness Species catalog. Entries default to pending status for admin approval.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              icon={<Eye className="w-4 h-4" />}
            >
              Preview Listing
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Send className="w-4 h-4" />}
            >
              Submit for Approval
            </Button>
          </div>
        </div>
        {validationSummary && (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {validationSummary}
          </div>
        )}

        {/* 3D Visual Bar */}
        <Card variant="glass" padding="sm" className="flex items-center justify-between overflow-hidden">
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-extrabold text-white">Commercial Packaging & Details</h3>
            <p className="text-xs text-slate-400">
              Ensure high-res images and complete specifications for faster approval turnarounds.
            </p>
          </div>
          <div className="w-44 shrink-0">
            <ProductBoxScene />
          </div>
        </Card>

        {/* SECTION 1: Basic Information */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
              Basic Information
            </h3>
            <span className="text-xs text-slate-400">Core details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Name"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />
            </div>

            <Input
              label="Brand Name"
              placeholder="Brand name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              error={errors.brand}
              required
            />

            <Input
              label="SKU / Stock Keeping Unit"
              placeholder="SKU-12345"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              error={errors.sku}
            />

            <Select
              label="Category (Strict Marketplace Allowed Categories)"
              value={category}
              onChange={(e) => setCategory(e.target.value as AllowedCategory)}
              options={ALLOWED_CATEGORIES}
              error={errors.category}
              helperText="Note: Prescription medicines are strictly not allowed on the platform."
            />

            <Input
              label="Subcategory"
              placeholder="Product subcategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              error={errors.subCategory}
            />
          </div>
        </Card>

        {/* SECTION 2: Description */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
              Product Description
            </h3>
          </div>

          <Input
            label="Short Summary Description"
            placeholder="27g Protein Isolate per serving with digestive enzymes."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            error={errors.shortDescription}
          />

          <Textarea
            label="Full Product Overview & Benefits"
            rows={5}
            placeholder="Detailed product information, ingredients, usage instructions, and safety warnings..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />
        </Card>

        {/* SECTION 3: Pricing */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
              Pricing & Discounts
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              required
            />

            <Input
              label="Compare-at Price (MRP ₹)"
              type="number"
              placeholder="0.00"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              error={errors.compareAtPrice}
            />

            <div className="flex flex-col space-y-1.5 justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Discount Calculated</span>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-sm">
                {calculateDiscount()}% OFF
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 4: Inventory */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
              Inventory & Stock
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity Available"
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              error={errors.stock}
              required
            />

            <Input
              label="Low-Stock Alert Threshold"
              type="number"
              placeholder="10"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              error={errors.lowStockThreshold}
              required
            />
          </div>
        </Card>

        {/* SECTION 5: Images */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">5</span>
              Product Media & Images
            </h3>
            <span className="text-xs text-slate-400">Direct Public Image URLs</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Provide direct HTTPS image URLs for your product. Image URLs must be publicly accessible (e.g., from Unsplash, CDN, Shopify, Cloudinary, etc.) without requiring login or authentication.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Product Image URL"
                placeholder="https://example.com/product-image.jpg"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  if (urlInputError) setUrlInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                error={urlInputError}
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

          {errors.images && (
            <p role="alert" className="text-xs text-rose-400 font-medium pt-1">
              {errors.images}
            </p>
          )}

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
        </Card>

        {/* SECTION 6: Variants */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">6</span>
              Optional Variants (Size, Flavor, Color)
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="Variant Name (e.g. 2 kg - Chocolate Fudge)"
              value={variantTitle}
              onChange={(e) => setVariantTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Stock"
              value={variantStock}
              onChange={(e) => setVariantStock(e.target.value)}
              className="w-full sm:w-28"
            />
            <Button variant="secondary" type="button" onClick={addVariant} icon={<Plus className="w-4 h-4" />}>
              Add Variant
            </Button>
          </div>

          {errors.variants && <p role="alert" className="text-xs text-rose-400 font-medium">{errors.variants}</p>}
          <div className="space-y-2">
            {variants.map((v) => (
              <div key={v.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{v.title}</p>
                  <p className="text-[10px] text-slate-400">Stock: {v.stock} units</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(v.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 7: Specifications */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">7</span>
              Technical Specifications
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="Spec Name (e.g. Serving Size)"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Spec Value (e.g. 1 Scoop / 30g)"
              value={specVal}
              onChange={(e) => setSpecVal(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" type="button" onClick={addSpec} icon={<Plus className="w-4 h-4" />}>
              Add Spec
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specs.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{s.key}</p>
                  <p className="text-xs font-semibold text-white">{s.value}</p>
                </div>
                <button type="button" onClick={() => removeSpec(idx)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {validationSummary && (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {validationSummary}
          </div>
        )}

        {/* Bottom Form Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={() => router.push('/products')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            icon={<Send className="w-4 h-4" />}
          >
            Submit for Admin Review
          </Button>
        </div>
      </form>

      {/* CUSTOMER PREVIEW MODAL */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} maxWidth="2xl" title="Live Customer Marketplace Preview">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              {imageUrls[0] ? (
                <img src={imageUrls[0]} alt="Product preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                {category}
              </span>
              <h3 className="text-lg font-bold text-white leading-snug">{name || 'Product Title Preview'}</h3>
              <p className="text-xs text-slate-400">{brand || 'Brand'}</p>

              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-black text-emerald-400">₹{parseFloat(price || '0').toLocaleString('en-IN')}</span>
                {compareAtPrice && <span className="text-xs text-slate-500 line-through">₹{parseFloat(compareAtPrice).toLocaleString('en-IN')}</span>}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{shortDescription || 'Short description preview will appear here.'}</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION SUBMISSION DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsConfirmModalOpen(false);
        }}
        onConfirm={handleSubmitConfirmed}
        title="Submit Product for Admin Review?"
        message={profileSetupRequired ? (
          <div className="space-y-2">
            <p className="text-amber-300 font-medium">
              Your seller profile must be complete before products can be submitted.
            </p>
            <p className="text-slate-300">
              Please{' '}
              <Link href="/profile" className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                complete your seller profile
              </Link>
              {' '}first, then return here to submit this product for review.
            </p>
          </div>
        ) : authLoading || !firebaseUser || authState !== 'signed-in' ? (
          <div className="space-y-2">
            <p className="text-amber-300 font-medium">
              A signed-in Firebase session is required to submit this product.
            </p>
            <p className="text-slate-300">
              Please{' '}
              <Link href="/login" className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                sign in
              </Link>
              {' '}and try again.
            </p>
          </div>
        ) : (
          'Your product will be sent to the Fitness Species admin team with pending status for review. The product is not submitted until the backend confirms it was saved.'
        )}
        confirmText="Confirm & Submit"
        isLoading={isSubmitting}
        isConfirmDisabled={authLoading || !firebaseUser || authState !== 'signed-in' || profileSetupRequired}
      />

      {/* SUCCESS CELEBRATION MODAL */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); router.push('/products'); }} maxWidth="md">
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <SuccessBadgeScene />
          <h3 className="text-xl font-extrabold text-white">Product Submitted</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your product entry is now{' '}
            <strong className="text-amber-400">{submittedProduct?.status || 'Status unavailable'}</strong>.
            {submittedProduct?.id ? ` Product ID: ${submittedProduct.id}.` : ''} You can track its approval status from your products dashboard.
          </p>
          <Button variant="primary" className="w-full mt-4" onClick={() => { setIsSuccessModalOpen(false); router.push('/products'); }}>
            Back to My Products
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
