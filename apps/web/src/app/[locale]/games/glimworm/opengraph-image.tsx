import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Glimworm — free online glow-worm snake arena on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function GlimwormOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.glimworm_v1?.landing;

  return renderOgCard({
    kicker: landing?.hero?.eyebrow ?? 'Free · 2–10 players · No signup',
    title: 'Glimworm',
    subtitle:
      landing?.hero?.tagline ??
      'Free online glow-worm arena — slither, survive, eat the lights',
    accent: '#3ddc97',
    gradient: ['#0c1a18', '#020807'],
  });
}
