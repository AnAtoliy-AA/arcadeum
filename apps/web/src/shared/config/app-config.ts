import { routes } from './routes';

export const SSR_TIMEOUT =
  process.env.NODE_ENV === 'development' ? 15000 : 5000;

// Browser-initiated requests have no SSR render budget, so they get a more
// generous default. 5s caused spurious "Request timed out" errors on cold
// starts, heavy queries, and slow mobile networks (ARC-594).
export const CLIENT_TIMEOUT = 30000;

type CtaConfig = {
  href: string;
  label: string;
};

type DownloadSectionConfig = {
  title: string;
  description: string;
  iosHref?: string;
  iosLabel: string;
  androidHref?: string;
  androidLabel: string;
};

type SocialConfig = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  threads?: string;
  x?: string;
  discord?: string;
  github?: string;
};

type VerificationConfig = {
  google?: string;
  yandex?: string;
  bing?: string;
  yahoo?: string;
};

export type WebAppConfig = {
  appName: string;
  appVersion: string;
  presentationVideoId?: string;
  seoTitle: string;
  seoDescription: string;
  primaryCta: CtaConfig;
  supportCta: CtaConfig;
  downloads: DownloadSectionConfig;
  social: SocialConfig;
  siteUrl: string;
  verification: VerificationConfig;
};

export function trim(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseYouTubeVideoId(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Handle full URLs like https://www.youtube.com/watch?v=VIDEO_ID
  const urlMatch = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
  );
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Handle bare video ID (assuming ~11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed; // Return as-is if fallback
}

function readAppConfig(): WebAppConfig {
  const appName = trim(process.env.NEXT_PUBLIC_APP_NAME) ?? 'Arcadeum';
  const appVersion = trim(process.env.NEXT_PUBLIC_APP_VERSION) ?? '0.0.0';
  const presentationVideoId = parseYouTubeVideoId(
    process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_ID,
  );

  const primaryCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_PRIMARY_CTA_HREF) ?? routes.auth;

  const supportCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_SUPPORT_CTA_HREF) ?? routes.support;

  const downloadIosHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_IOS);
  const downloadAndroidHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID);

  return {
    appName,
    appVersion,
    presentationVideoId,
    seoTitle: `${appName} - Play Board Games Online | Best Online Board Game Platform`,
    seoDescription: `Play the best board games online with friends on ${appName}. Create private rooms, automate rules, and enjoy a premium tabletop experience in your browser. No registration required.`,
    primaryCta: {
      href: primaryCtaHref,
      label: 'Get started',
    },
    supportCta: {
      href: supportCtaHref,
      label: 'Support Arcadeum',
    },
    downloads: {
      title: 'Install the app',
      description: 'Install Arcadeum on your device for the best experience.',
      iosHref: downloadIosHref,
      iosLabel: 'Download for iOS',
      androidHref: downloadAndroidHref,
      androidLabel: 'Download for Android',
    },
    social: {
      instagram: trim(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
      facebook: trim(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
      youtube: trim(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
      linkedin: trim(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
      threads: trim(process.env.NEXT_PUBLIC_SOCIAL_THREADS),
      x: trim(process.env.NEXT_PUBLIC_SOCIAL_X),
      discord: trim(process.env.NEXT_PUBLIC_SOCIAL_DISCORD),
      github:
        trim(process.env.NEXT_PUBLIC_SOCIAL_GITHUB) ??
        'https://github.com/AnAtoliy-AA/arcadeum',
    },
    siteUrl: trim(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://arcadeum.games',
    verification: {
      google: trim(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
      yandex: trim(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION),
      bing: trim(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
      yahoo: trim(process.env.NEXT_PUBLIC_YAHOO_SITE_VERIFICATION),
    },
  };
}

export const appConfig = readAppConfig();
