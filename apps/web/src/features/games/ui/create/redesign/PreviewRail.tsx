import { CreateRoomButton } from '@arcadeum/ui/components/Button/SpecializedButtons';
import s from './GameCreateView.module.scss';
import { RailPreviewArt } from './RailPreviewArt';
import { RulesAccess } from './RulesAccess';
import { GAMES, findCriticalTheme, findSeaBattleTheme } from './data/themes';
import { getThemeById } from '@/features/games/lib/shared-themes';
import type { CreateRoomForm } from './data/form';

interface SummaryLabels {
  livePreview: string;
  defaultRoomName: string;
  roomName?: string;
  game: string;
  theme: string;
  maxPlayers: string;
  visibility: string;
  auto: string;
  upTo: (n: number) => string;
  visibilityPublic: string;
  visibilityUnlisted: string;
  visibilityPrivate: string;
}

interface Props {
  form: CreateRoomForm;
  isValid: boolean;
  loading: boolean;
  blocked: boolean;
  error?: string | null;
  labels: SummaryLabels;
  cta: {
    create: string;
    creating: string;
    comingSoon: string;
    shortcut: string;
  };
  onSubmit: () => void;
  onThemeChange?: (theme: string) => void;
}

function themeName(form: CreateRoomForm): string | null {
  const theme = getThemeById(form.themeId);
  if (theme) {
    return (
      theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-/g, ' ')
    );
  }
  if (form.gameId === 'critical_v1')
    return findCriticalTheme(form.themeId).name;
  if (form.gameId === 'sea_battle_v1')
    return findSeaBattleTheme(form.themeId).name;
  return null;
}

function visibilityLabel(form: CreateRoomForm, labels: SummaryLabels): string {
  if (form.visibility === 'public') return labels.visibilityPublic;
  if (form.visibility === 'unlisted') return labels.visibilityUnlisted;
  return labels.visibilityPrivate;
}

function maxPlayersLabel(form: CreateRoomForm, labels: SummaryLabels): string {
  const cap = GAMES[form.gameId].players.max;
  if (form.maxPlayers === 'auto') return `${labels.auto} · ${labels.upTo(cap)}`;
  return String(form.maxPlayers);
}

export function PreviewRail({
  form,
  isValid,
  loading,
  blocked,
  error,
  labels,
  cta,
  onSubmit,
  onThemeChange,
}: Props) {
  const game = GAMES[form.gameId];
  const tName = themeName(form);
  const displayTitle = form.roomName.trim() || labels.defaultRoomName;

  return (
    <aside
      className={s.rail}
      aria-label={labels.livePreview}
      data-testid="preview-rail"
    >
      <div className={s.railHeader}>
        <span className={s.railHeaderTag}>
          <span className={s.railArtDot} aria-hidden="true" />
          {labels.livePreview}
        </span>
        <h3 className={s.railHeaderTitle} data-testid="preview-room-title">
          {displayTitle}
        </h3>
      </div>

      <div className={s.railArtContainer}>
        <RailPreviewArt
          gameId={form.gameId}
          themeId={form.themeId}
          onThemeChange={onThemeChange}
        />
      </div>

      <div className={s.railSummary}>
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.roomName ?? 'Room'}</span>
          <span className={s.railRowValue}>{displayTitle}</span>
        </div>
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.game}</span>
          <span className={s.railRowValue}>{game.title}</span>
        </div>
        {game.hasThemes && tName ? (
          <div className={s.railRow}>
            <span className={s.railRowLabel}>{labels.theme}</span>
            <span className={s.railRowValue}>{tName}</span>
          </div>
        ) : null}
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.maxPlayers}</span>
          <span className={s.railRowValue}>
            {maxPlayersLabel(form, labels)}
          </span>
        </div>
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.visibility}</span>
          <span className={s.railRowValue}>
            {visibilityLabel(form, labels)}
          </span>
        </div>
      </div>

      <div className={s.railRulesRow}>
        <RulesAccess gameId={form.gameId} themeId={form.themeId} />
      </div>

      {error ? <div className={s.errorBox}>{error}</div> : null}

      <div className={s.railCta}>
        <CreateRoomButton
          type="button"
          disabled={!isValid || loading || blocked}
          onClick={onSubmit}
          fullWidth
          data-testid="create-room-button"
        >
          {blocked ? cta.comingSoon : loading ? cta.creating : cta.create}
        </CreateRoomButton>
        <p className={s.createCaption}>{cta.shortcut}</p>
      </div>
    </aside>
  );
}
