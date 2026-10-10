import { auth } from '../firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RequestOptions extends RequestInit {
  token?: string;
  useMockFallback?: boolean;
}

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token: providedToken, headers = {}, ...customOptions } = options;

  const token = providedToken || (await getAuthToken()) || undefined;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
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

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data?.message || data?.error || `Request failed with status ${response.status}.`;
      const error: any = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return (data ?? (null as T)) as T;
  } catch (error: any) {
    if (error?.status) {
      throw error;
    }

    const netError: any = new Error('Unable to connect to the Fitness Species backend. Please check your connection and try again.');
    netError.isNetworkError = true;
    throw netError;
  }
}
