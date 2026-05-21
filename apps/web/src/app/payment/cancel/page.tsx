import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import PaymentCancelClient from './PaymentCancelClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Payment Cancelled',
    description: 'Your payment was cancelled.',
    path: routes.paymentCancel,
    index: false,
    locale,
  });
}

export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
