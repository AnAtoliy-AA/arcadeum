import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { PaymentSuccessView } from './PaymentSuccessView';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Payment Successful',
    description: 'Thank you for your purchase!',
    path: routes.paymentSuccess,
    index: false,
    locale,
  });
}

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
