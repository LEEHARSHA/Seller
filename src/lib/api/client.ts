import { auth } from '../firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RequestOptions extends RequestInit {
  token?: string;
  useMockFallback?: boolean;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch (err) {
    console.warn('Could not fetch Firebase ID Token:', err);
  }
  return null;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token: providedToken, headers = {}, ...customOptions } = options;

  let token = providedToken;
  if (!token) {
    token = (await getAuthToken()) || undefined;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error: any) {
    // Re-throw with user-friendly message
    if (error.status) throw error;

    // Network / offline error
    const netError: any = new Error('Unable to connect to Fitness Species servers. Please check your connection.');
    netError.isNetworkError = true;
    throw netError;
  }
}
