import { NextResponse } from 'next/server';
import { requireAdmin } from '@/entities/session/api/requireAdmin';

const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

export async function GET() {
  await requireAdmin();

  try {
    const res = await fetch(`${BE_URL}/health`, {
      cache: 'no-store',
    });

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
