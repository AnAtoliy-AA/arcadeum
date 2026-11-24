import { useTranslation } from '@/shared/i18n/useTranslation';
import type { OverlayPlayer, OverlayStat } from '../lib/overlayModel';

const STAT_KEYS = {
  captured: 'pages.stream.stat.captured',
  piecesLeft: 'pages.stream.stat.piecesLeft',
  borneOff: 'pages.stream.stat.borneOff',
  cards: 'pages.stream.stat.cards',
  tokensHome: 'pages.stream.stat.tokensHome',
  bid: 'pages.stream.stat.bid',
} as const;

const LEVEL_KEYS = {
  easy: 'pages.stream.level.easy',
  medium: 'pages.stream.level.medium',
  hard: 'pages.stream.level.hard',
  expert: 'pages.stream.level.expert',
  master: 'pages.stream.level.master',
} as const;

const STYLE_KEYS = {
  aggressive: 'pages.stream.style.aggressive',
  positional: 'pages.stream.style.positional',
  tactical: 'pages.stream.style.tactical',
  defensive: 'pages.stream.style.defensive',
  solid: 'pages.stream.style.solid',
  balanced: 'pages.stream.style.balanced',
  greedy: 'pages.stream.style.greedy',
  gambit: 'pages.stream.style.gambit',
  fortress: 'pages.stream.style.fortress',
  trickster: 'pages.stream.style.trickster',
} as const;

/** Look up a known key, tolerating ids the table does not know. */
function lookup<V extends string>(
  map: Record<string, V>,
  key: string,
): V | null {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
}

function useStatText() {
  const { t } = useTranslation();
  return (stat: OverlayStat) => t(STAT_KEYS[stat.key], { value: stat.value });
}

function usePersonalityText() {
  const { t } = useTranslation();
  return (player: OverlayPlayer): string => {
    const p = player.personality;
    if (!p) return player.isBot ? t('pages.stream.bot') : '';
    if (p.kind === 'chess') {
      const styleKey = lookup(STYLE_KEYS, p.style);
      const style = styleKey ? t(styleKey) : '';
      const rating = t('pages.stream.rating', { rating: p.rating });
      return style ? `${style} | ${rating}` : rating;
    }
    const levelKey = lookup(LEVEL_KEYS, p.level);
    return levelKey ? t(levelKey) : t('pages.stream.bot');
  };
}

export function PlayerCard({
  player,
  chess,
}: {
  player: OverlayPlayer;
  chess: boolean;
}) {
  const statText = useStatText();
  const personalityText = usePersonalityText();
  const { t } = useTranslation();
  const label = personalityText(player);
  const displayName =
    player.personality?.kind === 'chess'
      ? player.personality.name
      : player.name;

  return (
    <div
      data-testid="overlay-player"
      data-active={player.active ? 'true' : 'false'}
      data-winner={player.isWinner ? 'true' : 'false'}
      className={[
        'flex min-h-0 flex-1 basis-0 flex-col justify-center gap-[0.35cqw] overflow-hidden rounded-[0.9cqw] border px-[1.1cqw] py-[0.5cqw]',
        player.active
          ? 'border-[var(--accent)] bg-[rgba(56,189,248,0.14)]'
          : 'border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)]',
        player.isWinner
          ? 'border-[var(--goldAccent)] bg-[rgba(250,204,21,0.14)]'
          : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-[0.8cqw]">
        <span
          data-testid="overlay-player-name"
          className="truncate text-[1.55cqw] font-bold leading-tight"
        >
          {displayName}
        </span>
        {player.side ? (
          <span className="shrink-0 rounded-[0.4cqw] bg-[rgba(255,255,255,0.1)] px-[0.6cqw] text-[1.05cqw] font-semibold uppercase leading-snug">
            {player.side}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-[0.6cqw] text-[1.15cqw] leading-tight text-[var(--neutral)]">
        <span
          data-testid="overlay-player-bot"
          className="shrink-0 rounded-[0.4cqw] bg-[var(--primary)] px-[0.55cqw] font-semibold uppercase text-white"
        >
          {t('pages.stream.bot')}
        </span>
        <span data-testid="overlay-player-label" className="truncate">
          {label}
        </span>
      </div>
      {player.stats.length > 0 ||
      player.score !== null ||
      player.capturedGlyphs ? (
        <div className="flex flex-wrap items-center gap-x-[1cqw] text-[1.2cqw] font-medium leading-tight">
          {chess && player.score !== null ? (
            <span data-testid="overlay-player-score">
              {t('pages.stream.stat.lead', { value: player.score })}
            </span>
          ) : player.score !== null ? (
            <span data-testid="overlay-player-score">
              {t('pages.stream.stat.score', { value: player.score })}
            </span>
          ) : null}
          {player.stats.map((s) => (
            <span key={s.key}>{statText(s)}</span>
          ))}
          {player.capturedGlyphs ? (
            <span
              data-testid="overlay-player-captured"
              className="text-[1.5cqw] tracking-tight"
            >
              {player.capturedGlyphs}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
