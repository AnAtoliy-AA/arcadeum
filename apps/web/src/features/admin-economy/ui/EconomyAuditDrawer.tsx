'use client';

import { useEffect, useState, useTransition } from 'react';
import type { EconomyAuditView, EconomyKey } from '../server/economy.types';
import { loadEconomyHistoryAction } from '../server/economy.actions';

interface EconomyAuditDrawerProps {
  open: boolean;
  onClose: () => void;
  economyKey: EconomyKey;
  labels: {
    title: string;
    empty: string;
    from: string;
    to: string;
  };
}

export function EconomyAuditDrawer({
  open,
  onClose,
  economyKey,
  labels,
}: EconomyAuditDrawerProps) {
  const [rows, setRows] = useState<EconomyAuditView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      setRows([]);
      setError(null);
      const result = await loadEconomyHistoryAction({ key: economyKey });
      if (result.ok) {
        setRows(result.data);
      } else {
        setError('Failed to load history.');
      }
    });
  }, [open, economyKey]);

  if (!open) return null;

  const drawerTitle = labels.title.replace('{{key}}', economyKey);

  return (
    <div
      data-testid="economy-audit-drawer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          width: '440px',
          maxWidth: '90vw',
          height: '100%',
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#e4e4e7',
              margin: 0,
            }}
          >
            {drawerTitle}
          </h2>
          <button
            type="button"
            data-testid="economy-audit-close-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {isPending && (
          <div
            data-testid="economy-audit-loading"
            style={{
              color: '#71717a',
              fontSize: '14px',
              textAlign: 'center',
              padding: '32px',
            }}
          >
            Loading…
          </div>
        )}

        {error && !isPending && (
          <div
            data-testid="economy-audit-error"
            style={{ color: '#ef4444', fontSize: '14px', padding: '12px' }}
          >
            {error}
          </div>
        )}

        {!isPending && !error && rows.length === 0 && (
          <div
            data-testid="economy-audit-empty"
            style={{
              color: '#71717a',
              fontSize: '14px',
              textAlign: 'center',
              padding: '32px',
            }}
          >
            {labels.empty}
          </div>
        )}

        {!isPending && !error && rows.length > 0 && (
          <div
            data-testid="economy-audit-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {rows.map((row) => (
              <div
                key={row.id}
                data-testid={`economy-audit-row-${row.id}`}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  <span>
                    <span style={{ color: '#71717a' }}>{labels.from}: </span>
                    <strong style={{ color: '#e4e4e7' }}>
                      {row.fromValue}
                    </strong>
                  </span>
                  <span style={{ color: '#71717a' }}>→</span>
                  <span>
                    <span style={{ color: '#71717a' }}>{labels.to}: </span>
                    <strong style={{ color: '#e4e4e7' }}>{row.toValue}</strong>
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>
                  <span>{row.adminLabel}</span>
                  <span style={{ margin: '0 6px' }}>·</span>
                  <span>{new Date(row.changedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
