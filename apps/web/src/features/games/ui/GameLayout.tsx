import React from 'react';
import styled from 'styled-components';

interface GameLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  chat?: React.ReactNode;
  modals?: React.ReactNode;
  lobby?: React.ReactNode;
  popupOverlay?: React.ReactNode;
  showChat?: boolean;
  className?: string;
  gameContainerRef?: React.RefObject<HTMLDivElement>;
  variant?: string;
  isMyTurn?: boolean;
}

const LayoutContainer = styled.div<{ $variant?: string; $isMyTurn?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem;
  border-radius: 24px;
  background: ${({ theme }) => theme.background.base};
  min-height: 600px;
  position: relative;
  overflow: hidden;
  height: calc(100dvh - 64px);
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
    height: auto;
    min-height: calc(100dvh - 64px);
    border-radius: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
`;

const MainArea = styled.div<{ $showChat?: boolean }>`
  display: flex;
  flex: 1;
  gap: 1.5rem;
  min-height: 0;
  overflow: hidden;

  flex-direction: row;

  @media (max-width: 900px) {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    gap: 1rem;
  }
`;

const GameBoardArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 1rem;

  @media (max-width: 900px) {
    flex: none;
    overflow: visible;
    padding-bottom: 0;
  }
`;

const ChatArea = styled.div<{ $showChat: boolean }>`
  width: 320px;
  display: ${({ $showChat }) => ($showChat ? 'flex' : 'none')};
  flex-direction: column;
  min-width: 320px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  margin-left: 0.5rem;

  @media (max-width: 900px) {
    width: 100%;
    min-width: 0;
    flex: none;
    min-height: 350px;
    flex-shrink: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 0;
    padding-top: 1rem;
    margin-left: 0;
    background: transparent;
  }
`;

export function GameLayout({
  header,
  children,
  chat,
  modals,
  lobby,
  popupOverlay,
  showChat = false,
  gameContainerRef,
  variant,
  isMyTurn,
  className,
}: GameLayoutProps) {
  if (lobby) {
    return (
      <LayoutContainer
        key={!!lobby ? 'lobby' : 'game'}
        ref={gameContainerRef}
        className={className}
        $variant={variant}
      >
        {lobby}
        {modals}
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer
      key={!!lobby ? 'lobby' : 'game'}
      ref={gameContainerRef}
      className={className}
      $variant={variant}
      $isMyTurn={isMyTurn}
      data-testid="game-layout-container"
    >
      {header}
      <MainArea $showChat={showChat} data-testid="game-main-area">
        <GameBoardArea data-testid="game-board-area">{children}</GameBoardArea>
        {chat && (
          <ChatArea $showChat={showChat} data-testid="game-chat-area">
            {chat}
          </ChatArea>
        )}
      </MainArea>
      {popupOverlay}
      {modals}
    </LayoutContainer>
  );
}
