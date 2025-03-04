import { createAuthClient } from 'better-auth/react';
import { API_URL } from '@/conf.ts';

export const authClient = createAuthClient({
  baseURL: API_URL,
});
