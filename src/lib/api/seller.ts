import { fetchApi } from './client';
import { SellerProfile, BusinessAddress } from '../../types';

export async function getSellerProfileApi(): Promise<SellerProfile | null> {
  try {
    const res = await fetchApi<{ success: boolean; seller: SellerProfile }>('/api/seller/profile');
    if (res && res.success && res.seller) {
      return res.seller;
    }
    return null;
  } catch (error: any) {
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateSellerProfileApi(payload: {
  businessName: string;
  ownerName?: string;
  phone: string;
  businessAddress?: BusinessAddress;
}): Promise<SellerProfile> {
  const res = await fetchApi<{ success: boolean; seller: SellerProfile }>('/api/seller/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res && res.success && res.seller) {
    return res.seller;
  }

  throw new Error('Seller profile update failed.');
}
