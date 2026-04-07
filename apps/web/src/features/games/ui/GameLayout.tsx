import React from 'react';
import { styled, YStack, TamaguiElement } from 'tamagui';

interface GameLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  chat?: React.ReactNode;
  modals?: React.ReactNode;
  lobby?: React.ReactNode;
  popupOverlay?: React.ReactNode;
  showChat?: boolean;
  className?: string;
  gameContainerRef?: React.RefObject<TamaguiElement | null>;
  isMyTurn?: boolean;
  variant?: string;
}

const LayoutContainer = styled(YStack, {
  name: 'GameLayoutContainer',
  gap: '$5',
  padding: '$sm',
  borderRadius: 24,
  backgroundColor: '$background',
  flex: 1,
  height: '100%',
  width: '100%',
  position: 'relative',
  overflow: 'visible',
  pointerEvents: 'auto',

  $md: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 'calc(100dvh - 180px)',
    height: 'auto',
  },
  $tablet: {
    padding: '$3',
    gap: '$3',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
    height: 'auto',
    borderRadius: 0,
    overflowY: 'visible',
  },
  $sm: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
    height: 'auto',
  },

  variants: {
    isMyTurn: {
      true: {
        // can add specific turn indicator styles here
      },
    },
  } as const,
});

const MainArea = styled(YStack, {
  name: 'GameMainArea',
  flex: 1,
  gap: '$5',
  overflow: 'visible',
  flexDirection: 'column',
  pointerEvents: 'auto',

  $gtMd: {
    flexDirection: 'row',
    flex: 1,
  },

  $tablet: {
    flexDirection: 'column',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    gap: '$4',
  },
  $sm: {
    flexDirection: 'column',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    gap: '$4',
  },
});

const GameBoardArea = styled(YStack, {
  name: 'GameBoardArea',
  flex: 1,
  minWidth: 0,
  position: 'relative',
  overflow: 'visible',
  paddingBottom: '$4',
  pointerEvents: 'auto',
  display: 'flex',

  $tablet: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
    overflow: 'visible',
    paddingBottom: '$4',
  },
  $sm: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
    overflow: 'visible',
    paddingBottom: 0,
  },
});

const ChatArea = styled(YStack, {
  name: 'GameChatArea',
  width: 320,
  minWidth: 320,
  borderLeftWidth: 1,
  borderLeftColor: '$glassBorder',
  paddingLeft: '$5',
  backgroundColor: '$glassBg',
  borderRadius: 16,
  marginLeft: '$2',
  overflow: 'hidden',

  $md: {
    width: '100%',
    minWidth: 0,
    flex: 0,
    minHeight: 250,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '$glassBorder',
    paddingLeft: 0,
    paddingTop: '$4',
    marginLeft: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  $tablet: {
    width: '100%',
    minWidth: 0,
    flex: 0,
    minHeight: 250,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '$glassBorder',
    paddingLeft: 0,
    paddingTop: '$4',
    marginLeft: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  $sm: {
    width: '100%',
    minWidth: 0,
    flex: 0,
    minHeight: 350,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '$glassBorder',
    paddingLeft: 0,
    paddingTop: '$4',
    marginLeft: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },

  variants: {
    showChat: {
      false: {
        display: 'none',
      },
    },
  } as const,
});

export function GameLayout({
  header,
  children,
  chat,
  modals,
  lobby,
  popupOverlay,
  showChat = false,
  gameContainerRef,
  isMyTurn,
  className,
}: GameLayoutProps) {
  const commonProps = {
    ref: gameContainerRef,
    className,
    isMyTurn,
    'data-testid': 'game-layout-container',
  };

  if (lobby) {
    return (
      <LayoutContainer key={!!lobby ? 'lobby' : 'game'} {...commonProps}>
        {lobby}
        {modals}
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer key={!!lobby ? 'lobby' : 'game'} {...commonProps}>
      <YStack flexShrink={0} overflow="hidden">
        {header}
      </YStack>
      <MainArea data-testid="game-main-area">
        <GameBoardArea data-testid="game-board-area">{children}</GameBoardArea>
        {chat && (
          <ChatArea showChat={showChat} data-testid="game-chat-area">
            {chat}
          </ChatArea>
        )}
      </MainArea>
      {popupOverlay && (
        <YStack position="absolute" bottom="$4" left="$4" zIndex={50}>
          {popupOverlay}
        </YStack>
      )}
      {modals}
    </LayoutContainer>
  );
}
