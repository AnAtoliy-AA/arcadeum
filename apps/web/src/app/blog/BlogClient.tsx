'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

import type { BlogTranslations } from './BlogPageContent';

const BlogPageDynamic = dynamic(() => import('./BlogPageContent'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

const BlogClient = (props: { t?: BlogTranslations }) => {
  return <BlogPageDynamic {...props} />;
};

export default BlogClient;
