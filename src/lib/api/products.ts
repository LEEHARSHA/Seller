import type { User } from 'firebase/auth';
import { Product, ProductStatus } from '../../types';
import { fetchApi } from './client';

export async function getSellerProductsApi(
  user: User,
  statusFilter?: ProductStatus | 'all',
): Promise<Product[]> {
  const url =
    statusFilter && statusFilter !== 'all'
      ? `/api/seller/products?status=${statusFilter}`
      : '/api/seller/products';
  const res = await fetchApi<{ success: boolean; count: number; products: Product[] }>(url, { user });

  if (res?.success && Array.isArray(res.products)) {
    return res.products;
  }

  throw new Error('Unable to load products.');
}

export async function getSellerProductByIdApi(user: User, productId: string): Promise<Product | null> {
  const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`, { user });
  if (res?.success && res.product) {
    return res.product;
  }

  return null;
}

export async function createSellerProductApi(
  user: User,
  payload: Omit<
    Partial<Product>,
    'id' | 'sellerId' | 'status' | 'createdAt' | 'updatedAt' | 'approvedAt' | 'rejectedAt' | 'rejectionReason'
  >,
): Promise<Product> {
  const {
    name,
    brand,
    sku,
    category,
    subCategory,
    description,
    shortDescription,
    price,
    compareAtPrice,
    discountPercent,
    stock,
    lowStockThreshold,
    images,
    variants,
    specifications,
  } = payload;

  const res = await fetchApi<{ success: boolean; product: Product }>('/api/seller/products', {
    user,
    method: 'POST',
    body: JSON.stringify({
      name,
      brand,
      sku,
      category,
      subCategory,
      description,
      shortDescription,
      price,
      compareAtPrice,
      discountPercent,
      stock,
      lowStockThreshold,
      images,
      variants,
      specifications,
    }),
  });

  if (res?.success && res.product?.id && res.product.status === 'pending') {
    return res.product;
  }

  throw new Error('The backend did not confirm a saved product ID with pending approval status.');
}

export async function updateSellerProductApi(
  user: User,
  productId: string,
  payload: Partial<Product>,
): Promise<Product> {
  const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`, {
    user,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (res?.success && res.product) {
    return res.product;
  }

  throw new Error('Product update failed.');
}

export async function updateSellerProductStockApi(user: User, productId: string, stock: number): Promise<Product> {
  if (!user) {
    throw new Error('You must be signed in to update inventory.');
  }

  const res = await fetchApi<{ success: boolean; product: Product }>(
    `/api/seller/products/${productId}/stock`,
    {
      user,
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    },
  );

  if (res?.success && res.product) {
    return res.product;
  }

  throw new Error('Inventory update failed.');
}
