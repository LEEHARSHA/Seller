import type { User } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app, hasFirebaseConfig } from './firebase';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const PRODUCT_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export async function uploadSellerProductImage(user: User, file: File): Promise<string> {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured. Image uploads are unavailable.');
  }
  if (app.options.projectId !== 'sellerportal-2786c') {
    throw new Error('Product images can only be uploaded to the Fitness Species Firebase project.');
  }
  if (app.options.storageBucket !== 'sellerportal-2786c.firebasestorage.app') {
    throw new Error('The configured Firebase Storage bucket does not match the marketplace bucket.');
  }
  if (!file.size || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Each image must be smaller than 10 MB.');
  }

  const extension = PRODUCT_IMAGE_TYPES[file.type as keyof typeof PRODUCT_IMAGE_TYPES];
  if (!extension) {
    throw new Error('Use a JPEG, PNG, or WebP image.');
  }

  const bitmap = await createImageBitmap(file);
  const isReasonableDimensions = bitmap.width > 0
    && bitmap.height > 0
    && bitmap.width * bitmap.height <= 40_000_000;
  bitmap.close();
  if (!isReasonableDimensions) {
    throw new Error('The image dimensions are invalid or too large.');
  }

  const objectPath = `sellers/${user.uid}/products/${crypto.randomUUID()}.${extension}`;
  const imageRef = ref(getStorage(app), objectPath);
  const snapshot = await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}
