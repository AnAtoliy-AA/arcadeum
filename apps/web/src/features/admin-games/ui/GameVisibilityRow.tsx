'use client';

import { useState, useTransition } from 'react';
import {
  setGameTierAction,
  setVariantTierAction,
} from '../server/admin-games.actions';
import {
  VISIBILITY_TIERS,
  type AdminGameRow,
  type VisibilityTier,
} from '../types';

interface TierLabels {
  all: string;
  premium_plus: string;
  vip_plus: string;
}

interface RowLabels {
  game: string;
  variants: string;
  tier: string;
  save: string;
  saving: string;
  saveSuccess: string;
  saveFailed: string;
  tiers: TierLabels;
}

export function GameVisibilityRow({
  row,
  labels,
}: {
  row: AdminGameRow;
  labels: RowLabels;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasVariants = row.variants.length > 0;

  return (
    <div
      data-testid={`admin-games-row-${row.gameId}`}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {hasVariants ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((v) => !v)}
            style={{
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              color: '#d4d4d8',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span style={{ width: 24 }} aria-hidden />
        )}
        <span
          style={{
            fontWeight: 600,
            color: '#f4f4f5',
            fontSize: 14,
            flex: 1,
          }}
        >
          {row.gameId}
        </span>
        <TierControl
          value={row.tier}
          tiers={labels.tiers}
          saveLabels={labels}
          onSave={(tier) => setGameTierAction({ gameId: row.gameId, tier })}
        />
      </div>
      {expanded && hasVariants && (
        <div style={{ marginTop: 12, paddingLeft: 40 }}>
          {row.variants.map((v) => (
            <div
              key={v.variantId}
              data-testid={`admin-games-variant-${row.gameId}-${v.variantId}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '8px 0',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span
                style={{ fontSize: 13, color: '#d4d4d8', flex: 1 }}
              >
                {v.variantId}
              </span>
              <TierControl
                value={v.tier}
                tiers={labels.tiers}
                saveLabels={labels}
                onSave={(tier) =>
                  setVariantTierAction({
                    gameId: row.gameId,
                    variantId: v.variantId,
                    tier,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TierControl({
  value,
  tiers,
  saveLabels,
  onSave,
}: {
  value: VisibilityTier;
  tiers: TierLabels;
  saveLabels: Pick<RowLabels, 'save' | 'saving' | 'saveSuccess' | 'saveFailed'>;
  onSave: (
    tier: VisibilityTier,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [draft, setDraft] = useState<VisibilityTier>(value);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const dirty = draft !== value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value as VisibilityTier);
          setStatus('idle');
        }}
        disabled={pending}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.3)',
          color: '#f4f4f5',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 13,
        }}
      >
        {VISIBILITY_TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {tiers[tier]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!dirty || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await onSave(draft);
            setStatus(result.ok ? 'success' : 'error');
          })
        }
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          background: dirty
            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
            : 'rgba(255,255,255,0.05)',
          color: dirty ? '#fff' : '#71717a',
          border: 'none',
          fontSize: 12,
          fontWeight: 600,
          cursor: dirty && !pending ? 'pointer' : 'default',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? saveLabels.saving : saveLabels.save}
      </button>
      {status === 'success' && (
        <span style={{ fontSize: 11, color: '#22c55e' }}>
          {saveLabels.saveSuccess}
        </span>
      )}
      {status === 'error' && (
        <span style={{ fontSize: 11, color: '#ef4444' }}>
          {saveLabels.saveFailed}
        </span>
      )}
    </div>
  );
}
