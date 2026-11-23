'use client';

import { useState } from 'react';
import { RacerBioModal } from './RacerBioModal';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
} from '@/features/games/ui/LobbyOptionKit';
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
  const columnItems = [8, 10, 12].map((cols) => ({
    id: String(cols),
    label: `${cols} ${t('games.cat_dash_v1.lobby.columnsUnit')}`,
  }));
  const lengthItems = [40, 60, 80, 100].map((len) => ({
    id: String(len),
    label: `${len} ${t('games.cat_dash_v1.lobby.spacesUnit')}`,
  }));
  return (
    <>
      <LobbyOptionStack>
        <LobbyHostOnlyNote show={!isHost} />
        <LobbyOptionGroup
          title={t('games.cat_dash_v1.lobby.columns')}
          hint={t('games.cat_dash_v1.lobby.columnsHint')}
        >
          <LobbyChoice
            aria-label={t('games.cat_dash_v1.lobby.columns')}
            items={columnItems}
            value={String(columnsVal)}
            onChange={handleColumnsChange}
            disabled={!isHost}
            testIdPrefix="catdash-columns"
          />
        </LobbyOptionGroup>

        <LobbyOptionGroup
          title={t('games.cat_dash_v1.lobby.trackLength')}
          hint={t('games.cat_dash_v1.lobby.trackLengthHint')}
        >
          <LobbyChoice
            aria-label={t('games.cat_dash_v1.lobby.trackLength')}
            items={lengthItems}
            value={String(trackLengthVal)}
            onChange={handleTrackLengthChange}
            disabled={!isHost}
            testIdPrefix="catdash-track"
          />
        </LobbyOptionGroup>

        <LobbyOptionGroup title={t('games.create.sectionVariant')}>
          <GameThemePicker
            selectedTheme={options.theme ?? equippedTheme}
            onSelect={handleThemeChange}
            disabled={!isHost}
          />
        </LobbyOptionGroup>

        <button
          type="button"
          onClick={() => setShowRacerBio(true)}
          className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-4 text-sm font-semibold text-[var(--textPrimary)] transition-colors hover:bg-[var(--glassBgHover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
          data-testid="lobby-racers-btn"
        >
          <span aria-hidden>🏎️</span>
          <span>
            {t('games.cat_dash_v1.lobby.meetRacers' as TranslationKey)}
          </span>
        </button>
      </LobbyOptionStack>
      {showRacerBio && (
        <RacerBioModal
          open={showRacerBio}
          onClose={() => setShowRacerBio(false)}
        />
      )}
    </>
  );
}
