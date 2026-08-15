import { Typography, PageTitle } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export function PaymentHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center -mb-12">
      <div className="flex flex-col items-stretch -mb-2 [display:inline-flex]">
        <PageTitle size="xl" gradient>
          {t('payments.title') || 'Support the Project'}
        </PageTitle>
      </div>
      <Typography uiSize="lg" alpha="medium" textCenter>
        {t('payments.subtitle') || 'Secure and fast payments powered by PayPal'}
      </Typography>
      <Typography
        className={'-mt-4 leading-[28px] max-w-[480px]'}
        uiSize="sm"
        alpha="medium"
        textCenter
      >
        {t('payments.description') ||
          'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations.'}
      </Typography>
    </div>
  );
}
