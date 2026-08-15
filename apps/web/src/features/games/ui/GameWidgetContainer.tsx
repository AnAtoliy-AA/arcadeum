import React, { useRef } from 'react';
import { MaximizeIcon, MinimizeIcon } from '@arcadeum/ui';
import { useFullscreen } from '../hooks/useFullscreen';
import { useAutoExitFullscreen } from '../hooks/useAutoExitFullscreen';
import { GameChatPopupOverlay } from '@/widgets/GameChat';
import { SubtitleText } from './SubtitleText';
import { TurnIndicator, resolveTurnStatus } from './TurnIndicator';
import { EmoteBubble } from './EmoteBubble';
import type { EmoteId } from '@/widgets/GameChat/ui/EmotePicker';
import { useTranslation } from '@/shared/lib/useTranslation';
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
  loading?: boolean;
  containerBackground?: string;
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
  loading = false,
  containerBackground,
}: GameWidgetContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeEmotes = useActiveEmotes();
  const { isFullscreen, toggleFullscreen, exitFullscreen } =
    useFullscreen(containerRef);
  const { t } = useTranslation();

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
            <span className="text-[15px]">{headerProps.variantEmoji}</span>
          </VariantIconBadge>

          <div className="flex flex-col items-stretch gap-0 min-w-0 flex-1 relative">
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
          </div>
        </GameInfo>

        {headerProps.turn ? (
          <TurnStatusPill
            status={pillStatus}
            className="gap-2 pl-1"
            data-testid="turn-status-pill"
          >
            <TurnIndicator turn={headerProps.turn} />
          </TurnStatusPill>
        ) : (
          <TurnStatusPill
            status={pillStatus}
            className={headerProps.turnAvatar ? 'gap-2 pl-1' : undefined}
            data-testid="turn-status-pill"
          >
            {headerProps.turnAvatar}
            <TurnStatusText status={pillStatus}>
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
            className="game-widget-container"
            style={
              containerBackground
                ? { background: containerBackground }
                : undefined
            }
            ref={containerRef as React.RefObject<never>}
            isMyTurn={!!isMyTurn}
            isFullscreen={isFullscreen}
            variant={variant as Parameters<typeof Container>[0]['variant']}
            data-testid="game-widget-container"
          >
            {renderedHeader}
            <SharedGameBoard data-testid="game-board-section">
              {loading ? (
                <div className="flex flex-col flex-1 items-center justify-center gap-3 min-h-[300px]">
                  <span className="text-[20px] font-medium opacity-[0.8]">
                    {t('games.roomPage.loadingGame')}
                  </span>
                </div>
              ) : (
                board
              )}
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
