import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  StreamAuditView,
  StreamSettingsView,
  StreamStatusView,
} from './stream.types';

async function getJson<T>(path: string, what: string): Promise<T> {
  const res = await serverAuthFetch(path);
  if (!res.ok) throw new Error(`${what} failed: ${res.status}`);
  return (await res.json()) as T;
}

export const getStreamSettings = (): Promise<StreamSettingsView> =>
  getJson('/admin/stream/settings', 'getStreamSettings');

export const getStreamStatus = (): Promise<StreamStatusView> =>
  getJson('/admin/stream/status', 'getStreamStatus');

export const getStreamAudit = (): Promise<StreamAuditView[]> =>
  getJson('/admin/stream/audit?limit=30', 'getStreamAudit');
