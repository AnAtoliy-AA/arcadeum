type CtaConfig = {
  href: string;
  label: string;
};

type DownloadSectionConfig = {
  title: string;
  description: string;
  iosLabel: string;
  androidLabel: string;
  iosHref?: string;
  androidHref?: string;
};

export type WebAppConfig = {
  appName: string;
  kicker: string;
  tagline: string;
  description: string;
  primaryCta: CtaConfig;
  supportCta: CtaConfig;
  downloads: DownloadSectionConfig;
  seoTitle: string;
  seoDescription: string;
};

function trim(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildTagline(appName: string): string {
  return `${appName} is your remote-friendly arcade for fast tabletop playtests.`;
}

function buildDescription(appName: string): string {
  return `Spin up real-time rooms, rally your playtest crew, and let ${appName} automate rules, scoring, and moderation so you can focus on the fun.`;
}

function buildSeoTitle(appName: string): string {
  return `${appName} · Remote-friendly arcade for tabletop playtests`;
}

function buildSeoDescription(description: string): string {
  return description;
}

function readAppConfig(): WebAppConfig {
  const appName = trim(process.env.NEXT_PUBLIC_APP_NAME) ?? 'Arcadeum';
  const kicker = trim(process.env.NEXT_PUBLIC_WEB_KICKER) ?? 'Remote-friendly tabletop arcade';
  const tagline =
    trim(process.env.NEXT_PUBLIC_WEB_TAGLINE) ?? buildTagline(appName);
  const description =
    trim(process.env.NEXT_PUBLIC_WEB_DESCRIPTION) ?? buildDescription(appName);

  const primaryCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_PRIMARY_CTA_HREF) ?? '/auth';
  const primaryCtaLabel =
    trim(process.env.NEXT_PUBLIC_WEB_PRIMARY_CTA_LABEL) ?? 'Get started';

  const supportCtaHref =
    trim(process.env.NEXT_PUBLIC_WEB_SUPPORT_CTA_HREF) ?? '/support';
  const supportCtaLabel =
    trim(process.env.NEXT_PUBLIC_WEB_SUPPORT_CTA_LABEL) ?? 'Support the developers';

  const downloadTitle =
    trim(process.env.NEXT_PUBLIC_WEB_DOWNLOAD_TITLE) ?? 'Install the mobile builds';
  const downloadDescription =
    trim(process.env.NEXT_PUBLIC_WEB_DOWNLOAD_DESCRIPTION) ??
    'Grab the latest Expo builds for iOS and Android directly from the web app.';
  const downloadIosLabel =
    trim(process.env.NEXT_PUBLIC_WEB_DOWNLOAD_IOS_LABEL) ?? 'Download for iOS';
  const downloadAndroidLabel =
    trim(process.env.NEXT_PUBLIC_WEB_DOWNLOAD_ANDROID_LABEL) ?? 'Download for Android';
  const downloadIosHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_IOS);
  const downloadAndroidHref = trim(process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID);

  const seoTitle =
    trim(process.env.NEXT_PUBLIC_WEB_SEO_TITLE) ?? buildSeoTitle(appName);
  const seoDescription =
    trim(process.env.NEXT_PUBLIC_WEB_SEO_DESCRIPTION) ??
    buildSeoDescription(description);

  return {
    appName,
    kicker,
    tagline,
    description,
    primaryCta: {
      href: primaryCtaHref,
      label: primaryCtaLabel,
    },
    supportCta: {
      href: supportCtaHref,
      label: supportCtaLabel,
    },
    downloads: {
      title: downloadTitle,
      description: downloadDescription,
      iosLabel: downloadIosLabel,
      androidLabel: downloadAndroidLabel,
      iosHref: downloadIosHref,
      androidHref: downloadAndroidHref,
    },
    seoTitle,
    seoDescription,
  };
}

export const appConfig = readAppConfig();
