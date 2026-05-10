import { listEconomySettings } from '../server/economy.server';
import { EconomyRow } from './EconomyRow';

// ─── Hardcoded English labels (server component — no i18n wiring needed) ──────
// NOTE: When the admin economy i18n namespace is wired (Task 17), replace these
// with getTranslations() and pass the translated strings down.

const TABLE_LABELS = {
  key: 'Key',
  current: 'Current value',
  default: 'Default',
  source: 'Source',
  lastChanged: 'Last changed',
  actions: 'Actions',
};

const ROW_LABELS = {
  edit: 'Edit',
  reset: 'Reset to default',
  history: 'History',
  sources: {
    override: 'Admin override',
    env: 'Environment',
    default: 'Code default',
  },
  editDialog: {
    title: 'Edit {{key}}',
    currentLabel: 'Current',
    newValueLabel: 'New value',
    save: 'Save',
    cancel: 'Cancel',
  },
  buttons: {
    reset: 'Reset to default',
  },
  errors: {
    invalidValue: 'Value must be a positive integer up to 1,000,000.',
    generic: 'Could not save. Please retry.',
    forbidden: 'You do not have permission.',
    keyNotFound: 'Unknown setting.',
  },
  toasts: {
    saved: 'Saved {{key}} = {{value}}.',
    reset: 'Reset {{key}} to default.',
  },
  auditDrawer: {
    title: 'History for {{key}}',
    empty: 'No changes yet.',
    from: 'From',
    to: 'To',
  },
};

export async function AdminEconomyTable() {
  const settings = await listEconomySettings();

  if (settings.length === 0) {
    return (
      <div
        data-testid="economy-table-empty"
        style={{ textAlign: 'center', padding: '48px 16px', color: '#71717a' }}
      >
        No economy settings found.
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <table
        data-testid="economy-table"
        style={{ width: '100%', borderCollapse: 'collapse' }}
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
                TABLE_LABELS.key,
                TABLE_LABELS.current,
                TABLE_LABELS.default,
                TABLE_LABELS.source,
                TABLE_LABELS.lastChanged,
                TABLE_LABELS.actions,
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
          {settings.map((setting) => (
            <EconomyRow
              key={setting.key}
              setting={setting}
              labels={ROW_LABELS}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
