// Campaign URL builder (roadmap 7A). Generates tracked URLs for marketing
// campaigns so attribution.ts can capture UTM params on the landing page.

import { appConfig } from '@/shared/config/app-config';

export interface CampaignUrlParams {
  /** Base path (e.g. '/en/games/sea-battle'). */
  path: string;
  /** Traffic source (e.g. 'reddit', 'tiktok', 'google'). */
  source: string;
  /** Marketing medium (e.g. 'social', 'cpc', 'organic'). */
  medium: string;
  /** Campaign identifier (e.g. 'seabattle_launch'). */
  campaign: string;
  /** Optional keyword or term. */
  term?: string;
  /** Optional content variant (e.g. 'video_1', 'post_3'). */
  content?: string;
  /** Optional ref code for direct invites. */
  ref?: string;
}

/**
 * Build a full campaign URL with UTM parameters.
 */
export function buildCampaignUrl({
  path,
  source,
  medium,
  campaign,
  term,
  content,
  ref,
}: CampaignUrlParams): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  });
  if (term) params.set('utm_term', term);
  if (content) params.set('utm_content', content);
  if (ref) params.set('ref', ref);

  const base = path.startsWith('http')
    ? path
    : `${appConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  return `${base}?${params.toString()}`;
}

/**
 * Pre-built campaign URLs for the 30-day growth plan.
 * Usage: buildCampaignUrl(CAMPAIGNS.seaBattle.reddit)
 */
export const CAMPAIGNS = {
  seaBattle: {
    reddit: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'reddit',
        medium: 'social',
        campaign: 'seabattle',
      }),
    tiktok: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'tiktok',
        medium: 'social',
        campaign: 'seabattle',
      }),
    google: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'google',
        medium: 'organic',
        campaign: 'seabattle',
      }),
    discord: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'discord',
        medium: 'social',
        campaign: 'seabattle',
      }),
    linkedin: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'linkedin',
        medium: 'social',
        campaign: 'seabattle',
      }),
    youtube: (path: string) =>
      buildCampaignUrl({
        path,
        source: 'youtube',
        medium: 'video',
        campaign: 'seabattle',
      }),
  },
} as const;
