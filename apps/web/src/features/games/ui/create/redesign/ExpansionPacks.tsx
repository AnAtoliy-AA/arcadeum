'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import { EXPANSION_PACK_LIST } from './data/themes';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Optional extra card packs for Critical. Core is always on. The summary chip
 * stays visible so people can see the current choice without opening the list.
 */
export function ExpansionPacks({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const extras = EXPANSION_PACK_LIST.filter((p) => !p.locked);
  const extraCount = value.filter((id) => id !== 'core').length;
  const allExtrasSelected = extras.every((p) => value.includes(p.id));

  const summary =
    extraCount === 0
      ? t('createRoom.packs.summaryCore')
      : t('createRoom.packs.summaryExtra', { n: extraCount });

  function toggle(id: string) {
    const pack = EXPANSION_PACK_LIST.find((p) => p.id === id);
    if (!pack || pack.locked) return;
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  }

  function selectAllOrClear() {
    onChange(
      allExtrasSelected ? ['core'] : ['core', ...extras.map((p) => p.id)],
    );
  }

  return (
    <div data-testid="expansion-packs">
      <div className={s.expansionBar}>
        <div className={s.expansionBarText}>
          <p className={s.expansionBarTitle} data-testid="packs-summary">
            {summary}
          </p>
        </div>
        <div className={s.expansionBarRight}>
          <button
            type="button"
            className={s.linkBtn}
            onClick={selectAllOrClear}
          >
            {allExtrasSelected
              ? t('createRoom.packs.clearExtras')
              : t('createRoom.packs.selectAll')}
          </button>
          <button
            type="button"
            className={s.linkBtn}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t('createRoom.packs.hide') : t('createRoom.packs.show')}
          </button>
        </div>
      </div>

      {open ? (
        <div className={s.expansionList}>
          {EXPANSION_PACK_LIST.map((pack) => {
            const checked = value.includes(pack.id);
            return (
              <div
                key={pack.id}
                role="checkbox"
                aria-checked={checked}
                aria-disabled={pack.locked}
                tabIndex={pack.locked ? -1 : 0}
                data-testid={`pack-${pack.id}`}
                className={`${s.packRow} ${checked ? s.packRowActive : ''} ${pack.locked ? s.packRowLocked : ''}`}
                onClick={() => toggle(pack.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggle(pack.id);
                  }
                }}
              >
                <div
                  className={`${s.packCheck} ${checked ? s.packCheckOn : ''}`}
                >
                  {checked ? '✓' : ''}
                </div>
                <div className={s.packBody}>
                  <div className={s.packHeader}>
                    <span className={s.packName}>{pack.name}</span>
                    <span className={s.packChip}>
                      {t('createRoom.packs.cards', { n: pack.count })}
                    </span>
                    {pack.locked ? (
                      <span className={`${s.packChip} ${s.packChipLocked}`}>
                        {t('createRoom.packs.alwaysOn')}
                      </span>
                    ) : null}
                  </div>
                  <p className={s.packDesc}>{pack.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
