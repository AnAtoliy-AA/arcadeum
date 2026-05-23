import { CreateRoomButton } from '@arcadeum/ui/components/Button/SpecializedButtons';
import s from './GameCreateView.module.css';
import { RailPreviewArt } from './RailPreviewArt';
import { GAMES, findCriticalTheme, findSeaBattleTheme } from './data/themes';
import type { CreateRoomForm } from './data/form';

interface SummaryLabels {
  livePreview: string;
  defaultRoomName: string;
  game: string;
  expansion: string;
  theme: string;
  maxPlayers: string;
  visibility: string;
  rules: string;
  coreOnly: string;
  packsSuffix: string;
  auto: string;
  upTo: (n: number) => string;
  visibilityPublic: string;
  visibilityUnlisted: string;
  visibilityPrivate: string;
  noRules: string;
  ruleNames: Record<'combos' | 'idle' | 'teams' | 'spectators', string>;
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
}

function themeName(form: CreateRoomForm): string | null {
  if (form.gameId === 'critical_v1')
    return findCriticalTheme(form.themeId).name;
  if (form.gameId === 'sea_battle_v1')
    return findSeaBattleTheme(form.themeId).name;
  return null;
}

function themeColor(form: CreateRoomForm): string | null {
  if (form.gameId === 'critical_v1')
    return findCriticalTheme(form.themeId).color;
  if (form.gameId === 'sea_battle_v1')
    return findSeaBattleTheme(form.themeId).color;
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

function activeRules(form: CreateRoomForm, labels: SummaryLabels): string {
  const game = GAMES[form.gameId];
  const names: string[] = [];
  if (game.rules.includes('combos') && form.rules.combos)
    names.push(labels.ruleNames.combos);
  if (form.rules.idle) names.push(labels.ruleNames.idle);
  if (game.rules.includes('teams') && form.rules.teams)
    names.push(labels.ruleNames.teams);
  if (form.rules.spectators) names.push(labels.ruleNames.spectators);
  return names.length ? names.join(' · ') : labels.noRules;
}

function expansionSummary(form: CreateRoomForm, labels: SummaryLabels): string {
  if (form.gameId !== 'critical_v1') return '—';
  const extras = form.expansionPackIds.filter((id) => id !== 'core');
  if (extras.length === 0) return labels.coreOnly;
  return `${extras.length} ${labels.packsSuffix}`;
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
}: Props) {
  const game = GAMES[form.gameId];
  const tName = themeName(form);
  const tColor = themeColor(form);
  const sub = tName
    ? `${game.title.toUpperCase()} · ${tName.toUpperCase()}`
    : game.title.toUpperCase();
  const displayTitle = form.roomName.trim() || labels.defaultRoomName;

  return (
    <aside
      className={s.rail}
      aria-label={labels.livePreview}
      data-testid="preview-rail"
    >
      <div className={s.railArt}>
        <RailPreviewArt gameId={form.gameId} themeId={form.themeId} />
        <div className={s.railArtTag}>
          <span className={s.railArtDot} aria-hidden="true" />
          {labels.livePreview}
        </div>
        <div className={s.railArtOverlay}>
          <h3 className={s.railArtTitle}>{displayTitle}</h3>
          <span className={s.railArtSub}>{sub}</span>
        </div>
        {tName ? (
          <div
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)',
              fontSize: 11,
              fontWeight: 600,
              color: '#f5f3ff',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: tColor ?? '#fff',
              }}
            />
            {tName}
          </div>
        ) : null}
      </div>

      <div className={s.railSummary}>
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.game}</span>
          <span className={s.railRowValue}>{game.title}</span>
        </div>
        {game.hasExpansion ? (
          <div className={s.railRow}>
            <span className={s.railRowLabel}>{labels.expansion}</span>
            <span className={s.railRowValue}>
              {expansionSummary(form, labels)}
            </span>
          </div>
        ) : null}
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
        <div className={s.railRow}>
          <span className={s.railRowLabel}>{labels.rules}</span>
          <span className={s.railRowValue}>{activeRules(form, labels)}</span>
        </div>
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
