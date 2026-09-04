import { NextResponse } from 'next/server';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { cookies } from 'next/headers';

const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

async function beFetch(path: string) {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;

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
    const res = await beFetch('/health');

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Backend health check failed' },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
