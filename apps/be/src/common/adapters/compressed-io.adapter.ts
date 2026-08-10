import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';
import type { INestApplication } from '@nestjs/common';

const COMPRESSION_THRESHOLD_BYTES = 1024;

export class CompressedIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(app: INestApplication) {
    super(app);
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const pubClient = new Redis(redisUrl);
      const subClient = pubClient.duplicate();
      this.adapterConstructor = createAdapter(pubClient, subClient);
    }
  }

  createIOServer(port: number, options?: ServerOptions): unknown {
    const serverOptions = {
      ...options,
      perMessageDeflate: {
        threshold: COMPRESSION_THRESHOLD_BYTES,
        zlibDeflateOptions: { level: 6 },
        zlibInflateOptions: { chunkSize: 10 * 1024 },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
      },
    };

    if (this.adapterConstructor) {
      Object.assign(serverOptions, { adapter: this.adapterConstructor });
    }

    return super.createIOServer(port, serverOptions) as unknown;
  }
}
