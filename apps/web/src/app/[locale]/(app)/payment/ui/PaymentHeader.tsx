import { YStack, Typography, PageTitle } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export function PaymentHeader() {
  const { t } = useTranslation();

  return (
    <YStack ai="center" mb="$12">
      <YStack mb="$2" display="inline-flex">
        <PageTitle size="xl" gradient>
          {t('payments.title') || 'Support the Project'}
        </PageTitle>
      </YStack>
      <Typography uiSize="lg" alpha="medium" textCenter>
        {t('payments.subtitle') || 'Secure and fast payments powered by PayPal'}
      </Typography>
      <Typography
        uiSize="sm"
        alpha="medium"
        textCenter
        mt="$4"
        lineHeight="$5"
        maxWidth={480}
      >
        {t('payments.description') ||
          'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations.'}
      </Typography>
    </YStack>
  );
}
