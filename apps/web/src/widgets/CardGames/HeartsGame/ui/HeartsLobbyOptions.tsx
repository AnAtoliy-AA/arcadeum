'use client';

import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySwitchRow,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { resolveHeartsTheme } from '../lib/theme';

export const HEARTS_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #fff1f2 0%, #fda4af 50%, #fff1f2 100%)',
  buttonGradient: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
};

export function resolveHeartsLobbyOptions(raw: unknown): {
  variant: ReturnType<typeof resolveHeartsTheme>;
  passingEnabled: boolean;
  targetScore: 50 | 100;
} {
  const r = (raw ?? {}) as Partial<{
    passingEnabled: boolean;
    targetScore: number;
  }>;
  return {
    variant: resolveHeartsTheme(raw),
    passingEnabled:
      typeof r.passingEnabled === 'boolean' ? r.passingEnabled : true,
    targetScore: r.targetScore === 50 ? 50 : 100,
  };
}

export type HeartsLobbyOptions = ReturnType<typeof resolveHeartsLobbyOptions>;

export function HeartsLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: HeartsLobbyOptions;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup
        title={t('games.hearts_v1.lobby.targetScore')}
        hint={t('games.hearts_v1.lobby.targetScoreHint')}
      >
        <LobbyChoice
          aria-label={t('games.hearts_v1.lobby.targetScore')}
          items={[
            { id: '50', label: '50' },
            { id: '100', label: '100' },
          ]}
          value={String(options.targetScore)}
          disabled={!isHost}
          onChange={(v) => setOption({ targetScore: v === '50' ? 50 : 100 })}
          testIdPrefix="hearts-target-score"
        />
      </LobbyOptionGroup>
      <LobbySwitchRow
        testId="hearts-passing-switch"
        label={t('games.hearts_v1.lobby.passingEnabled')}
        hint={t('games.hearts_v1.lobby.passingEnabledHint')}
        checked={options.passingEnabled}
        disabled={!isHost}
        onCheckedChange={(val) => setOption({ passingEnabled: val })}
      />
      <LobbyOptionGroup title={t('games.hearts_v1.lobby.variant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionGroup>
    </LobbyOptionStack>
  );
}
