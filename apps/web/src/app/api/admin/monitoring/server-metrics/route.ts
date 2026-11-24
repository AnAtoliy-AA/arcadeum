import { NextResponse } from 'next/server';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE_NAMES, findCookie } from '@/shared/lib/auth-cookies';

const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

async function beFetch(path: string) {
  const cookieJar = await cookies();
  const token = findCookie(cookieJar, ACCESS_COOKIE_NAMES)?.value;

  return fetch(`${BE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function GET() {
  await requireAdmin();

  try {
    const res = await beFetch('/admin/server-metrics');

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Server metrics unavailable' },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
