/**
 * OAuth client configuration service.
 * Handles OAuth client config, OIDC discovery, and client matching.
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OidcDiscoveryDoc, WebClientConfig } from '../lib/types';
import {
  sanitize,
  parseRedirectList,
  parseRedirectEntry,
  normalizeUrl,
} from '../lib/utils';

@Injectable()
export class OAuthClientService {
  private discovery: OidcDiscoveryDoc | null = null;
  private fetchedAt = 0;

  constructor(private readonly config: ConfigService) {}

  /**
   * Build a web client config from environment variables.
   */
  private buildWebClientConfig(opts: {
    idKey: string;
    secretKey?: string;
    fallbackSecret?: string;
    redirectKey?: string;
    originKey?: string;
  }): WebClientConfig | null {
    const id = sanitize(this.config.get<string>(opts.idKey));
    if (!id) {
      return null;
    }

    let secret: string | undefined;
    if (opts.secretKey) {
      secret = sanitize(this.config.get<string>(opts.secretKey));
    }
    if (!secret && opts.fallbackSecret) {
      secret = opts.fallbackSecret;
    }
    if (!secret) {
      return null;
    }

    const redirectValue =
      opts.redirectKey !== undefined
        ? this.config.get<string>(opts.redirectKey)
        : undefined;
    const originValue =
      opts.originKey !== undefined
        ? this.config.get<string>(opts.originKey)
        : undefined;

    const redirectUris = new Set<string>();
    const allowedOrigins = new Set<string>();

    for (const entry of parseRedirectList(redirectValue)) {
      const parsed = parseRedirectEntry(entry);
      if (!parsed) continue;
      if (parsed.exact) {
        redirectUris.add(parsed.exact);
      }
      if (parsed.origin) {
        allowedOrigins.add(parsed.origin);
      }
    }

    for (const entry of parseRedirectList(originValue)) {
      const parsed = parseRedirectEntry(entry);
      if (!parsed?.origin) continue;
      allowedOrigins.add(parsed.origin);
    }

    return {
      id,
      secret,
      redirectUris: Array.from(redirectUris),
      allowedOrigins: Array.from(allowedOrigins),
    } satisfies WebClientConfig;
  }

  /**
   * Get all configured OAuth web clients.
   */
  getWebClientConfigs(): WebClientConfig[] {
    const fallbackSecret = sanitize(
      this.config.get<string>('OAUTH_WEB_CLIENT_SECRET'),
    );

    const configs = [
      this.buildWebClientConfig({
        idKey: 'OAUTH_WEB_CLIENT_ID_NEXT',
        secretKey: 'OAUTH_WEB_CLIENT_SECRET_NEXT',
        fallbackSecret,
        redirectKey: 'OAUTH_WEB_REDIRECT_URI_NEXT',
        originKey: 'OAUTH_WEB_ALLOWED_ORIGINS_NEXT',
      }),
      this.buildWebClientConfig({
        idKey: 'OAUTH_WEB_CLIENT_ID_EXPO',
        secretKey: 'OAUTH_WEB_CLIENT_SECRET_EXPO',
        fallbackSecret,
        redirectKey: 'OAUTH_WEB_REDIRECT_URI_EXPO',
        originKey: 'OAUTH_WEB_ALLOWED_ORIGINS_EXPO',
      }),
      this.buildWebClientConfig({
        idKey: 'OAUTH_WEB_CLIENT_ID',
        secretKey: 'OAUTH_WEB_CLIENT_SECRET',
        redirectKey: 'OAUTH_WEB_REDIRECT_URI',
        originKey: 'OAUTH_WEB_ALLOWED_ORIGINS',
      }),
    ];

    const unique = new Map<string, WebClientConfig>();
    for (const entry of configs) {
      if (!entry) continue;
      if (!unique.has(entry.id)) {
        unique.set(entry.id, entry);
        continue;
      }
      const current = unique.get(entry.id);
      if (!current) continue;
      const merged = new Set<string>([
        ...current.redirectUris,
        ...entry.redirectUris,
      ]);
      const mergedOrigins = new Set<string>([
        ...current.allowedOrigins,
        ...entry.allowedOrigins,
      ]);
      unique.set(entry.id, {
        ...current,
        redirectUris: Array.from(merged),
        allowedOrigins: Array.from(mergedOrigins),
      });
    }

    return Array.from(unique.values());
  }

  /**
   * Get all allowed OAuth client IDs (web + mobile).
   */
  getAllowedOAuthClientIds(): string[] {
    const webClientIds = this.getWebClientConfigs().map((client) => client.id);
    const additional = [
      sanitize(this.config.get<string>('OAUTH_ANDROID_CLIENT_ID')),
      sanitize(this.config.get<string>('OAUTH_IOS_CLIENT_ID')),
    ];
    const uniq = new Set<string>();
    for (const value of [...webClientIds, ...additional]) {
      if (value) {
        uniq.add(value);
      }
    }
    return Array.from(uniq);
  }

  /**
   * Fetch the OIDC discovery document (cached for 10 minutes).
   */
  async getDiscovery(): Promise<OidcDiscoveryDoc> {
    const issuer = this.config.get<string>('OAUTH_ISSUER');
    if (!issuer) throw new InternalServerErrorException('Missing OAUTH_ISSUER');
    const needsRefresh =
      !this.discovery || Date.now() - this.fetchedAt > 10 * 60 * 1000;
    if (!needsRefresh) {
      return this.discovery as OidcDiscoveryDoc;
    }
    const url =
      issuer.replace(/\/?$/, '/') + '.well-known/openid-configuration';
    const res = await fetch(url);
    if (!res.ok) {
      throw new InternalServerErrorException('OIDC discovery failed');
    }
    this.discovery = (await res.json()) as OidcDiscoveryDoc;
    this.fetchedAt = Date.now();
    return this.discovery;
  }

  /**
   * Find a client that allows the given redirect URI.
   */
  findClientForRedirect(
    clients: WebClientConfig[],
    redirectUri: string,
  ): WebClientConfig | undefined {
    const trimmed = sanitize(redirectUri);
    if (!trimmed) {
      return undefined;
    }

    const normalizedUrl = normalizeUrl(trimmed);
    if (!normalizedUrl) {
      return undefined;
    }

    const exactMatch = clients.find((client) =>
      client.redirectUris.includes(normalizedUrl),
    );
    if (exactMatch) {
      return exactMatch;
    }

    let origin: string | undefined;
    try {
      origin = new URL(normalizedUrl).origin;
    } catch {
      return undefined;
    }
    if (!origin) {
      return undefined;
    }

    return clients.find((client) => client.allowedOrigins.includes(origin));
  }

  /**
   * Find the default web client (one with redirect URIs).
   */
  findDefaultWebClient(
    clients: WebClientConfig[],
  ): WebClientConfig | undefined {
    return (
      clients.find((client) => client.redirectUris.length > 0) ?? clients[0]
    );
  }

  /**
   * Find a client by request origin header.
   */
  findClientByOrigin(
    clients: WebClientConfig[],
    origin: string,
  ): { client: WebClientConfig; redirectUri?: string } | undefined {
    const normalized = this.normalizeOrigin(origin);
    if (!normalized) {
      return undefined;
    }

    const matches = clients.filter((client) =>
      client.allowedOrigins.includes(normalized),
    );
    if (matches.length === 0) {
      return undefined;
    }

    const pickRedirect = (client: WebClientConfig): string | undefined => {
      for (const candidate of client.redirectUris) {
        const candidateOrigin = this.normalizeOrigin(candidate);
        if (candidateOrigin === normalized) {
          return candidate;
        }
      }
      return client.redirectUris[0];
    };

    const preferred = matches.find((client) =>
      client.redirectUris.some(
        (candidate) => this.normalizeOrigin(candidate) === normalized,
      ),
    );

    const selected = preferred ?? matches[0];
    const redirectUri = pickRedirect(selected);
    return { client: selected, redirectUri };
  }

  /**
   * Normalize a URL to its origin.
   */
  normalizeOrigin(value: string): string | undefined {
    try {
      return new URL(value).origin;
    } catch {
      return undefined;
    }
  }
}
