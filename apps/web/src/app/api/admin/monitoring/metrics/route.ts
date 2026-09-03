import { NextResponse } from 'next/server';
import { requireAdmin } from '@/entities/session/api/requireAdmin';

const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';

export async function GET() {
  await requireAdmin();

  try {
    const res = await fetch(`${BE_URL}/metrics`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse('Metrics not available', { status: 502 });
    }

    const text = await res.text();
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch {
    return new NextResponse('Backend unreachable', { status: 502 });
  }
}
