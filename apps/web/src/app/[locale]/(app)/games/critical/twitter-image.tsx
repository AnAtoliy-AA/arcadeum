import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Critical — free exploding card game online on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function CriticalTwitterImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.critical_v1?.landing;

  return renderOgCard({
    kicker: landing?.hero?.eyebrow ?? 'Free · 2–5 players · No signup',
    title: 'Critical',
    subtitle:
      landing?.hero?.tagline ??
      'A free online card game of bluff, theft, and explosive luck',
    accent: '#ff6b6b',
    gradient: ['#1a0f1f', '#0a0612'],
  });
}
