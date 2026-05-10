'use client';

import { useState } from 'react';
import type { EconomyKey, EconomySettingView } from '../server/economy.types';
import { EconomyEditDialog } from './EconomyEditDialog';
import { EconomyAuditDrawer } from './EconomyAuditDrawer';

// Source badge colours
const SOURCE_STYLE: Record<
  EconomySettingView['source'],
  { background: string; color: string }
> = {
  override: { background: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  env: { background: 'rgba(234,179,8,0.12)', color: '#fbbf24' },
  default: { background: 'rgba(113,113,122,0.12)', color: '#71717a' },
};

interface EconomyRowLabels {
  edit: string;
  reset: string;
  history: string;
  sources: { override: string; env: string; default: string };
  editDialog: {
    title: string;
    currentLabel: string;
    newValueLabel: string;
    save: string;
    cancel: string;
  };
  buttons: { reset: string };
  errors: {
    invalidValue: string;
    generic: string;
    forbidden: string;
    keyNotFound: string;
  };
  toasts: { saved: string; reset: string };
  auditDrawer: { title: string; empty: string; from: string; to: string };
}

interface EconomyRowProps {
  setting: EconomySettingView;
  labels: EconomyRowLabels;
}

export function EconomyRow({ setting, labels }: EconomyRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const sourceStyle = SOURCE_STYLE[setting.source];
  const sourceLabel = labels.sources[setting.source];

  const dialogLabels = {
    title: labels.editDialog.title,
    currentLabel: labels.editDialog.currentLabel,
    newValueLabel: labels.editDialog.newValueLabel,
    save: labels.editDialog.save,
    cancel: labels.editDialog.cancel,
    reset: labels.buttons.reset,
    errorInvalidValue: labels.errors.invalidValue,
    errorGeneric: labels.errors.generic,
    errorForbidden: labels.errors.forbidden,
    errorNotFound: labels.errors.keyNotFound,
    toastSaved: labels.toasts.saved,
    toastReset: labels.toasts.reset,
  };

  const drawerLabels = {
    title: labels.auditDrawer.title,
    empty: labels.auditDrawer.empty,
    from: labels.auditDrawer.from,
    to: labels.auditDrawer.to,
  };

  return (
    <>
      <tr
        data-testid={`economy-row-${setting.key}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <td
          style={{
            padding: '12px 16px',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#a1a1aa',
          }}
        >
          {setting.key}
        </td>
        <td
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#e4e4e7',
          }}
        >
          {setting.currentValue}
        </td>
        <td
          style={{ padding: '12px 16px', fontSize: '14px', color: '#71717a' }}
        >
          {setting.defaultValue}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <span
            data-testid={`economy-source-${setting.key}`}
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              ...sourceStyle,
            }}
          >
            {sourceLabel}
          </span>
        </td>
        <td
          style={{ padding: '12px 16px', fontSize: '12px', color: '#71717a' }}
        >
          {setting.updatedAt
            ? new Date(setting.updatedAt).toLocaleString()
            : setting.updatedByLabel
              ? setting.updatedByLabel
              : '—'}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              data-testid={`economy-edit-${setting.key}`}
              onClick={() => setEditOpen(true)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {labels.edit}
            </button>
            <button
              type="button"
              data-testid={`economy-history-${setting.key}`}
              onClick={() => setHistoryOpen(true)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: '#71717a',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {labels.history}
            </button>
          </div>
        </td>
      </tr>

      <EconomyEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        economyKey={setting.key as EconomyKey}
        currentValue={setting.currentValue}
        defaultValue={setting.defaultValue}
        labels={dialogLabels}
        onSuccess={() => setEditOpen(false)}
      />

      <EconomyAuditDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        economyKey={setting.key as EconomyKey}
        labels={drawerLabels}
      />
    </>
  );
}
