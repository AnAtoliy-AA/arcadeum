'use client';

import React, { useState } from 'react';
import {
  ReusableGameLobby,
  IconButton,
} from '@/features/games/ui/ReusableGameLobby';
import {
  buildBotLabels,
  buildTableLabels,
  buildTableRoomInfoLabels,
} from '@/features/games/ui/lobbyConfig';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import { RulesModal } from './RulesModal';
import { TranslationKey } from '@/shared/i18n/useTranslation';
import {
  CriticalLobbyOptionsPanel,
  getCriticalSubtitle,
  resolveCardVariant,
  type CriticalLobbyProps,
  getCriticalTheme,
  getVariantInfo,
} from './CriticalLobbyOptions';

export function CriticalLobby({
  containerRef,
  showRulesOpen,
  onShowRulesClose,
  t,
  ...host
}: CriticalLobbyProps) {
  const { room, userId, isHost } = host;
  const [showRules, setShowRules] = useState(false);
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );

  const cardVariant = resolveCardVariant(room.gameOptions, equippedTheme);
  const variantInfo = getVariantInfo(cardVariant);
  const isFastMode = room.gameOptions?.idleTimerEnabled;
  // The i18n helpers take plain string keys; the wrapper's `t` is typed to
  // TranslationKey, which the table/bot key builders cannot statically prove.
  const tl = (key: string) => t(key as TranslationKey);

  return (
    <>
      <RulesModal
        isOpen={showRules || !!showRulesOpen}
        onClose={() => {
          setShowRules(false);
          onShowRulesClose?.();
        }}
        currentVariant={cardVariant}
        isFastMode={isFastMode}
        isPrivate={room.visibility === 'private'}
        t={t}
      />
      <ReusableGameLobby
        {...host}
        // ReusableGameLobby.types accepts HTMLElement refs; HTMLElement
        // is not assignable to it, so narrow the ref type for the handoff.
        containerRef={containerRef as React.RefObject<never>}
        config={{
          gameName: t('games.critical_v1.name'),
          gameIcon: '🐱💣',
          variantName: t(variantInfo.name as TranslationKey),
          roomIcon: variantInfo.emoji,
          seats: { min: 2 },
          bots: { enabled: true },
          theme: getCriticalTheme(cardVariant),
          labels: {
            ...buildTableLabels(tl),
            ...buildTableRoomInfoLabels(tl),
            ...buildBotLabels(tl),
            subtitleText: getCriticalSubtitle(room, isHost, t),
          },
        }}
        isFastMode={isFastMode}
        optionsSlot={
          <CriticalLobbyOptionsPanel
            room={room}
            userId={userId}
            isHost={isHost}
            cardVariant={cardVariant}
            ruleComingSoon={ruleComingSoon}
            t={t}
          />
        }
        headerActionsSlot={
          <IconButton onClick={() => setShowRules(true)} title="Game Rules">
            📖
          </IconButton>
        }
        onRuleComingSoonChange={setRuleComingSoon}
      />
    </>
  );
}
