import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

const COMPRESSION_THRESHOLD_BYTES = 1024;

export class CompressedIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): unknown {
    const ioServer = super.createIOServer(port, {
      ...options,
      perMessageDeflate: {
        threshold: COMPRESSION_THRESHOLD_BYTES,
        zlibDeflateOptions: { level: 6 },
        zlibInflateOptions: { chunkSize: 10 * 1024 },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
      },
    });
    return ioServer as unknown;
  }
}
