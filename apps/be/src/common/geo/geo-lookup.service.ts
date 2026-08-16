import { Injectable, Logger } from '@nestjs/common';

const IP_API_URL = 'http://ip-api.com/json/';
const LOOKUP_TIMEOUT_MS = 3_000;

/**
 * Resolves a user's country code from their IP address (ip-api.com).
 * Best-effort: any failure returns null and never throws, so auth flows
 * are never blocked by geo lookup.
 */
@Injectable()
export class GeoLookupService {
  private readonly logger = new Logger(GeoLookupService.name);

  async getCountry(ip: string | null | undefined): Promise<string | null> {
    const cleanIp = ip?.trim();
    if (!cleanIp || cleanIp === 'unknown' || cleanIp === '::1') {
      return null;
    }
    try {
      const res = await fetch(`${IP_API_URL}${cleanIp}?fields=countryCode`, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        countryCode?: string;
        status?: string;
      };
      if (data.status === 'fail') return null;
      return data.countryCode ? data.countryCode.toLowerCase() : null;
    } catch {
      this.logger.debug(`Geo lookup failed for IP ${cleanIp}`);
      return null;
    }
  }
}
