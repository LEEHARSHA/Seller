import type { User } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

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
  if (!API_BASE_URL) {
    throw new Error('The seller API URL is not configured. Set NEXT_PUBLIC_API_URL for this deployment.');
  }

  const token = await user.getIdToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
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
        : message;
      throw Object.assign(new Error(actionableMessage), { status: response.status, data });
    }

    return (data ?? (null as T)) as T;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      throw error;
    }

    throw Object.assign(
      new Error('Unable to connect to the Fitness Species backend. Please check your connection and try again.'),
      { isNetworkError: true },
    );
  }
}
