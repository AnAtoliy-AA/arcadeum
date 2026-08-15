'use client';

import { CatDashHero } from './CatDashHero';
import { CatDashThemesGrid } from './CatDashThemesGrid';
import { CatDashFinalCtaButtons } from './CatDashFinalCtaButtons';

interface CatDashLandingProps {
  landing?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  gameId: string;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
}

export default function CatDashLanding({
  landing,
  variants,
  gameId,
  createRoomHref,
  roomsHref,
  gamesHref,
  homeHref: _homeHref,
}: CatDashLandingProps) {
  const hero = landing?.hero as Record<string, string> | undefined;
  const highlights = landing?.highlights as
    Record<string, { title?: string; body?: string }> | undefined;
  const steps = landing?.steps as
    Record<string, { title?: string; body?: string }> | undefined;
  const faq = landing?.faq as
    Record<string, { question?: string; answer?: string }> | undefined;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
      <div className="box-border flex flex-col items-stretch gap-8 py-8">
        <CatDashHero
          title={hero?.title ?? 'Cat Dash'}
          subtitle={hero?.subtitle ?? 'Race your cat to victory!'}
          gameId={gameId}
          roomsHref={roomsHref}
          ctaQuickplayLabel={hero?.ctaQuickplay ?? 'Play vs AI'}
          ctaQuickplayErrorLabel={hero?.ctaQuickplayError ?? 'Try again'}
          browseRoomsLabel={hero?.browseRooms ?? 'Browse rooms'}
        />

        {highlights && (
          <div className="box-border flex flex-col items-stretch gap-3">
            <span className="box-border text-[24px] font-bold">
              Why Cat Dash?
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              {Object.values(highlights).map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    backgroundColor: '#1e293b',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {h.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>{h.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {steps && (
          <div className="box-border flex flex-col items-stretch gap-3">
            <span className="box-border text-[24px] font-bold">
              How to Play
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              {Object.values(steps).map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    backgroundColor: '#0f172a',
                    borderRadius: 12,
                    border: '1px solid #1e293b',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                      marginBottom: 8,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {s.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {variants && (
          <div className="box-border flex flex-col items-stretch gap-3">
            <span className="box-border text-[24px] font-bold">
              Pick a Track
            </span>
            <span className="box-border text-[14px] text-[#94a3b8]">
              Each theme gives the track a unique visual style.
            </span>
            <CatDashThemesGrid
              variants={variants as never}
              baseHref={createRoomHref}
            />
          </div>
        )}

        {faq && (
          <div
            className="box-border flex flex-col items-stretch gap-3"
            id="faq"
          >
            <span className="box-border text-[24px] font-bold">FAQ</span>
            {Object.values(faq).map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 20,
                  backgroundColor: '#1e293b',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {item.question}
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="box-border flex flex-col gap-3 items-center py-4">
          <span className="box-border text-[20px] font-bold text-center">
            Ready to Race?
          </span>
          <CatDashFinalCtaButtons
            gameId={gameId}
            roomsHref={roomsHref}
            gamesHref={gamesHref}
            ctaQuickplayLabel={hero?.ctaQuickplay ?? 'Play vs AI'}
            ctaQuickplayErrorLabel={hero?.ctaQuickplayError ?? 'Try again'}
            browseRoomsLabel={hero?.browseRooms ?? 'Browse rooms'}
          />
        </div>
      </div>
    </div>
  );
}
