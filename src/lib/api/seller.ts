import type { User } from 'firebase/auth';
import { fetchApi } from './client';
import { SellerProfile, BusinessAddress } from '../../types';

export async function getSellerProfileApi(user: User): Promise<SellerProfile | null> {
  try {
    const res = await fetchApi<{
      success: boolean;
      setupRequired?: boolean;
      seller: SellerProfile;
    }>('/api/seller/profile', { user });
    if (res && res.success && res.seller) {
      return res.seller;
    }
    return null;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && 'data' in error) {
      const { status, data } = error as { status?: number; data?: unknown };
      if (
        status === 404
        && typeof data === 'object'
        && data !== null
        && 'code' in data
        && data.code === 'SELLER_PROFILE_SETUP_REQUIRED'
        && 'setupRequired' in data
        && data.setupRequired === true
      ) {
        return null;
      }
    }
    throw error;
  }
}

export async function updateSellerProfileApi(user: User, payload: {
  businessName: string;
  ownerName?: string;
  phone: string;
  businessAddress?: BusinessAddress;
}): Promise<SellerProfile> {
  const res = await fetchApi<{ success: boolean; seller: SellerProfile }>('/api/seller/profile', {
    user,
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res && res.success && res.seller) {
    return res.seller;
  }

  throw new Error('Seller profile update failed.');
}
