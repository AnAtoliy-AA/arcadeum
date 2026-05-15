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
    <GlassCard p="$4" data-testid="admin-error">
      <Typography variant="label" uiSize="lg" fontWeight="700">
        {t?.title ?? 'Something went wrong'}
      </Typography>
      <Typography variant="body" uiSize="md" alpha="medium">
        {t?.body ?? 'An error occurred while loading this admin page.'}
      </Typography>
      <Button onPress={reset} mt="$3">
        {t?.retry ?? 'Try again'}
      </Button>
    </GlassCard>
  );
}
