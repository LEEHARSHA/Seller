import type { User } from 'firebase/auth';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { app, auth, hasFirebaseConfig } from './firebase';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 120_000;
const PRODUCT_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export interface ProductImageUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface ProductImageUploadOptions {
  onProgress?: (progress: ProductImageUploadProgress) => void;
  signal?: AbortSignal;
}

function validateImageFile(file: File): string {
  if (!file.size || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Each image must be smaller than 10 MB.');
  }

  const extension = PRODUCT_IMAGE_TYPES[file.type as keyof typeof PRODUCT_IMAGE_TYPES];
  if (!extension) {
    throw new Error('Use a JPEG, PNG, or WebP image.');
  }

  return extension;
}

export async function uploadSellerProductImage(
  user: User,
  file: File,
  options: ProductImageUploadOptions = {},
): Promise<string> {
  if (!hasFirebaseConfig) {
    console.error('[product-image-upload] failed', { code: 'firebase/config-missing' });
    throw new Error('Firebase is not configured. Image uploads are unavailable.');
  }
  if (app.options.projectId !== 'sellerportal-2786c') {
    console.error('[product-image-upload] failed', { code: 'firebase/project-mismatch' });
    throw new Error('Product images can only be uploaded to the Fitness Species Firebase project.');
  }
  if (app.options.storageBucket !== 'sellerportal-2786c.firebasestorage.app') {
    console.error('[product-image-upload] failed', { code: 'firebase/bucket-mismatch' });
    throw new Error('The configured Firebase Storage bucket does not match the marketplace bucket.');
  }
  if (auth.currentUser?.uid !== user.uid) {
    console.error('[product-image-upload] failed', { code: 'auth/user-mismatch' });
    throw new Error('Your Firebase session is no longer active. Sign in again before uploading.');
  }

  let extension: string;
  try {
    extension = validateImageFile(file);

    const bitmap = await createImageBitmap(file);
    const isReasonableDimensions = bitmap.width > 0
      && bitmap.height > 0
      && bitmap.width * bitmap.height <= 40_000_000;
    bitmap.close();
    if (!isReasonableDimensions) {
      throw new Error('The image dimensions are invalid or too large.');
    }
  } catch (error) {
    console.warn('[product-image-upload] validation failed', {
      contentType: file.type,
      sizeBytes: file.size,
    });
    throw error;
  }

  const objectPath = `sellers/${user.uid}/products/${crypto.randomUUID()}.${extension}`;
  let task: UploadTask;
  try {
    const imageRef = ref(getStorage(app), objectPath);
    task = uploadBytesResumable(imageRef, file, { contentType: file.type });
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'storage/unknown';
    console.error('[product-image-upload] failed', { code });
    throw error;
  }
  const { onProgress, signal } = options;

  console.info('[product-image-upload] started', {
    contentType: file.type,
    sizeBytes: file.size,
  });

  const snapshot = await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    let settled = false;
    let unsubscribe = () => {};
    const removeAbortListener = () => signal?.removeEventListener('abort', cancelUpload);
    const cancelUpload = () => {
      if (settled) return;
      task.cancel();
      finish(Object.assign(new Error('Image upload was canceled.'), { code: 'storage/canceled' }));
    };
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      removeAbortListener();
      task.cancel();
      console.error('[product-image-upload] failed', { code: 'upload/timeout' });
      reject(new Error('Image upload timed out. Check your connection and retry.'));
    }, UPLOAD_TIMEOUT_MS);

    const finish = (error?: Error, result?: UploadTaskSnapshot) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubscribe();
      removeAbortListener();
      if (error) {
        const code = 'code' in error && typeof error.code === 'string' ? error.code : 'storage/unknown';
        console.error('[product-image-upload] failed', { code });
        reject(error);
        return;
      }
      if (!result) {
        reject(new Error('Image upload completed without a storage result.'));
        return;
      }
      resolve(result);
    };

    unsubscribe = task.on(
      'state_changed',
      (uploadSnapshot) => {
        const progress = {
          bytesTransferred: uploadSnapshot.bytesTransferred,
          totalBytes: uploadSnapshot.totalBytes,
          percentage: uploadSnapshot.totalBytes
            ? Math.round((uploadSnapshot.bytesTransferred / uploadSnapshot.totalBytes) * 100)
            : 0,
        };
        console.info('[product-image-upload] progress', { percentage: progress.percentage });
        onProgress?.(progress);
      },
      (error) => finish(error),
      () => finish(undefined, task.snapshot),
    );
    signal?.addEventListener('abort', cancelUpload, { once: true });
    if (signal?.aborted) cancelUpload();
  });

  let downloadUrl: string;
  try {
    downloadUrl = await new Promise<string>((resolve, reject) => {
      let settled = false;
      const finish = (error?: unknown, url?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        signal?.removeEventListener('abort', cancelDownload);
        if (error) {
          reject(error);
        } else if (url) {
          resolve(url);
        } else {
          reject(new Error('Storage returned an empty download URL.'));
        }
      };
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', cancelDownload);
        console.error('[product-image-upload] download URL failed', { code: 'upload/url-timeout' });
        reject(new Error('The image uploaded, but its download URL timed out. Retry before submitting.'));
      }, UPLOAD_TIMEOUT_MS);
      const cancelDownload = () => {
        finish(Object.assign(new Error('Image upload was canceled.'), { code: 'storage/canceled' }));
      };
      signal?.addEventListener('abort', cancelDownload, { once: true });
      if (signal?.aborted) cancelDownload();
      if (!settled) getDownloadURL(snapshot.ref).then(
        (url) => finish(undefined, url),
        (error: unknown) => finish(error),
      );
    });
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'storage/unknown';
    console.error('[product-image-upload] download URL failed', { code });
    throw error;
  }
  console.info('[product-image-upload] completed', { sizeBytes: file.size });
  return downloadUrl;
}
