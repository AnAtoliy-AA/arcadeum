import React from 'react';
import { styled, YStack, XStack, TamaguiElement } from 'tamagui';

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
  minHeight: 600,
  position: 'relative',
  overflow: 'hidden',
  height: 'calc(100dvh - 64px)',
  width: '100%',

  $sm: {
    padding: '$3',
    gap: '$3',
    height: 'auto',
    minHeight: 'calc(100dvh - 64px)',
    borderRadius: 0,
    overflowY: 'auto',
  },

  $xs: {
    padding: '$2',
    gap: '$2',
  },

  variants: {
    isMyTurn: {
      true: {
        // can add specific turn indicator styles here
      },
    },
  } as const,
});

const MainArea = styled(XStack, {
  name: 'GameMainArea',
  flex: 1,
  gap: '$5',
  minHeight: 0,
  overflow: 'hidden',

  $gtSm: {
    flexDirection: 'row',
  },

  $sm: {
    flexDirection: 'column',
    overflowY: 'auto',
    gap: '$4',
  },
});

const GameBoardArea = styled(YStack, {
  name: 'GameBoardArea',
  flex: 1,
  minWidth: 0,
  position: 'relative',
  overflowY: 'scroll',
  paddingBottom: '$4',

  $sm: {
    flex: 0,
    overflow: 'visible',
    paddingBottom: 0,
  },
});

const ChatArea = styled(YStack, {
  name: 'GameChatArea',
  width: 320,
  minWidth: 320,
  borderLeftWidth: 1,
  borderLeftColor: '$borderColor',
  paddingLeft: '$5',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  marginLeft: '$2',

  $sm: {
    width: '100%',
    minWidth: 0,
    flex: 0,
    minHeight: 350,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '$borderColor',
    paddingLeft: 0,
    paddingTop: '$4',
    marginLeft: 0,
    backgroundColor: 'transparent',
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
      {header}
      <MainArea data-testid="game-main-area">
        <GameBoardArea data-testid="game-board-area">{children}</GameBoardArea>
        {chat && (
          <ChatArea showChat={showChat} data-testid="game-chat-area">
            {chat}
          </ChatArea>
        )}
      </MainArea>
      {popupOverlay}
      {modals}
    </LayoutContainer>
  );
}
