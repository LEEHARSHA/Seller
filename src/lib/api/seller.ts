import { fetchApi } from './client';
import { SellerProfile, ApiResponse, BusinessAddress } from '../../types';
import { INITIAL_MOCK_SELLER } from '../mockData';

export async function getSellerProfileApi(): Promise<SellerProfile | null> {
  try {
    const res = await fetchApi<{ success: boolean; seller: SellerProfile }>('/api/seller/profile');
    if (res && res.success && res.seller) {
      return res.seller;
    }
  } catch (err: any) {
    if (err.status === 404) {
      return null;
    }
    console.warn('Backend unavailable, using seller profile fallback');
  }
  return INITIAL_MOCK_SELLER;
}

export async function updateSellerProfileApi(payload: {
  businessName: string;
  ownerName?: string;
  phone: string;
  businessAddress?: BusinessAddress;
}): Promise<SellerProfile> {
  try {
    const res = await fetchApi<{ success: boolean; seller: SellerProfile }>('/api/seller/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.success && res.seller) {
      return res.seller;
    }
  } catch (err: any) {
    console.warn('Backend profile write failed, updating mock state:', err.message);
  }
  return {
    ...INITIAL_MOCK_SELLER,
    businessName: payload.businessName,
    ownerName: payload.ownerName || INITIAL_MOCK_SELLER.ownerName,
    phone: payload.phone,
    businessAddress: payload.businessAddress || INITIAL_MOCK_SELLER.businessAddress,
    updatedAt: new Date().toISOString(),
  };
}
