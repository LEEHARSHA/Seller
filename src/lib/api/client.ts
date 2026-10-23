import type { User } from 'firebase/auth';

const DEFAULT_PRODUCTION_API_URL = 'https://fitness-species-backend.onrender.com';

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configured) {
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_API_URL;
  }
  return 'http://localhost:5000';
}

export interface RequestOptions extends RequestInit {
  user: User;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const { user, headers, ...customOptions } = options;
  if (!user) {
    throw Object.assign(
      new Error('You must be signed in to access this seller service.'),
      { code: 'auth/required', status: 401 },
    );
  }

  const baseUrl = getApiBaseUrl();
  const token = await user.getIdToken();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  requestHeaders.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: requestHeaders,
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const responseData =
        typeof data === 'object' && data !== null
          ? (data as { message?: unknown; error?: unknown })
          : {};
      const message =
        (typeof responseData.message === 'string' && responseData.message) ||
        (typeof responseData.error === 'string' && responseData.error) ||
        `Request failed with status ${response.status}.`;
      const actionableMessage = response.status === 401
        ? 'Your session could not be verified. Please sign in again.'
        : response.status === 403
        ? 'Access denied. You do not have permission to access this seller resource.'
        : response.status === 404
        ? 'The requested endpoint or resource was not found.'
        : message;
      throw Object.assign(new Error(actionableMessage), { status: response.status, data });
    }

    return (data ?? (null as T)) as T;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      throw error;
    }

    throw Object.assign(
      new Error('Unable to connect to the Fitness Species backend. Please check your network or CORS settings.'),
      { isNetworkError: true, originalError: error },
    );
  }
}
