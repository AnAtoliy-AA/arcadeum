import React from 'react';
import {
  ArcadePetThemeShowcase,
  type ThemeOption,
} from './ArcadePetThemeShowcase';
import type { landingEn } from '@/shared/i18n/messages/arcade-pet-companion-landing';

export type ArcadePetLandingCopy = typeof landingEn;

interface ArcadePetLandingProps {
  gameName: string;
  description: string;
  copy: ArcadePetLandingCopy;
  comingSoon?: boolean;
}

function themeOptions(copy: ArcadePetLandingCopy): readonly ThemeOption[] {
  return [
    { id: 'retro', label: copy.themeRetro, emoji: '🕹️' },
    { id: 'cyberpunk', label: copy.themeCyberpunk, emoji: '⚡' },
    { id: 'zen', label: copy.themeZen, emoji: '🎋' },
    { id: 'underwater', label: copy.themeUnderwater, emoji: '🌊' },
  ];
}

function FeatureCard({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
      <div className="text-3xl" aria-hidden="true">
        {emoji}
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-xs text-neutral-400 leading-relaxed">{body}</p>
    </div>
  );
}

/** Server Component: all copy arrives translated, only the demo is client-side. */
export function ArcadePetLanding({
  gameName,
  description,
  copy,
  comingSoon = false,
}: ArcadePetLandingProps) {
  return (
    <div className="flex flex-col items-center gap-12 w-full py-8 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center max-w-3xl gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <span aria-hidden="true">✨</span> {copy.badge}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          {gameName}
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
          {description}
        </p>
      </div>

      {comingSoon ? (
        <div
          data-testid="arcade-pet-coming-soon-banner"
          className="w-full max-w-xl p-8 rounded-2xl bg-neutral-900/90 border border-amber-500/40 text-center flex flex-col items-center gap-3 shadow-xl backdrop-blur-md"
        >
          <div className="text-4xl" aria-hidden="true">
            🔒
          </div>
          <h2 className="text-xl font-bold text-amber-300">
            {copy.disabledTitle}
          </h2>
          <p className="text-sm text-neutral-300">{copy.disabledBody}</p>
        </div>
      ) : (
        <ArcadePetThemeShowcase
          themes={themeOptions(copy)}
          pickerLabel={copy.themePicker}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <FeatureCard emoji="🥚" title={copy.hatchTitle} body={copy.hatchBody} />
        <FeatureCard
          emoji="🍪"
          title={copy.treatsTitle}
          body={copy.treatsBody}
        />
        <FeatureCard
          emoji="🐲"
          title={copy.evolveTitle}
          body={copy.evolveBody}
        />
      </div>
    </div>
  );
}

export default ArcadePetLanding;
