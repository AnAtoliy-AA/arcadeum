import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import {
  BattlePassUnauthorizedError,
  getBattlePassState,
} from '@/features/battle-pass/server/battle-pass.server';
import { BattlePassView } from '@/features/battle-pass/ui/BattlePassView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getTranslations(locale);
  return {
    title: messages.battlePass?.title ?? 'Battle Pass',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BattlePassPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getTranslations(locale);
  const copy = messages.battlePass;

  let state;
  try {
    state = await getBattlePassState();
  } catch (err) {
    if (err instanceof BattlePassUnauthorizedError) {
      return (
        <PageLayout>
          <p style={{ textAlign: 'center', opacity: 0.75, padding: '48px 0' }}>
            {copy?.signInRequired ?? 'Sign in to view your Battle Pass.'}
          </p>
        </PageLayout>
      );
    }
    throw err;
  }

  return (
    <PageLayout>
      <BattlePassView state={state} />
    </PageLayout>
  );
}
