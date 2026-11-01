import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  'ArcadePet - Free Virtual Pet Simulation Game Online on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function ArcadePetVisual() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 20,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 280,
          height: 340,
          background: '#090d16',
          borderRadius: 40,
          border: '6px solid #00f0ff',
          padding: 24,
          boxShadow: '0 20px 50px rgba(0, 240, 255, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 200,
            height: 180,
            background: '#04161a',
            border: '3px solid #00ffcc',
            borderRadius: 12,
            fontSize: 72,
          }}
        >
          👾
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: '#ff007f',
            }}
          />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: '#00f0ff',
            }}
          />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: '#ffe600',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default async function Image({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);

  const title = messages.games?.arcade_pet_v1?.name ?? 'ArcadePet';
  const tagline =
    messages.games?.arcade_pet_v1?.description ??
    'Retro virtual pet simulation with cross-game treats and evolution';

  return renderGameOgCard({
    kicker: 'ArcadePet Companion',
    title,
    subtitle: tagline,
    accent: '#00f0ff',
    visual: <ArcadePetVisual />,
  });
}
