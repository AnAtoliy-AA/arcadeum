import { Injectable } from '@nestjs/common';

export interface LiveStatus {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
}

@Injectable()
export class AppService {
  getLiveStatus(): LiveStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
