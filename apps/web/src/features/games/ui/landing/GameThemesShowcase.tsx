import Link from 'next/link';
import type { GameThemesShowcaseProps } from './types';
import { GameArt } from '@/features/games/ui/create/redesign/art/GameArt';
import type { GameId } from '@/features/games/ui/create/redesign/data/themes';
import { SeaBattleFieldSvg } from './SeaBattleFieldSvg';

interface ThemeVisualPreset {
  gradient: string;
  accentBorder: string;
  icon: string;
  chipColors: string[];
}

function getThemeVisual(themeId: string): ThemeVisualPreset {
  const id = themeId.toLowerCase();

  if (id.includes('cyber') || id.includes('neon')) {
    return {
      gradient: 'from-cyan-500/25 via-fuchsia-500/20 to-purple-900/40',
      accentBorder: 'border-cyan-400/40 group-hover:border-cyan-400',
      icon: '⚡',
      chipColors: ['bg-cyan-400', 'bg-fuchsia-500', 'bg-cyan-300'],
    };
  }
  if (id.includes('sunset') || id.includes('tropical')) {
    return {
      gradient: 'from-amber-500/25 via-rose-500/20 to-indigo-900/40',
      accentBorder: 'border-amber-400/40 group-hover:border-amber-400',
      icon: '🌅',
      chipColors: ['bg-amber-400', 'bg-rose-500', 'bg-violet-400'],
    };
  }
  if (
    id.includes('forest') ||
    id.includes('nature') ||
    id.includes('elemental')
  ) {
    return {
      gradient: 'from-emerald-500/25 via-teal-500/20 to-green-950/40',
      accentBorder: 'border-emerald-400/40 group-hover:border-emerald-400',
      icon: '🌲',
      chipColors: ['bg-emerald-400', 'bg-teal-300', 'bg-lime-400'],
    };
  }
  if (id.includes('nebula') || id.includes('cosmic') || id.includes('space')) {
    return {
      gradient: 'from-violet-600/25 via-indigo-500/20 to-slate-950/50',
      accentBorder: 'border-violet-400/40 group-hover:border-violet-400',
      icon: '🌌',
      chipColors: ['bg-violet-400', 'bg-indigo-300', 'bg-fuchsia-400'],
    };
  }
  if (id.includes('pixel') || id.includes('arcade')) {
    return {
      gradient: 'from-yellow-400/25 via-red-500/20 to-blue-900/40',
      accentBorder: 'border-yellow-400/40 group-hover:border-yellow-400',
      icon: '👾',
      chipColors: ['bg-yellow-400', 'bg-red-400', 'bg-blue-400'],
    };
  }
  if (id.includes('cartoon') || id.includes('village')) {
    return {
      gradient: 'from-orange-400/25 via-pink-400/20 to-amber-900/40',
      accentBorder: 'border-orange-400/40 group-hover:border-orange-400',
      icon: '🎨',
      chipColors: ['bg-orange-400', 'bg-pink-400', 'bg-amber-300'],
    };
  }
  if (
    id.includes('vintage') ||
    id.includes('wood') ||
    id.includes('steampunk')
  ) {
    return {
      gradient: 'from-amber-700/30 via-yellow-800/20 to-stone-900/50',
      accentBorder: 'border-amber-600/40 group-hover:border-amber-500',
      icon: '🏛️',
      chipColors: ['bg-amber-600', 'bg-yellow-700', 'bg-amber-400'],
    };
  }
  if (
    id.includes('monochrome') ||
    id.includes('noir') ||
    id.includes('marble')
  ) {
    return {
      gradient: 'from-slate-300/20 via-zinc-500/15 to-zinc-950/60',
      accentBorder: 'border-slate-400/40 group-hover:border-slate-300',
      icon: '♟️',
      chipColors: ['bg-slate-200', 'bg-zinc-500', 'bg-slate-400'],
    };
  }
  if (id.includes('arcane')) {
    return {
      gradient: 'from-purple-600/30 via-pink-600/20 to-indigo-950/50',
      accentBorder: 'border-purple-400/40 group-hover:border-purple-400',
      icon: '🔮',
      chipColors: ['bg-purple-400', 'bg-pink-400', 'bg-indigo-300'],
    };
  }

  return {
    gradient: 'from-blue-500/25 via-indigo-500/20 to-slate-900/40',
    accentBorder: 'border-blue-400/40 group-hover:border-blue-400',
    icon: '🎯',
    chipColors: ['bg-blue-400', 'bg-indigo-400', 'bg-sky-300'],
  };
}

