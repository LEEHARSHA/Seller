import { auth } from '../firebase';
import { Product, ProductStatus } from '../../types';
import { fetchApi } from './client';

export async function getSellerProductsApi(statusFilter?: ProductStatus | 'all'): Promise<Product[]> {
  const url =
    statusFilter && statusFilter !== 'all'
      ? `/api/seller/products?status=${statusFilter}`
      : '/api/seller/products';
  const res = await fetchApi<{ success: boolean; count: number; products: Product[] }>(url);

  if (res?.success && Array.isArray(res.products)) {
    return res.products;
  }

  throw new Error('Unable to load products.');
}

export async function getSellerProductByIdApi(productId: string): Promise<Product | null> {
  const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`);
  if (res?.success && res.product) {
    return res.product;
  }

  return null;
}

export async function createSellerProductApi(
  payload: Omit<
    Partial<Product>,
    'id' | 'sellerId' | 'status' | 'createdAt' | 'updatedAt' | 'approvedAt' | 'rejectedAt' | 'rejectionReason'
  >,
  token: string,
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
    stock,
    lowStockThreshold,
    images,
    variants,
    specifications,
  } = payload;

  const res = await fetchApi<{ success: boolean; product: Product }>('/api/seller/products', {
    method: 'POST',
    token,
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
      stock,
      lowStockThreshold,
      images,
      variants,
      specifications,
    }),
  });

  if (res?.success && res.product) {
    return res.product;
  }

  throw new Error('Product creation failed: the backend did not return a created product.');
}

export async function updateSellerProductApi(productId: string, payload: Partial<Product>): Promise<Product> {
  const res = await fetchApi<{ success: boolean; product: Product }>(`/api/seller/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (res?.success && res.product) {
    return res.product;
  }

  throw new Error('Product update failed.');
}

export async function updateSellerProductStockApi(productId: string, stock: number): Promise<Product> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to update inventory.');
  }

  const token = await user.getIdToken(true);
  const res = await fetchApi<{ success: boolean; product: Product }>(
    `/api/seller/products/${productId}/stock`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ stock }),
    },
  );

  if (res?.success && res.product) {
    return res.product;
  }

  throw new Error('Inventory update failed.');
}
