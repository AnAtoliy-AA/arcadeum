import { NextResponse } from 'next/server';
import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { cookies } from 'next/headers';

const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

export async function POST() {
  await requireAdmin();

  try {
    const cookieJar = await cookies();
    const token = cookieJar.get('access_token')?.value;

    const res = await fetch(`${BE_URL}/admin/cluster-reload`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Cluster reload request failed' },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
