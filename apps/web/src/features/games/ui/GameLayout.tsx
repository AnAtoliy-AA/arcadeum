import React from 'react';
import styled from 'styled-components';

interface GameLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode; // Game Board
  chat?: React.ReactNode;
  modals?: React.ReactNode;
  lobby?: React.ReactNode;
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
  height: 100vh;
  width: 100%;
  box-sizing: border-box;

  /* Basic responsive styles */
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 0;
  }
`;

const MainArea = styled.div<{ $showChat?: boolean }>`
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 0; /* Important for scrollable children */
  overflow: hidden;

  /* If chat is shown, we might split the view or overlay on mobile */
  flex-direction: row;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const GameBoardArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ChatArea = styled.div<{ $showChat: boolean }>`
  width: 320px;
  display: ${({ $showChat }) => ($showChat ? 'flex' : 'none')};
  flex-direction: column;
  min-width: 320px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 1rem;

  @media (max-width: 1024px) {
    width: 100%;
    min-width: 0;
    height: 300px; /* Fixed height on mobile if stacked */
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 0;
    padding-top: 1rem;
  }
`;

export function GameLayout({
  header,
  children,
  chat,
  modals,
  lobby,
  showChat = false,
  gameContainerRef,
  variant,
  isMyTurn,
  className,
}: GameLayoutProps) {
  // If lobby is provided (e.g. game not started), it takes precedence over board/chat
  if (lobby) {
    return (
      <LayoutContainer
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
      ref={gameContainerRef}
      className={className}
      $variant={variant}
      $isMyTurn={isMyTurn}
    >
      {header}
      <MainArea $showChat={showChat}>
        <GameBoardArea>{children}</GameBoardArea>
        {chat && <ChatArea $showChat={showChat}>{chat}</ChatArea>}
      </MainArea>
      {modals}
    </LayoutContainer>
  );
}
