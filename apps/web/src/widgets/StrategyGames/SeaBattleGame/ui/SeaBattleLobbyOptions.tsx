'use client';

import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type { GameRoomSummary } from '@/shared/types/games';
import { TranslationKey } from '@/shared/i18n/useTranslation';
import { SeaBattleThemePreview } from './SeaBattleThemePreview';
import { SeaBattleThemeProvider } from '../lib/SeaBattleThemeContext';
import { SeaBattleTeamPanel } from './SeaBattleTeamPanel';
import { HouseRulesPanel } from './HouseRulesPanel';
import type { SeaBattleLobbyState } from './useSeaBattleLobbyState';

export function SeaBattleLobbyOptionsPanel({
  room,
  userId,
  isHost,
  state,
  t,
}: {
  room: GameRoomSummary;
  userId?: string;
  isHost: boolean;
  state: SeaBattleLobbyState;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const {
    selectedVariant,
    handleVariantSelect,
    handleOptionChange,
    currentGridSize,
    currentShipCount,
    ruleComingSoon,
    teamMode,
    teams,
    hideShipsFromTeammates,
    maxTotalPlayers,
    effectiveRoom,
    teamStartBlocked,
    roomMembers,
  } = state;
  // Theme picker + preview only — team mode controls now live in the
  // dedicated SeaBattleTeamPanel above the lobby so they don't compete with
  // the Start button for stacking context.
  const variantPicker = (
    <LobbyOptionSection title={t('games.create.sectionVariant')}>
      <GameThemePicker
        selectedTheme={selectedVariant}
        onSelect={handleVariantSelect}
        disabled={!isHost}
      />
    </LobbyOptionSection>
  );

  const showTeamPanel = room.status === 'lobby' && (isHost || teamMode);

  const teamPanelSlot = showTeamPanel ? (
    <SeaBattleTeamPanel
      roomId={room.id}
      userId={userId ?? ''}
      hostId={room.hostId}
      isHost={isHost}
      teamMode={teamMode}
      teams={teams}
      hideShipsFromTeammates={hideShipsFromTeammates}
      members={roomMembers}
      teamStartBlocked={teamStartBlocked}
      maxTotalPlayers={maxTotalPlayers}
    />
  ) : null;

  return (
    <>
      {teamPanelSlot}
      {isHost && room.status === 'lobby' ? (
        <div className="flex flex-col items-stretch gap-4 w-full min-w-0">
          {variantPicker}
          <SeaBattleThemeProvider variant={selectedVariant}>
            <SeaBattleThemePreview selectedVariant={selectedVariant} />
          </SeaBattleThemeProvider>
        </div>
      ) : null}

      {isHost && room.status === 'lobby' && (
        <HouseRulesPanel
          gameOptions={{
            ...(effectiveRoom.gameOptions ?? {}),
            gridSize: currentGridSize,
            shipCount: currentShipCount,
            variant: selectedVariant,
          }}
          ruleComingSoon={ruleComingSoon}
          onOptionChange={handleOptionChange}
        />
      )}
    </>
  );
}
