'use client';

import { GlassCard, Typography, Button } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';

interface AdminErrorTranslations {
  title?: string;
  body?: string;
  retry?: string;
}

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { messages } = useLanguage();
  const t = (
    messages.pages?.admin as { error?: AdminErrorTranslations } | undefined
  )?.error;

  return (
    <GlassCard className={'p-4'} data-testid="admin-error">
      <Typography className={'font-bold'} variant="label" uiSize="lg">
        {t?.title ?? 'Something went wrong'}
      </Typography>
      <Typography variant="body" uiSize="md" alpha="medium">
        {t?.body ?? 'An error occurred while loading this admin page.'}
      </Typography>
      <Button className={'mt-3'} onClick={reset}>
        {t?.retry ?? 'Try again'}
      </Button>
    </GlassCard>
  );
}
