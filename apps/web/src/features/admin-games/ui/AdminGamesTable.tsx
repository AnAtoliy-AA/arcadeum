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
        className="text-center py-12 px-4 text-[var(--colorTextSecondary,#71717a)]"
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      data-testid="admin-games-table"
      className="w-full rounded-xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] overflow-hidden"
    >
      <div className="flex flex-row gap-4 py-2.5 px-4 border-b border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[11px] text-[var(--colorTextSecondary,#a1a1aa)] tracking-wider uppercase font-semibold">
        <span className="w-6" aria-hidden />
        <span className="flex-1">{labels.game}</span>
        <span>{labels.tier}</span>
      </div>
      {rows.map((row) => (
        <GameVisibilityRow key={row.gameId} row={row} labels={labels} />
      ))}
    </div>
  );
}
