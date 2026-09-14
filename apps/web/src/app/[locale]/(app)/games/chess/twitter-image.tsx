import { SUPPORTED_LOCALES } from '@/shared/i18n';

export { default, alt, size, contentType } from './opengraph-image';
export const dynamic = 'force-static';
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}
