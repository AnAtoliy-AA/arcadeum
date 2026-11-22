'use client';

import { useState } from 'react';
import { Toggle } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import { NOTES_MAX, type CreateRoomForm } from './data/form';
import type { GameId } from './data/themes';
import { HouseRules } from './HouseRules';
import type { RoomDetailsPatch } from './RoomDetails';

interface Props {
  gameId: GameId;
  form: CreateRoomForm;
  ruleComingSoon?: Map<string, boolean>;
  onChange: (patch: RoomDetailsPatch) => void;
  onRulesChange: (rules: CreateRoomForm['rules']) => void;
}

/**
 * Everything optional lives behind one disclosure so the main path stays
 * short: house rules, a message for players, a password and ranked play.
 */
export function AdvancedOptions({
  gameId,
  form,
  ruleComingSoon,
  onChange,
  onRulesChange,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = 'gc-more-options';

  return (
    <div>
      <h3 className={f.subhead}>{t('createRoom.steps.more.title')}</h3>
      <p className={f.helper}>{t('createRoom.steps.more.why')}</p>
      <button
        type="button"
        className={f.disclosure}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="more-options-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? '−' : '+'}</span>
        {open
          ? t('createRoom.steps.more.hide')
          : t('createRoom.steps.more.show')}
      </button>

      {/* Kept mounted but hidden so typed values and focus order survive. */}
      <div
        id={panelId}
        className={f.disclosureBody}
        hidden={!open}
        data-testid="more-options-panel"
      >
        <HouseRules
          gameId={gameId}
          value={form.rules}
          ruleComingSoon={ruleComingSoon}
          onChange={onRulesChange}
        />

        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="gc-notes">
            <span>{t('createRoom.details.notes')}</span>
          </label>
          <textarea
            id="gc-notes"
            className={s.textarea}
            value={form.notes}
            maxLength={NOTES_MAX}
            placeholder={t('createRoom.details.notesPlaceholder')}
            rows={3}
            data-testid="notes-input"
            onChange={(e) =>
              onChange({ notes: e.target.value, preset: 'custom' })
            }
          />
          <p className={f.helper}>{t('createRoom.details.notesHelp')}</p>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="gc-password">
            <span>{t('createRoom.details.password')}</span>
          </label>
          <input
            id="gc-password"
            type="password"
            autoComplete="new-password"
            className={s.input}
            value={form.password}
            maxLength={64}
            placeholder={t('createRoom.details.passwordPlaceholder')}
            data-testid="password-input"
            onChange={(e) =>
              onChange({ password: e.target.value, preset: 'custom' })
            }
          />
          <p className={f.helper}>{t('createRoom.details.passwordHelp')}</p>
        </div>

        <div className={s.field}>
          <div className={s.fieldLabel}>
            <span>{t('createRoom.details.ranked')}</span>
            <Toggle
              checked={form.ranked}
              onCheckedChange={(next) =>
                onChange({ ranked: next, preset: 'custom' })
              }
              ariaLabel={t('createRoom.details.ranked')}
              testId="ranked-toggle"
              onLabel="★"
              offLabel=""
            />
          </div>
          <p className={f.helper}>{t('createRoom.details.rankedHelp')}</p>
        </div>
      </div>
    </div>
  );
}
