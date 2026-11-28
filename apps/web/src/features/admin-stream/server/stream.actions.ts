'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  StreamAuditView,
  StreamCommandType,
  StreamSettings,
  StreamSettingsView,
  StreamStatusView,
} from './stream.types';

export type StreamActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'validation' | 'conflict' | 'forbidden' | 'generic';
      /** Backend validation code, e.g. `stream.bannerProfanity`. */
      code?: string;
    };

async function failure(res: Response): Promise<StreamActionResult<never>> {
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (res.status === 409) return { ok: false, error: 'conflict' };
  if (res.status === 400) {
    let code: string | undefined;
    try {
      const body = (await res.json()) as { message?: unknown };
      if (typeof body.message === 'string') code = body.message;
    } catch {
      /* no body */
    }
    return { ok: false, error: 'validation', code };
  }
  return { ok: false, error: 'generic' };
}

export async function saveStreamSettingsAction(input: {
  settings: StreamSettings;
  expectedVersion: number;
}): Promise<StreamActionResult<StreamSettingsView>> {
  const res = await serverAuthFetch('/admin/stream/settings', {
    method: 'PUT',
    body: JSON.stringify({
      ...input.settings,
      expectedVersion: input.expectedVersion,
    }),
  });
  if (!res.ok) return failure(res);
  revalidatePath('/admin/stream');
  return { ok: true, data: (await res.json()) as StreamSettingsView };
}

export async function sendStreamCommandAction(input: {
  type: StreamCommandType;
  graceful?: boolean;
}): Promise<StreamActionResult<{ id: string }>> {
  const res = await serverAuthFetch('/admin/stream/command', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) return failure(res);
  return { ok: true, data: (await res.json()) as { id: string } };
}

export async function loadStreamStatusAction(): Promise<
  StreamActionResult<StreamStatusView>
> {
  const res = await serverAuthFetch('/admin/stream/status');
  if (!res.ok) return failure(res);
  return { ok: true, data: (await res.json()) as StreamStatusView };
}

export async function loadStreamAuditAction(): Promise<
  StreamActionResult<StreamAuditView[]>
> {
  const res = await serverAuthFetch('/admin/stream/audit?limit=30');
  if (!res.ok) return failure(res);
  return { ok: true, data: (await res.json()) as StreamAuditView[] };
}

export async function loadStreamSettingsAction(): Promise<
  StreamActionResult<StreamSettingsView>
> {
  const res = await serverAuthFetch('/admin/stream/settings');
  if (!res.ok) return failure(res);
  return { ok: true, data: (await res.json()) as StreamSettingsView };
}
