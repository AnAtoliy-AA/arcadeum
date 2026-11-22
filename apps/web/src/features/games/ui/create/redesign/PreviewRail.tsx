'use client';

import { CreateRoomButton } from '@arcadeum/ui/components/Button/SpecializedButtons';
import { useTranslation } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import { RailPreviewArt } from './RailPreviewArt';
import { RulesAccess } from './RulesAccess';
import { GAMES } from './data/themes';
import { resolveThemeName } from './SelectedGameCard';
import { supportedRules } from './data/createFlow';
import type { CreateRoomForm } from './data/form';

interface Props {
  form: CreateRoomForm;
  defaultRoomName: string;
  isValid: boolean;
  loading: boolean;
  blocked: boolean;
  error?: string | null;
  onSubmit: () => void;
  onThemeChange?: (theme: string) => void;
}

function Row({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div className={s.railRow}>
      <span className={s.railRowLabel}>{label}</span>
      <span className={s.railRowValue} data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export function PreviewRail({
  form,
  defaultRoomName,
  isValid,
  loading,
  blocked,
  error,
  onSubmit,
  onThemeChange,
}: Props) {
  const { t } = useTranslation();
  const game = GAMES[form.gameId];
  const themeName = resolveThemeName(form.gameId, form.themeId);
  const displayTitle = form.roomName.trim() || defaultRoomName;
  const extraPacks = form.expansionPackIds.filter((id) => id !== 'core').length;

  const visibilityText =
    form.visibility === 'public'
      ? t('createRoom.details.visibilityPublic')
      : form.visibility === 'unlisted'
        ? t('createRoom.details.visibilityUnlisted')
        : t('createRoom.details.visibilityPrivate');

  const playersText =
    form.maxPlayers === 'auto'
      ? game.players.min === game.players.max
        ? String(game.players.max)
        : `${t('createRoom.details.auto')} · ${t('createRoom.details.upTo', { n: game.players.max })}`
      : String(form.maxPlayers);

  const ruleNames = supportedRules(form.gameId)
    .filter((k) => k !== 'spectators' && form.rules[k])
    .map((k) => {
      if (k === 'combos') return t('createRoom.rules.combos.title');
      if (k === 'idle') return t('createRoom.rules.idle.title');
      return t('createRoom.rules.teams.title');
    });

  // Say why the button is off, in plain words, right where the user looks.
  const disabledReason = blocked
    ? t('createRoom.cta.whyUnavailable')
    : !isValid
      ? t('createRoom.cta.whyNeedName')
      : null;

  return (
    <aside
      className={s.rail}
      aria-label={t('createRoom.summary.title')}
      data-testid="preview-rail"
    >
      <div className={s.railHeader}>
        <span className={s.railHeaderTag}>
          <span className={s.railArtDot} aria-hidden="true" />
          {t('createRoom.summary.title')}
        </span>
        <h3 className={s.railHeaderTitle} data-testid="preview-room-title">
          {displayTitle}
        </h3>
        <p className={f.railIntro}>{t('createRoom.summary.subtitle')}</p>
      </div>

      <div className={s.railArtContainer}>
        <RailPreviewArt
          gameId={form.gameId}
          themeId={form.themeId}
          onThemeChange={onThemeChange}
        />
      </div>

      <div className={s.railSummary}>
        <Row label={t('createRoom.summary.room')} value={displayTitle} />
        <Row label={t('createRoom.summary.game')} value={game.title} />
        {game.hasThemes && themeName ? (
          <Row label={t('createRoom.summary.theme')} value={themeName} />
        ) : null}
        <Row label={t('createRoom.summary.players')} value={playersText} />
        <Row label={t('createRoom.summary.access')} value={visibilityText} />
        {game.hasExpansion ? (
          <Row
            label={t('createRoom.summary.packs')}
            value={
              extraPacks === 0
                ? t('createRoom.packs.summaryCore')
                : t('createRoom.packs.summaryExtra', { n: extraPacks })
            }
          />
        ) : null}
        <Row
          label={t('createRoom.summary.rules')}
          value={
            ruleNames.length > 0
              ? ruleNames.join(', ')
              : t('createRoom.summary.rulesNone')
          }
        />
        <Row
          label={t('createRoom.summary.ranked')}
          value={
            form.ranked
              ? t('createRoom.summary.yes')
              : t('createRoom.summary.no')
          }
        />
      </div>

      <div className={s.railRulesRow}>
        <RulesAccess gameId={form.gameId} themeId={form.themeId} />
      </div>

      {error ? (
        <div
          className={`${f.notice} ${f.noticeError}`}
          style={{ margin: '0 18px 18px' }}
          role="alert"
          data-testid="create-error"
        >
          <span className={f.noticeTitle}>
            {t('createRoom.errors.submitTitle')}
          </span>
          <span>{error}</span>
          <span>{t('createRoom.errors.submitHelp')}</span>
          <button type="button" className={f.noticeBtn} onClick={onSubmit}>
            {t('createRoom.errors.retry')}
          </button>
        </div>
      ) : null}

      <div className={s.railCta}>
        {disabledReason ? (
          <p className={f.ctaReason} data-testid="create-disabled-reason">
            {disabledReason}
          </p>
        ) : null}
        <CreateRoomButton
          type="button"
          disabled={!isValid || loading || blocked}
          onClick={onSubmit}
          fullWidth
          data-testid="create-room-button"
        >
          {loading ? t('createRoom.cta.creating') : t('createRoom.cta.create')}
        </CreateRoomButton>
        <p className={f.ctaNext}>{t('createRoom.cta.next')}</p>
        <p className={s.createCaption}>{t('createRoom.cta.shortcut')}</p>
      </div>
    </aside>
  );
}
