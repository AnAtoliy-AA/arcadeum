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
        className="text-center py-12 px-4 text-[var(--colorTextSecondary,#71717a)]"
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

  const columns = [
    tableLabels.key,
    tableLabels.current,
    tableLabels.default,
    tableLabels.source,
    tableLabels.lastChanged,
    tableLabels.actions,
  ] as const;

  return (
    <div className="w-full max-w-full rounded-xl border border-[var(--borderColor)] overflow-x-auto">
      <table
        data-testid="economy-table"
        className="w-full min-w-[720px] border-collapse"
      >
        <thead>
          <tr className="bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]">
            {columns.map((col) => (
              <th
                key={col}
                className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--colorTextSecondary,#71717a)]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--borderColor)]">
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
