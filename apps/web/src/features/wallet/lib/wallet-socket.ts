import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from '@/shared/lib/api-base';

function resolveSocketUrl(): string {
  const apiUrl = resolveApiUrl('');
  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiUrl.replace(/\/$/, '');
  }
}

const SOCKET_BASE = resolveSocketUrl();

// Wallet-only namespace. `autoConnect: false` so we only open the connection
// when an authenticated user is present (connectWalletSocket is called from
// WalletLiveBridge on mount). websocket-only transport skips polling preamble.
export const walletSocket: Socket = io(`${SOCKET_BASE}/wallet`, {
  transports: ['websocket'],
  autoConnect: false,
});

/**
 * Apply the auth token and connect (if not already connected).
 * No `joinWallet` emit is needed — the BE WalletGateway reads the JWT on
 * connection and subscribes the socket to the user's own room.
 */
export function connectWalletSocket(token: string): void {
  walletSocket.auth = { token };
  if (!walletSocket.connected) walletSocket.connect();
}

export function disconnectWalletSocket(): void {
  walletSocket.disconnect();
}
