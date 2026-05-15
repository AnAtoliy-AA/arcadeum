import { io, type Socket } from 'socket.io-client';
import { resolveApiBase } from '@/lib/apiBase';

function resolveWalletSocketUrl(): string {
  const base = resolveApiBase();
  try {
    const url = new URL(base);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return base.replace(/\/$/, '');
  }
}

const SOCKET_BASE = resolveWalletSocketUrl();

type WalletSocketInstance = Socket & {
  auth: Record<string, unknown>;
};

export const walletSocket: Socket = io(`${SOCKET_BASE}/wallet`, {
  transports: ['websocket'],
  autoConnect: false,
}) as WalletSocketInstance;

export function connectWalletSocket(token: string): void {
  const ws = walletSocket as WalletSocketInstance;
  ws.auth = { token };
  if (!walletSocket.connected) {
    walletSocket.connect();
  }
}

export function disconnectWalletSocket(): void {
  if (walletSocket.connected) {
    walletSocket.disconnect();
  }
}
