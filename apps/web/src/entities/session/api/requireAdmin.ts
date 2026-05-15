import 'server-only';
import { notFound } from 'next/navigation';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { getServerAccessToken } from './serverTokens';
import type { AuthUserProfile } from './authApi';

export async function requireAdmin(): Promise<AuthUserProfile> {
  const token = await getServerAccessToken();
  if (!token) notFound();

  let res: Response;
  try {
    res = await fetch(resolveApiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    notFound();
  }
  if (!res.ok) notFound();

  const user = (await res.json()) as AuthUserProfile;
  if (user.role !== 'admin') notFound();
  return user;
}
