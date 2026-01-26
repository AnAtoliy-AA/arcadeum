import { routes } from './routes';

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

export type WebAppConfig = {
  appName: string;
  seoTitle: string;
  seoDescription: string;
  primaryCta: CtaConfig;
  supportCta: CtaConfig;
  downloads: DownloadSectionConfig;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
};

function trim(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readAppConfig(): WebAppConfig {
  const appName = trim(process.env.NEXT_PUBLIC_APP_NAME) ?? 'Arcadeum';

  const primaryCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_PRIMARY_CTA_HREF) ?? routes.auth;

  const supportCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_SUPPORT_CTA_HREF) ?? routes.support;

  const downloadIosHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_IOS);
  const downloadAndroidHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID);

  return {
    appName,
    seoTitle: `${appName} - Online Board Game Platform`,
    seoDescription: `${appName} is your online platform to play board games with friends.`,
    primaryCta: {
      href: primaryCtaHref,
      label: 'Get started',
    },
    supportCta: {
      href: supportCtaHref,
      label: 'Support Arcadeum',
    },
    downloads: {
      title: 'Install the mobile builds',
      description: 'Grab the latest builds directly from the web app.',
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
    },
  };
}

export const appConfig = readAppConfig();
