'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';
import type { SupportPageProps } from './SupportPage';

const SupportPageDynamic = dynamic<SupportPageProps>(
  () => import('./SupportPage').then((mod) => mod.default),
  {
    loading: () => <PageLoading layout="grid" />,
    ssr: false,
  },
);

export default function SupportClient(props: SupportPageProps) {
  return <SupportPageDynamic {...props} />;
}
