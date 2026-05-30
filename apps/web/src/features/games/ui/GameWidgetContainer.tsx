import './scrollbar.css';
import React, { useRef } from 'react';
import { styled, XStack, YStack, Text } from 'tamagui';
import {
  GameContainer as BaseGameContainer,
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
  IconButton,
  type GameVariant,
} from '@arcadeum/ui';
import { MaximizeIcon, MinimizeIcon } from '@/shared/ui';
import { useFullscreen } from '../hooks/useFullscreen';
import { useAutoExitFullscreen } from '../hooks/useAutoExitFullscreen';
import { scrollbarStyles } from '@/shared/lib/styles';
import { GameChatPopupOverlay } from '@/widgets/GameChat';
import {
  TurnIndicator,
  resolveTurnStatus,
  type TurnContract,
} from './TurnIndicator';

// --- Styled components (based on CriticalGame's layout.tsx) ---

const Container = styled(BaseGameContainer, {
  name: 'GameWidgetContainer',
  gap: '$5',
  paddingHorizontal: '$7',
  paddingTop: '$7',
  paddingBottom: 0,
  borderRadius: 24,
  minHeight: 0,
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',
  backdropFilter: 'blur(20px)',
  height: 'auto',
  flexDirection: 'column',
  minWidth: 0,
  borderWidth: 1,
  borderColor: '$glassBorder',

  ...scrollbarStyles,

  $sm: {
    paddingHorizontal: '$2',
    paddingTop: '$2',
    paddingBottom: 0,
    borderRadius: 16,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  variants: {
    $isMyTurn: {
      true: {
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        shadowColor: 'rgba(34, 197, 94, 0.4)',
      },
    },
    isFullscreen: {
      true: {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        borderWidth: 0,
      },
    },
  } as const,
});

// --- Shared header styled components ---

const GameHeader = styled(XStack, {
  name: 'GameWidgetHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$7',
  paddingVertical: '$2',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  marginHorizontal: -28,
  marginTop: -28,
  position: 'sticky',
  top: -28,
  zIndex: 30,
  flexShrink: 0,
  overflow: 'hidden',

  $sm: {
    paddingHorizontal: '$4',
    paddingVertical: '$2',
    marginHorizontal: -8,
    marginTop: -8,
    top: -8,
    gap: '$2',
  },
});

const GameInfo = styled(XStack, {
  name: 'GameWidgetHeaderInfo',
  alignItems: 'center',
  gap: '$2',
  minWidth: 0,
  flex: 1,
});

const VariantIconBadge = styled(YStack, {
  name: 'GameWidgetVariantBadge',
  width: 30,
  height: 30,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  flexShrink: 0,

  $sm: {
    width: 24,
    height: 24,
  },
});

const GameTitle = styled(Text, {
  name: 'GameWidgetTitle',
  margin: 0,
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: -0.3,
  numberOfLines: 1,

  $sm: {
    fontSize: 14,
  },
});

const TurnStatusPill = styled(XStack, {
  name: 'GameWidgetTurnPill',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderWidth: 1,
  alignItems: 'center',
  flexShrink: 0,

  variants: {
    $status: {
      yourTurn: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(16,185,129,0.4)',
      },
      waiting: {
        backgroundColor: 'rgba(234,179,8,0.1)',
        borderColor: 'rgba(234,179,8,0.35)',
      },
      completed: {
        backgroundColor: 'rgba(148,163,184,0.1)',
        borderColor: 'rgba(148,163,184,0.25)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

const TurnStatusText = styled(Text, {
  name: 'GameWidgetTurnText',
  fontSize: 14,
  fontWeight: '600',

  variants: {
    $status: {
      yourTurn: { color: '$success' },
      waiting: { color: '$warning' },
      completed: { color: '$secondary' },
      default: { color: '$color', opacity: 0.7 },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

const HeaderActions = styled(XStack, {
  name: 'GameWidgetHeaderActions',
  gap: '$2',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
});

const FullscreenButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    size="sm"
    padding="$2"
    pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    {...props}
  />
);

export const SharedGameBoard = styled(BaseGameBoard, {
  name: 'SharedGameBoard',
  gap: '$4',
  zIndex: 20,
  flexDirection: 'column',
  position: 'relative',
  width: '100%',
  // Fill the remaining height of the widget container after the sticky
  // header so the boards inside can use 1fr-row CSS to fit vertically
  // without scroll. Inner content opts in via flex propagation.
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflow: 'visible',
});

export const SharedTableArea = styled(BaseTableArea, {
  name: 'SharedTableArea',
  gap: '$4',
  flexDirection: 'column',
  minHeight: 0,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  height: 'auto',
});

export const SharedHandSection = styled(YStack, {
  name: 'SharedHandSection',
  gap: '$4',
  width: '100%',
  flexShrink: 0,
  zIndex: 30,
  position: 'relative',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingTop: '$4',
});

// --- Main component ---

export type TurnStatusVariant =
  | 'completed'
  | 'yourTurn'
  | 'waiting'
  | 'default';

interface SharedHeaderProps {
  /** Emoji icon for the game variant badge */
  variantEmoji: string;
  /** Game title text (e.g. "Critical · Deep Sea Pressure") */
  title: string;
  /** Optional subtitle (e.g. room name) */
  subtitle?: string;
  /**
   * Preferred: declarative turn contract. The header renders the shared
   * {@link TurnIndicator} (avatar + name + "Your turn / {name}'s turn") and
   * derives the pill status from these fields. A new game gets the full turn
   * display by passing only an id + isMyTurn.
   */
  turn?: TurnContract;
  /**
   * Legacy / non-turn escape hatch (e.g. real-time games like Glimworm that
   * have no turns). Ignored when `turn` is provided.
   */
  turnStatusVariant?: TurnStatusVariant;
  /** Legacy / non-turn status text. Ignored when `turn` is provided. */
  turnStatusText?: string;
  /** Legacy free-form avatar node. Ignored when `turn` is provided. */
  turnAvatar?: React.ReactNode;
  /** Optional extra actions rendered before fullscreen button */
  extraActions?: React.ReactNode;
  /** Optional gradient for the title text */
  titleGradient?: string;
}

interface GameWidgetContainerProps {
  /** Pass SharedHeaderProps to use the built-in shared header */
  headerProps?: SharedHeaderProps;
  /** Pass raw header ReactNode to use a fully custom header (e.g. CriticalGameHeader) */
  header?: React.ReactNode;
  board: React.ReactNode;
  tableArea?: React.ReactNode;
  handSection?: React.ReactNode;
  modals?: React.ReactNode;
  variant?: string;
  isMyTurn?: boolean;
  /** When true, the widget auto-exits its fullscreen shortly after finish. */
  isGameOver?: boolean;
  /**
   * Renders the shared in-game chat message popup overlay (default true).
   * Set false for games that show incoming chat their own way (e.g. Critical
   * renders per-opponent chat bubbles) to avoid showing each message twice.
   */
  showChatPopup?: boolean;
}

const gameWidgetGlobalStyles = `
  .game-widget-container.is-fullscreen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    border-width: 0 !important;
    background: #151718 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 1100;
  }
`;

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
  // Widget-only fullscreen — independent of the page-level toggle in
  // `GamePageLayout`. Page level expands [control panel + widget + chat];
  // this expands only the widget. Keyboard disabled so the global `f`
  // shortcut owned by the page-level instance doesn't toggle both at once.
  const { isFullscreen, toggleFullscreen, exitFullscreen } =
    useFullscreen(containerRef);

  // Leave this widget's fullscreen shortly after the game finishes. Mapped to
  // the status the auto-exit hook expects so it fires once on the transition.
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

          <YStack gap={0} minWidth={0} flex={1}>
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
              <Text
                fontSize={11}
                opacity={0.45}
                numberOfLines={1}
                $sm={{ display: 'none' }}
              >
                {headerProps.subtitle}
              </Text>
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
      <style>{gameWidgetGlobalStyles}</style>
      <Container
        ref={containerRef as React.RefObject<never>}
        className="game-widget-container"
        $isMyTurn={!!isMyTurn}
        $variant={variant as GameVariant}
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
        {showChatPopup && <GameChatPopupOverlay />}
      </Container>
    </>
  );
});
