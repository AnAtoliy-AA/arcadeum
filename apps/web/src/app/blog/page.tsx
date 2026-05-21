import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import BlogClient from './BlogClient';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: `Latest news, deep-dives, and design notes from the ${appConfig.appName} team — what we're building and why.`,
  path: routes.blog,
  ogType: 'article',
  keywords: ['arcadeum blog', 'board game news', 'tabletop design notes'],
});

const BLOG_JSON_LD = [
  webPage({
    name: `Blog — ${appConfig.appName}`,
    description: `News and updates from the ${appConfig.appName} team.`,
    path: routes.blog,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Blog', path: routes.blog },
  ]),
];

export default async function BlogPage() {
  const messages = await getTranslations();
  const t = messages.pages?.blog;

  return (
    <>
      <JsonLd data={BLOG_JSON_LD} />
      <BlogClient t={t} />
    </>
  );
}
