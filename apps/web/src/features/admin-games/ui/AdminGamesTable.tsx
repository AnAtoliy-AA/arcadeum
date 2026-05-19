import { getTranslations } from '@/shared/i18n/server';
import { adminGamesEn } from '@/shared/i18n/messages/pages/admin-games/en';
import { listAdminGames } from '../server/admin-games.server';
import { GameVisibilityRow } from './GameVisibilityRow';

interface AdminGamesMessages {
  pages?: { adminGames?: Partial<typeof adminGamesEn> };
}

export async function AdminGamesTable() {
  const messages = (await getTranslations()) as AdminGamesMessages;
  const t = messages.pages?.adminGames ?? {};
  const tiers = { ...adminGamesEn.tiers, ...(t.tiers ?? {}) };

  const labels = {
    game: t.game ?? adminGamesEn.game,
    variants: t.variants ?? adminGamesEn.variants,
    tier: t.tier ?? adminGamesEn.tier,
    save: t.save ?? adminGamesEn.save,
    saving: t.saving ?? adminGamesEn.saving,
    saveSuccess: t.saveSuccess ?? adminGamesEn.saveSuccess,
    saveFailed: t.saveFailed ?? adminGamesEn.saveFailed,
    tiers,
  };

  const rows = await listAdminGames();

  if (rows.length === 0) {
    const emptyLabel = t.empty ?? adminGamesEn.empty;
    return (
      <div
        data-testid="admin-games-table-empty"
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: '#71717a',
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      data-testid="admin-games-table"
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          fontSize: 11,
          color: '#a1a1aa',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <span style={{ width: 24 }} aria-hidden />
        <span style={{ flex: 1 }}>{labels.game}</span>
        <span>{labels.tier}</span>
      </div>
      {rows.map((row) => (
        <GameVisibilityRow key={row.gameId} row={row} labels={labels} />
      ))}
    </div>
  );
}
