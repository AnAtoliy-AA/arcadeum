import PaymentCancelClient from './PaymentCancelClient';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'paymentCancel', noIndex: true })
    : {};
}

/**
 * Payment Cancel Page
 * Use PaymentCancelClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
