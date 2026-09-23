import { fetchApi } from './client';
import { Product, ProductStatus } from '../../types';
import { INITIAL_MOCK_PRODUCTS } from '../mockData';

// Local transient state cache for demo fallback mode
let localProductsCache: Product[] = [...INITIAL_MOCK_PRODUCTS];

export async function getSellerProductsApi(statusFilter?: ProductStatus | 'all'): Promise<Product[]> {
  try {
    const url = statusFilter && statusFilter !== 'all' 
      ? `/api/seller/products?status=${statusFilter}` 
      : '/api/seller/products';
    const res = await fetchApi<{ success: boolean; count: number; products: Product[] }>(url);
    if (res && res.success && Array.isArray(res.products)) {
      return res.products;
    }
  } catch (err: any) {
    console.warn('Backend products endpoint offline, falling back to mock dataset:', err.message);
  }

  if (statusFilter && statusFilter !== 'all') {
    return localProductsCache.filter((p) => p.status === statusFilter);
  }
  return localProductsCache;
}

export async function getSellerProductByIdApi(productId: string): Promise<Product | null> {
  try {
    const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`);
    if (res && res.success && res.product) {
      return res.product;
    }
  } catch (err: any) {
    console.warn('Backend product detail offline, checking mock dataset:', err.message);
  }

  const found = localProductsCache.find((p) => p.id === productId);
  return found || null;
}

export async function createSellerProductApi(payload: Partial<Product>): Promise<Product> {
  try {
    const res = await fetchApi<{ success: boolean; product: Product }>('/api/seller/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.success && res.product) {
      return res.product;
    }
  } catch (err: any) {
    console.warn('Backend create product offline, creating mock pending product:', err.message);
  }

  const newProduct: Product = {
    id: `prod_mock_${Date.now()}`,
    sellerId: payload.sellerId || 'demo_seller_uid_901',
    name: payload.name || 'New Product',
    description: payload.description || '',
    shortDescription: payload.shortDescription || '',
    category: payload.category || 'Supplements',
    subCategory: payload.subCategory || 'General',
    brand: payload.brand || 'Fitness Species',
    sku: payload.sku || `SKU-${Date.now()}`,
    price: payload.price || 0,
    compareAtPrice: payload.compareAtPrice || null,
    discountPercent: payload.discountPercent || 0,
    images: payload.images || ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80'],
    stock: payload.stock || 0,
    variants: payload.variants || [],
    specifications: payload.specifications || {},
    status: 'pending', // FORCED STATUS!
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localProductsCache.unshift(newProduct);
  return newProduct;
}

export async function updateSellerProductApi(productId: string, payload: Partial<Product>): Promise<Product> {
  try {
    const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (res && res.success && res.product) {
      return res.product;
    }
  } catch (err: any) {
    console.warn('Backend update product offline, updating mock item & resetting status to pending:', err.message);
  }

  const index = localProductsCache.findIndex((p) => p.id === productId);
  if (index !== -1) {
    const updatedItem: Product = {
      ...localProductsCache[index],
      ...payload,
      status: 'pending', // FORCED BACK TO PENDING ON EDIT FOR RE-APPROVAL!
      rejectionReason: null,
      updatedAt: new Date().toISOString(),
    };
    localProductsCache[index] = updatedItem;
    return updatedItem;
  }

  throw new Error('Product not found for update.');
}
