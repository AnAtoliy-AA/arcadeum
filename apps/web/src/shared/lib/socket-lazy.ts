import type { Socket } from 'socket.io-client';

type SocketGetter = () => (Socket & { auth?: Record<string, unknown> }) | null;

let offlineGameRouter:
  ((event: string, payload: Record<string, unknown>) => void) | null = null;

export function setOfflineGameRouter(
  fn: ((event: string, payload: Record<string, unknown>) => void) | null,
): void {
  offlineGameRouter = fn;
}

export function isOfflineRoomId(roomId: string): boolean {
  return roomId.startsWith('offline_');
}

export function createLazySocket(getter: SocketGetter): Socket {
  return new Proxy({} as Socket, {
    get(_target, prop, receiver) {
      if (prop === 'emit') {
        return (event: string, payload?: unknown, extra?: unknown) => {
          const record = payload as Record<string, unknown> | undefined;
          if (
            offlineGameRouter &&
            record &&
            typeof record === 'object' &&
            typeof record.roomId === 'string' &&
            isOfflineRoomId(record.roomId)
          ) {
            offlineGameRouter(event, record);
            return true;
          }
          const socket = getter();
          if (!socket) return undefined;
          const bound = Reflect.get(socket, 'emit', receiver) as (
            this: Socket,
            event: string,
            p?: unknown,
            e?: unknown,
          ) => unknown;
          return typeof bound === 'function'
            ? extra === undefined
              ? bound.call(socket, event, payload)
              : bound.call(socket, event, payload, extra)
            : undefined;
        };
      }
      const socket = getter();
      if (!socket) return undefined;
      const value = Reflect.get(socket, prop, receiver);
      if (typeof value === 'function') {
        return value.bind(socket);
      }
      return value;
    },
    set(_target, prop, value) {
      const socket = getter();
      if (!socket) return false;
      return Reflect.set(socket, prop, value);
    },
  });
}
