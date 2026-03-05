import { css } from 'styled-components';

export const scrollbarStyles = css`
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text.muted};
    opacity: 0.2;
    border-radius: 10px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.text.accent};
    opacity: 0.5;
  }

  /* Firefox support */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.text.muted} transparent`};
`;
