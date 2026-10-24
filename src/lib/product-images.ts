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
const MAX_IMAGE_PIXELS = 40_000_000;
const UPLOAD_TIMEOUT_MS = 120_000;
const PRODUCT_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export interface ProductImageUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
}

function getStorageErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = 'code' in error && typeof error.code === 'string' ? ` (${error.code})` : '';
    return `${error.message}${code}`;
  }
  return 'An unknown Firebase Storage error occurred.';
}

export async function uploadSellerProductImage(
  user: User,
  file: File,
  onProgress?: (progress: ProductImageUploadProgress) => void,
): Promise<string> {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase configuration is incomplete. Check the NEXT_PUBLIC_FIREBASE_* environment variables.');
  }
  if (app.options.projectId !== 'sellerportal-2786c') {
    throw new Error('Firebase is configured for a different project. Select the Fitness Species Firebase project.');
  }
  if (app.options.storageBucket !== 'sellerportal-2786c.firebasestorage.app') {
    throw new Error('The configured Firebase Storage bucket does not match the Fitness Species product image bucket.');
  }
  if (auth.currentUser?.uid !== user.uid) {
    throw new Error('Your Firebase sign-in session is no longer active. Sign in again before uploading images.');
  }

  const extension = PRODUCT_IMAGE_TYPES[file.type as keyof typeof PRODUCT_IMAGE_TYPES];
  if (!extension) {
    throw new Error(`Unsupported image type for "${file.name}". Choose a JPEG, PNG, or WebP image.`);
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`"${file.name}" is empty or larger than 10 MB.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`"${file.name}" could not be decoded as an image.`);
  }
  const validDimensions = bitmap.width > 0
    && bitmap.height > 0
    && bitmap.width * bitmap.height <= MAX_IMAGE_PIXELS;
  bitmap.close();
  if (!validDimensions) {
    throw new Error(`"${file.name}" has invalid or excessively large image dimensions.`);
  }

  const objectPath = `sellers/${user.uid}/products/${crypto.randomUUID()}.${extension}`;
  let task: UploadTask;
  try {
    task = uploadBytesResumable(ref(getStorage(app), objectPath), file, {
      contentType: file.type,
    });
  } catch (error) {
    throw new Error(`Unable to start uploading "${file.name}": ${getStorageErrorMessage(error)}`);
  }

  const snapshot = await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    let settled = false;
    let unsubscribe = () => {};
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      task.cancel();
      reject(new Error(`Uploading "${file.name}" timed out after two minutes.`));
    }, UPLOAD_TIMEOUT_MS);

    const finish = (error?: Error, result?: typeof task.snapshot) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubscribe();
      if (error) {
        reject(new Error(`Unable to upload "${file.name}": ${getStorageErrorMessage(error)}`));
      } else if (!result) {
        reject(new Error(`Firebase Storage finished uploading "${file.name}" without returning an object.`));
      } else {
        resolve(result);
      }
    };

    unsubscribe = task.on(
      'state_changed',
      (uploadSnapshot) => onProgress?.({
        bytesTransferred: uploadSnapshot.bytesTransferred,
        totalBytes: uploadSnapshot.totalBytes,
      }),
      (error) => finish(error),
      () => finish(undefined, task.snapshot),
    );
  });

  try {
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    throw new Error(`Image "${file.name}" uploaded, but Firebase could not create its download URL: ${getStorageErrorMessage(error)}`);
  }
}
