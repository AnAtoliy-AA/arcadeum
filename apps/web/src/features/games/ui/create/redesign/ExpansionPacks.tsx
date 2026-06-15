import { useState } from 'react';
import s from './GameCreateView.module.scss';
import { EXPANSION_PACK_LIST } from './data/themes';

interface Props {
  value: string[];
  labels: {
    barTitle: string;
    barDesc: string;
    selectAll: string;
    clearExtras: string;
    show: string;
    hide: string;
    alwaysOn: string;
    coreSummary: string;
    cardsSuffix: string;
  };
  onChange: (ids: string[]) => void;
}

export function ExpansionPacks({ value, labels, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const extras = EXPANSION_PACK_LIST.filter((p) => !p.locked);
  const allExtrasSelected = extras.every((p) => value.includes(p.id));

  const summaryText =
    value.length <= 1
      ? labels.coreSummary
      : `${value.length - 1} ${value.length - 1 === 1 ? 'pack' : 'packs'}`;

  function toggle(id: string) {
    const pack = EXPANSION_PACK_LIST.find((p) => p.id === id);
    if (!pack || pack.locked) return;
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(next);
  }

  function selectAllOrClear() {
    if (allExtrasSelected) {
      onChange(['core']);
    } else {
      onChange(['core', ...extras.map((p) => p.id)]);
    }
  }

  return (
    <>
      <div className={s.expansionBar}>
        <div className={s.expansionBarText}>
          <p className={s.expansionBarTitle}>{labels.barTitle}</p>
          <p className={s.expansionBarDesc}>{labels.barDesc}</p>
        </div>
        <div className={s.expansionBarRight}>
          <button
            type="button"
            className={s.linkBtn}
            onClick={selectAllOrClear}
          >
            {allExtrasSelected ? labels.clearExtras : labels.selectAll}
          </button>
          <button
            type="button"
            className={s.linkBtn}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? labels.hide : labels.show} {summaryText}
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
                      {pack.count} {labels.cardsSuffix}
                    </span>
                    {pack.locked ? (
                      <span className={`${s.packChip} ${s.packChipLocked}`}>
                        {labels.alwaysOn}
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
    </>
  );
}
