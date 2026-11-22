'use client';

import { useState } from 'react';
import { RacerBioModal } from './RacerBioModal';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const CAT_DASH_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #fff 0%, #c084fc 40%, #67e8f9 80%, #fff 100%)',
  buttonGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
};

export interface CatDashLobbyOptions {
  theme?: string;
  trackType?: string;
  columns?: number;
  trackLength?: number;
}

export function CatDashLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: CatDashLobbyOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const [showRacerBio, setShowRacerBio] = useState(false);
  const columnsVal = options.columns || 10;
  const trackLengthVal = options.trackLength || 60;
  const handleThemeChange = (themeId: string) => {
    if (!isHost) return;
    setOption({ theme: themeId });
  };
  const handleColumnsChange = (cols: string) => {
    if (!isHost) return;
    setOption({ columns: Number(cols) });
  };
  const handleTrackLengthChange = (len: string) => {
    if (!isHost) return;
    setOption({ trackLength: Number(len) });
  };
  return (
    <>
      <div className="flex flex-col items-stretch gap-3 p-2">
        <LobbyOptionSection title={t('games.create.sectionVariant')}>
          <GameThemePicker
            selectedTheme={options.theme ?? equippedTheme}
            onSelect={handleThemeChange}
            disabled={!isHost}
          />
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.cat_dash_v1.lobby.columns')}>
          <LobbyChipGroup
            options={[8, 10, 12].map((cols) => ({
              id: String(cols),
              label: `${cols} ${t('games.cat_dash_v1.lobby.columnsUnit')}`,
            }))}
            value={String(columnsVal)}
            onChange={handleColumnsChange}
            disabled={!isHost}
            accentColor="#7c3aed"
            testIdPrefix="catdash-columns"
          />
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.cat_dash_v1.lobby.trackLength')}>
          <LobbyChipGroup
            options={[40, 60, 80, 100].map((len) => ({
              id: String(len),
              label: `${len} ${t('games.cat_dash_v1.lobby.spacesUnit')}`,
            }))}
            value={String(trackLengthVal)}
            onChange={handleTrackLengthChange}
            disabled={!isHost}
            accentColor="#7c3aed"
            testIdPrefix="catdash-track"
          />
        </LobbyOptionSection>

        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowRacerBio(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            data-testid="lobby-racers-btn"
          >
            <span>🏎️</span>
            <span>
              {t('games.cat_dash_v1.lobby.meetRacers' as TranslationKey)}
            </span>
          </button>
        </div>
      </div>
      {showRacerBio && (
        <RacerBioModal
          open={showRacerBio}
          onClose={() => setShowRacerBio(false)}
        />
      )}
    </>
  );
}
