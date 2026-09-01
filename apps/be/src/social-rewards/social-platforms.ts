export const SUPPORTED_SOCIAL_PLATFORMS = [
  'discord',
  'telegram',
  'x',
  'github',
  'youtube',
  'instagram',
  'tiktok',
  'threads',
  'facebook',
  'linkedin',
] as const;

export type SocialPlatform = (typeof SUPPORTED_SOCIAL_PLATFORMS)[number];

export function isSupportedSocialPlatform(
  platform: string,
): platform is SocialPlatform {
  return (SUPPORTED_SOCIAL_PLATFORMS as readonly string[]).includes(platform);
}
