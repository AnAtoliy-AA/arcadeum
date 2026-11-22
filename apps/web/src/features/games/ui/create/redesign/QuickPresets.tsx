'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import f from './CreateFlow.module.scss';
import type { PresetId } from './data/form';

type PresetKey = Exclude<PresetId, 'custom'>;

interface Props {
  value: PresetId;
  onChange: (preset: PresetKey) => void;
}

/**
 * One-tap starting setups. Each card says in plain words what it changes, and
 * a note appears when the user has since customised the setup.
 */
export function QuickPresets({ value, onChange }: Props) {
  const { t } = useTranslation();
  const options: Array<{
    id: PresetKey;
    label: string;
    hint: string;
    icon: string;
  }> = [
    {
      id: 'friends',
      icon: '✦',
      label: t('createRoom.presets.friends.label'),
      hint: t('createRoom.presets.friends.hint'),
    },
    {
      id: 'ranked',
      icon: '★',
      label: t('createRoom.presets.ranked.label'),
      hint: t('createRoom.presets.ranked.hint'),
    },
    {
      id: 'party',
      icon: '☉',
      label: t('createRoom.presets.party.label'),
      hint: t('createRoom.presets.party.hint'),
    },
  ];

  return (
    <div>
      <div
        className={f.presetGrid}
        role="radiogroup"
        aria-label={t('createRoom.presets.label')}
        data-testid="quick-presets"
      >
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`preset-${opt.id}`}
              className={`${f.presetCard} ${active ? f.presetCardActive : ''}`}
              onClick={() => onChange(opt.id)}
            >
              <span className={f.presetTitle}>
                <span aria-hidden="true">{opt.icon} </span>
                {opt.label}
              </span>
              <span className={f.presetHint}>{opt.hint}</span>
            </button>
          );
        })}
      </div>
      {value === 'custom' ? (
        <p className={f.helper} data-testid="preset-custom-note">
          {t('createRoom.presets.custom')}
        </p>
      ) : null}
    </div>
  );
}
