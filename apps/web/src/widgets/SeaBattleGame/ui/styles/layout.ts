import styled from 'styled-components';
import { SeaBattleTheme } from '../../lib/theme';

export const GameContainer = styled.div<{ $theme: SeaBattleTheme }>`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${(props) => props.$theme.gameBackground};
  font-family: ${(props) => props.$theme.fontFamily || 'inherit'};
  transition: background 0.5s ease;
`;

export const GameContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const BoardArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;

  @media (max-width: 768px) {
    padding: 8px;

    .placement-header {
      display: flex;
      margin-bottom: 8px;
    }
  }
`;

export const SidebarArea = styled.div`
  width: 320px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 300px;
  }
`;

export const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const MainGameArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const GameBoardWrapper = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const BoardContainer = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`;