const SUPPORTED_GAME_IDS = new Set<string>([
  'critical_v1',
  'sea_battle_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'chess_v1',
  'checkers_v1',
  'cat_dash_v1',
]);

export function GameThemesShowcase({
  gameId,
  title = 'Visual Themes & Board Styles',
  kicker = 'Customization',
  subtitle,
  themes,
  baseHref,
  createRoomLabel = 'Play with Theme',
  comingSoon = false,
}: GameThemesShowcaseProps) {
  if (!themes || themes.length === 0) return null;

  const isSeaBattle = gameId === 'sea_battle_v1';
  const hasRealArt = gameId && SUPPORTED_GAME_IDS.has(gameId);

  return (
    <section className="box-border flex flex-col gap-6 py-8">
      <div className="box-border flex flex-col gap-1">
        {kicker ? (
          <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            {kicker}
          </span>
        ) : null}
        <h2 className="box-border m-0 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="box-border grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {themes.map((theme) => {
          const href =
            baseHref && !comingSoon
              ? `${baseHref}?theme=${theme.id}`
              : undefined;
          const visual = getThemeVisual(theme.id);

          const CardContent = (
            <div
              className={`box-border flex flex-col justify-between h-full p-3 sm:p-4 rounded-2xl bg-[var(--glassBg)] border ${visual.accentBorder} backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden`}
            >
              <div className="box-border flex flex-col gap-3">
                <div className="box-border h-36 sm:h-44 w-full rounded-xl border border-[var(--borderColor)] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform shadow-inner bg-[var(--background)] p-1">
                  {theme.preview ? (
                    theme.preview
                  ) : isSeaBattle ? (
                    <SeaBattleFieldSvg theme={theme.id} />
                  ) : hasRealArt ? (
                    <div className="box-border w-full h-full flex items-center justify-center pointer-events-none select-none">
                      <GameArt
                        gameId={gameId as GameId}
                        themeId={theme.id}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <div
                      className={`box-border w-full h-full bg-gradient-to-br ${visual.gradient} flex flex-col items-center justify-between p-2.5`}
                    >
                      <div className="box-border flex items-center justify-between w-full">
                        <span className="text-base select-none">
                          {visual.icon}
                        </span>
                        <div className="box-border flex items-center gap-1">
                          {visual.chipColors.map((colorClass, cIdx) => (
                            <span
                              key={cIdx}
                              className={`box-border inline-block w-2 h-2 rounded-full ${colorClass} shadow-sm`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="box-border text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--foreground)] px-2 py-0.5 rounded-md bg-[var(--background)]/75 backdrop-blur-md border border-[var(--borderColor)] shadow-sm">
                        {theme.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="box-border flex flex-col gap-1">
                  <div className="box-border flex items-center justify-between gap-1">
                    <span className="box-border text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                      {theme.name}
                    </span>
                    {theme.tag ? (
                      <span className="box-border text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-[var(--primary)]/10 text-[var(--primary)]">
                        {theme.tag}
                      </span>
                    ) : null}
                  </div>
                  {theme.description ? (
                    <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-70 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {href ? (
                <div className="box-border pt-3 mt-1 border-t border-[var(--borderColor)]/40">
                  <span className="box-border text-xs font-semibold text-[var(--primary)] group-hover:underline inline-flex items-center gap-1">
                    {createRoomLabel} →
                  </span>
                </div>
              ) : null}
            </div>
          );

          if (href) {
            return (
              <Link
                key={theme.id}
                href={href}
                className="box-border block text-inherit no-underline"
              >
                {CardContent}
              </Link>
            );
          }

          return <div key={theme.id}>{CardContent}</div>;
        })}
      </div>
    </section>
  );
}
