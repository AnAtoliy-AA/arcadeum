import { getTranslations } from '@/shared/i18n/server';
import { adminEconomyEn } from '@/shared/i18n/messages/pages/admin-economy/en';
import type { EconomyKey } from '../server/economy.types';
import { listEconomySettings } from '../server/economy.server';
import { EconomyRow } from './EconomyRow';

interface AdminEconomyMessages {
  pages?: { adminEconomy?: Partial<typeof adminEconomyEn> };
}

export async function AdminEconomyTable() {
  const messages = (await getTranslations()) as AdminEconomyMessages;
  const t = messages.pages?.adminEconomy ?? {};

  const tableLabels = { ...adminEconomyEn.table, ...(t.table ?? {}) };
  const sources = { ...adminEconomyEn.sources, ...(t.sources ?? {}) };
  const buttons = { ...adminEconomyEn.buttons, ...(t.buttons ?? {}) };
  const editDialog = { ...adminEconomyEn.editDialog, ...(t.editDialog ?? {}) };
  const auditDrawer = {
    ...adminEconomyEn.auditDrawer,
    ...(t.auditDrawer ?? {}),
  };
  const errors = { ...adminEconomyEn.errors, ...(t.errors ?? {}) };
  const toasts = { ...adminEconomyEn.toasts, ...(t.toasts ?? {}) };
  const keys = { ...adminEconomyEn.keys, ...(t.keys ?? {}) };

  const settings = await listEconomySettings();

  if (settings.length === 0) {
    const emptyLabel = t.empty ?? adminEconomyEn.empty;
    return (
      <div
        data-testid="economy-table-empty"
        style={{ textAlign: 'center', padding: '48px 16px', color: '#71717a' }}
      >
        {emptyLabel}
      </div>
    );
  }

  const rowLabels = {
    edit: buttons.edit,
    reset: buttons.reset,
    history: buttons.history,
    sources,
    editDialog,
    buttons: { reset: buttons.reset },
    errors,
    toasts,
    auditDrawer,
  };

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <table
        data-testid="economy-table"
        style={{
          width: '100%',
          minWidth: '720px',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {(
              [
                tableLabels.key,
                tableLabels.current,
                tableLabels.default,
                tableLabels.source,
                tableLabels.lastChanged,
                tableLabels.actions,
              ] as const
            ).map((col) => (
              <th
                key={col}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#71717a',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {settings.map((setting) => {
            const meta = keys[setting.key as EconomyKey];
            return (
              <EconomyRow
                key={setting.key}
                setting={setting}
                labels={rowLabels}
                name={meta?.name ?? setting.key}
                description={meta?.description}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
