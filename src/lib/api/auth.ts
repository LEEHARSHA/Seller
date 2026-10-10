import { fetchApi } from './client';
import { ApiResponse } from '../../types';

export async function getCurrentUserFromApi(token?: string) {
  try {
    const res = await fetchApi<ApiResponse<{ uid: string; email: string; name?: string; role?: string }>>('/api/auth/me', {
      token,
    });
    return res;
  } catch (error) {
    throw error;
  }
}
