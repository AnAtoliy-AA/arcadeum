import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import PaymentClient from './PaymentClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Payment',
    description: 'Manage your payments and subscriptions.',
    path: routes.payment,
    index: false,
    locale,
  });
}

export default function PaymentRoute() {
  return <PaymentClient />;
}
