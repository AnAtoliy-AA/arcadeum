import React, { useRef } from 'react';
import { Text, YStack } from 'tamagui';
import { MaximizeIcon, MinimizeIcon } from '@arcadeum/ui';
import { useFullscreen } from '../hooks/useFullscreen';
import { useAutoExitFullscreen } from '../hooks/useAutoExitFullscreen';
import { GameChatPopupOverlay } from '@/widgets/GameChat';
import { SubtitleText } from './SubtitleText';
import { TurnIndicator, resolveTurnStatus } from './TurnIndicator';
import { EmoteBubble } from './EmoteBubble';
import type { EmoteId } from '@/widgets/GameChat/ui/EmotePicker';
import {
  WidgetFullscreenContext,
  useActiveEmotes,
  Container,
  GameHeader,
  GameInfo,
  VariantIconBadge,
  GameTitle,
  TurnStatusPill,
  TurnStatusText,
  HeaderActions,
  FullscreenButton,
  SharedGameBoard,
  SharedTableArea,
  SharedHandSection,
  type SharedHeaderProps,
  type TurnStatusVariant,
} from './GameWidgetContainer.styles';

export {
  useWidgetFullscreen,
  useActiveEmotes,
  ActiveEmotesProvider,
} from './GameWidgetContainer.styles';
export {
  SharedGameBoard,
  SharedTableArea,
  SharedHandSection,
} from './GameWidgetContainer.styles';
export type {
  SharedHeaderProps,
  TurnStatusVariant,
} from './GameWidgetContainer.styles';

interface GameWidgetContainerProps {
  headerProps?: SharedHeaderProps;
  header?: React.ReactNode;
  board: React.ReactNode;
  tableArea?: React.ReactNode;
  handSection?: React.ReactNode;
  modals?: React.ReactNode;
  variant?: string;
  isMyTurn?: boolean;
  isGameOver?: boolean;
  showChatPopup?: boolean;
}

export const GameWidgetContainer = React.memo(function GameWidgetContainer({
  headerProps,
  header,
  board,
  tableArea,
  handSection,
  modals,
  variant,
  isMyTurn,
  isGameOver,
  showChatPopup = true,
}: GameWidgetContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeEmotes = useActiveEmotes();
  const { isFullscreen, toggleFullscreen, exitFullscreen } =
    useFullscreen(containerRef);

  useAutoExitFullscreen({
    status: isGameOver ? 'completed' : 'active',
    isFullscreen,
    exitFullscreen,
  });

  const pillStatus: TurnStatusVariant = headerProps
    ? headerProps.turn
      ? resolveTurnStatus(headerProps.turn)
      : (headerProps.turnStatusVariant ?? 'default')
    : 'default';

  const renderedHeader =
    header ??
    (headerProps ? (
      <GameHeader>
        <GameInfo>
          <VariantIconBadge>
            <Text fontSize={15}>{headerProps.variantEmoji}</Text>
          </VariantIconBadge>

          <YStack gap={0} minWidth={0} flex={1} position="relative">
            <GameTitle numberOfLines={1}>
              {headerProps.titleGradient ? (
                <span
                  className="text-gradient"
                  style={{
                    background: headerProps.titleGradient,
                  }}
                >
                  {headerProps.title}
                </span>
              ) : (
                headerProps.title
              )}
            </GameTitle>

            {headerProps.subtitle && (
              <SubtitleText text={headerProps.subtitle} />
            )}
          </YStack>
        </GameInfo>

        {headerProps.turn ? (
          <TurnStatusPill
            $status={pillStatus}
            gap="$2"
            paddingLeft="$1"
            data-testid="turn-status-pill"
          >
            <TurnIndicator turn={headerProps.turn} />
          </TurnStatusPill>
        ) : (
          <TurnStatusPill
            $status={pillStatus}
            gap={headerProps.turnAvatar ? '$2' : undefined}
            paddingLeft={headerProps.turnAvatar ? '$1' : undefined}
            data-testid="turn-status-pill"
          >
            {headerProps.turnAvatar}
            <TurnStatusText $status={pillStatus}>
              {headerProps.turnStatusText}
            </TurnStatusText>
          </TurnStatusPill>
        )}

        <HeaderActions>
          {headerProps.extraActions}

          <FullscreenButton
            onClick={toggleFullscreen}
            data-testid="widget-fullscreen-button"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </FullscreenButton>
        </HeaderActions>
      </GameHeader>
    ) : null);

  return (
    <>
      <WidgetFullscreenContext.Provider value={isFullscreen}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Container
            ref={containerRef as React.RefObject<never>}
            className="game-widget-container"
            $isMyTurn={!!isMyTurn}
            isFullscreen={isFullscreen}
            $variant={variant as Parameters<typeof Container>[0]['$variant']}
            data-testid="game-widget-container"
          >
            {renderedHeader}
            <SharedGameBoard data-testid="game-board-section">
              {board}
            </SharedGameBoard>
            {tableArea && (
              <SharedTableArea data-testid="game-table-section">
                {tableArea}
              </SharedTableArea>
            )}
            {handSection && (
              <SharedHandSection data-testid="game-hand-section">
                {handSection}
              </SharedHandSection>
            )}
            {modals}
          </Container>
          {showChatPopup && <GameChatPopupOverlay />}
          {activeEmotes.emotes.map((emote) => (
            <EmoteBubble
              key={emote.key}
              playerId={emote.userId}
              activeEmotes={[
                { id: emote.userId, emoteId: emote.emoteId as EmoteId },
              ]}
              senderName={activeEmotes.resolveDisplayName?.(emote.userId)}
            />
          ))}
        </div>
      </WidgetFullscreenContext.Provider>
    </>
  );
});
