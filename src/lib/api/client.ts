import { auth } from '../firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  token?: string;
}

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token: providedToken, headers = {}, ...customOptions } = options;
  const token = providedToken || (await getAuthToken());

  if (!token) {
    throw new Error('You must be signed in to access this seller service.');
  }
  if (!API_BASE_URL) {
    throw new Error('The seller API URL is not configured. Set NEXT_PUBLIC_API_URL for this deployment.');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(headers as Record<string, string>),
      },
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
      throw Object.assign(new Error(message), { status: response.status, data });
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
