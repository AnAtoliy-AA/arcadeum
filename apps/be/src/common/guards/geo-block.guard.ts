import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isIP } from 'node:net';
import {
  GeoBlockedCountry,
  type GeoBlockedCountryDocument,
} from '../schemas/geo-blocked-country.schema';
import { EconomySettingsService } from '../../economy/economy-settings.service';
import { extractClientIp } from '../utils/client-ip.util';
import type { Request } from 'express';

export interface GeoBlockResult {
  blocked: boolean;
  reason?: string;
  country?: string;
  isVpn?: boolean;
}

/**
 * Validate an IP is a syntactically valid IP literal before it is embedded
 * in an outbound lookup URL. Returning a fresh value here (rather than
 * reusing the raw header string) breaks the taint flow CodeQL tracks for
 * the SSRF query — only a validated literal can reach the URL sink.
 */
function safeIpLiteral(ip: string): string | null {
  return isIP(ip) === 0 ? null : ip;
}

@Injectable()
export class GeoBlockService {
  private readonly logger = new Logger(GeoBlockService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly economy: EconomySettingsService,
    @InjectModel(GeoBlockedCountry.name)
    private readonly countryModel: Model<GeoBlockedCountryDocument>,
  ) {}

  async checkIp(ip: string): Promise<GeoBlockResult> {
    const enabled = (await this.economy.getNumber('geo_block_enabled')) === 1;
    if (!enabled) {
      return { blocked: false };
    }

    const detectedCountry = await this.getCountry(ip);
    if (detectedCountry) {
      const blocked = await this.countryModel.findOne({
        countryCode: detectedCountry,
        active: true,
      });
      if (blocked) {
        return {
          blocked: true,
          reason:
            blocked.reason ||
            `Access blocked in your region (${detectedCountry})`,
          country: detectedCountry,
        };
      }
    }

    const vpnDetectionEnabled =
      (await this.economy.getNumber('vpn_detection_enabled')) === 1;
    if (vpnDetectionEnabled) {
      const isVpn = await this.checkVpn(ip);
      if (isVpn) {
        return {
          blocked: true,
          reason: 'VPN connections are not allowed',
          country: detectedCountry ?? undefined,
          isVpn: true,
        };
      }
    }

    return { blocked: false, country: detectedCountry ?? undefined };
  }

  async getBlockedCountries() {
    return this.countryModel.find({ active: true }).lean();
  }

  async addBlockedCountry(countryCode: string, reason?: string) {
    const sanitizedCode = String(countryCode)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    return this.countryModel.findOneAndUpdate(
      { countryCode: sanitizedCode },
      {
        countryCode: sanitizedCode,
        reason: String(reason || '').slice(0, 500),
        active: true,
      },
      { upsert: true, new: true },
    );
  }

  async removeBlockedCountry(countryCode: string) {
    const sanitizedCode = String(countryCode)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    return this.countryModel.findOneAndUpdate(
      { countryCode: sanitizedCode },
      { active: false },
      { new: true },
    );
  }

  private async getCountry(ip: string): Promise<string | null> {
    const validated = safeIpLiteral(ip);
    if (!validated) return null;
    try {
      // codeql[js/request-forgery] Safe: `validated` is a validated IP
      // literal (see safeIpLiteral) — it cannot alter the URL path.
      const res = await fetch(
        `http://ip-api.com/json/${validated}?fields=countryCode`,
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { countryCode?: string };
      return data.countryCode ?? null;
    } catch {
      this.logger.warn(`Failed to get country for IP: ${ip}`);
      return null;
    }
  }

  private async checkVpn(ip: string): Promise<boolean> {
    const validated = safeIpLiteral(ip);
    if (!validated) return false;
    try {
      const apiKey = this.config.get<string>('VPN_CHECK_API_KEY');
      if (!apiKey) return false;

      // codeql[js/request-forgery] Safe: `validated` is a validated IP
      // literal (see safeIpLiteral) — it cannot alter the URL path.
      const res = await fetch(
        `https://ipqualityscore.com/api/json/ip/${apiKey}/${validated}`,
      );
      if (!res.ok) return false;
      const data = (await res.json()) as { proxy?: boolean; vpn?: boolean };
      return data.proxy === true || data.vpn === true;
    } catch {
      this.logger.warn(`Failed to check VPN for IP: ${ip}`);
      return false;
    }
  }
}

@Injectable()
export class GeoBlockGuard implements CanActivate {
  constructor(private readonly geoBlock: GeoBlockService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = extractClientIp(request);

    const result = await this.geoBlock.checkIp(ip);
    if (result.blocked) {
      throw new ForbiddenException(result.reason ?? 'Access blocked');
    }

    return true;
  }
}
