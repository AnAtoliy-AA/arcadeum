import React from 'react';
import Head from 'expo-router/head';

import WelcomeScreen from '@/pages/Welcome/WelcomeScreen';
import { useAppName } from '@/hooks/useAppName';
import { useTranslation } from '@/lib/i18n';

export default function WelcomeRoute() {
  const { t } = useTranslation();
  const appName = useAppName();
  const seoTitle = t('welcome.seoTitle', { appName });
  const seoDescription = t('welcome.seoDescription', { appName });

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="theme-color" content="#0a7ea4" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={appName} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Head>
      <WelcomeScreen />
    </>
  );
}
