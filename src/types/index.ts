export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type SellerStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'customer' | 'seller' | 'admin';

export interface BusinessAddress {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SellerProfile {
  id: string;
  firebaseUid: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessAddress: BusinessAddress;
  status: SellerStatus;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
}

export interface ProductVariantOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary?: boolean;
  alt?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: AllowedCategory;
  subCategory: string;
  brand: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number;
  images: string[] | ProductImage[];
  stock: number;
  lowStockThreshold?: number;
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  status: ProductStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
}

export type AllowedCategory =
  | 'Supplements'
  | 'Medicines / Wellness'
  | 'Gym Wear'
  | 'Fitness Equipment'
  | 'Footwear'
  | 'Snacks';

export const ALLOWED_CATEGORIES: AllowedCategory[] = [
  'Supplements',
  'Medicines / Wellness',
  'Gym Wear',
  'Fitness Equipment',
  'Footwear',
  'Snacks',
];

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: UserRole;
  isSeller?: boolean;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  seller?: SellerProfile;
  product?: Product;
  products?: Product[];
  count?: number;
  user?: {
    uid: string;
    email: string;
    name?: string;
    role?: UserRole;
  };
}
