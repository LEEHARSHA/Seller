import type { User } from 'firebase/auth';
import { fetchApi } from './client';
import { ApiResponse } from '../../types';

export async function getCurrentUserFromApi(user: User) {
  return fetchApi<ApiResponse<{ uid: string; email: string; name?: string; role?: string }>>('/api/auth/me', {
    user,
  });
}
