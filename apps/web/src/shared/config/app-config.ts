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
  linkedinDeveloper?: string;
  tiktok?: string;
  threads?: string;
  x?: string;
  discord?: string;
  github?: string;
  telegram?: string;
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
  videoUploadDate: string;
  seoTitle: string;
  seoDescription: string;
  primaryCta: CtaConfig;
  supportCta: CtaConfig;
  downloads: DownloadSectionConfig;
  social: SocialConfig;
  siteUrl: string;
  verification: VerificationConfig;
  supportEmail: string;
  workingHours: string;
  privacyEmail: string;
  legalName: string;
  idCode: string;
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

/**
 * Ensure the upload date includes a time zone offset so Google's
 * Structured Data validator doesn't flag it as missing/invalid.
 * Accepts "YYYY-MM-DD" or full ISO 8601; always returns with time + tz.
 */
function normalizeUploadDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00+00:00`;
  }
  return value;
}

function readAppConfig(): WebAppConfig {
  const appName = trim(process.env.NEXT_PUBLIC_APP_NAME) ?? 'Arcadeum';
  const appVersion = trim(process.env.NEXT_PUBLIC_APP_VERSION) ?? '0.0.0';
  const presentationVideoId = parseYouTubeVideoId(
    process.env.NEXT_PUBLIC_PRESENTATION_VIDEO_ID,
  );

  const videoUploadDate = normalizeUploadDate(
    trim(process.env.NEXT_PUBLIC_VIDEO_UPLOAD_DATE) ?? '2025-01-01',
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
    videoUploadDate,
    seoTitle: `${appName} - Play Free Online Board Games with Friends | Battleship & More`,
    seoDescription: `Play free online board games with friends on ${appName} — Battleship, strategy, and card games. Create private rooms, automate rules, and enjoy a polished tabletop experience in your browser. No download, no signup.`,
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
      linkedinDeveloper: trim(
        process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_DEVELOPER,
      ),
      tiktok: trim(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK),
      threads: trim(process.env.NEXT_PUBLIC_SOCIAL_THREADS),
      x: trim(process.env.NEXT_PUBLIC_SOCIAL_X),
      discord: trim(process.env.NEXT_PUBLIC_SOCIAL_DISCORD),
      github:
        trim(process.env.NEXT_PUBLIC_SOCIAL_GITHUB) ??
        'https://github.com/AnAtoliy-AA/arcadeum',
      telegram: trim(process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM),
    },
    siteUrl: trim(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://arcadeum.games',
    verification: {
      google: trim(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
      yandex: trim(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION),
      bing: trim(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
      yahoo: trim(process.env.NEXT_PUBLIC_YAHOO_SITE_VERIFICATION),
    },
    supportEmail:
      trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) ?? 'arcadeum.care@gmail.com',
    workingHours:
      trim(process.env.NEXT_PUBLIC_WORKING_HOURS) ??
      'Mon – Fri, 10:00 – 18:00 (GMT+4)',
    privacyEmail:
      trim(process.env.NEXT_PUBLIC_PRIVACY_EMAIL) ?? 'arcadeum.care@gmail.com',
    legalName:
      trim(process.env.NEXT_PUBLIC_LEGAL_NAME) ??
      'Individual Entrepreneur Anatoliy Aliaksandrau',
    idCode: trim(process.env.NEXT_PUBLIC_ID_CODE) ?? '',
  };
}

export const appConfig = readAppConfig();
