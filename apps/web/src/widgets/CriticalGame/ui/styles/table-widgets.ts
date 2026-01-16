import styled, { css, DefaultTheme } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';
import { GAME_VARIANT } from '../../lib/constants';

const getActionsButtonColor = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.secondary;
  return 'rgba(255, 255, 255, 0.7)';
};

const getActionsButtonHoverColor = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.accent;
  return theme.buttons.primary?.gradientStart || '#ffffff';
};

/* TableInfo, TableStat, StatIcon, StatValue, and InfoCard have been moved to table-info.ts */

export const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      transparent
    );
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const ActionsHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER ? '0 1rem' : '0 0 0.5rem 0'};
  background: none;
  position: relative;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      margin: 0 0 0.5rem 0;
      padding: 0.5rem 1rem;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 1rem;
        right: 1rem;
        height: 1px;
        background: rgba(34, 211, 238, 0.1);
      }
    `}

  ${InfoTitle} {
    margin: 0;
    padding: 0;
    border: none;
    ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK &&
      css`
        color: ${VARIANT_COLORS.cyberpunk.secondary};
        text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}80;
        font-family: 'Courier New', monospace;
      `}

    ${({ $variant }) =>
      $variant === GAME_VARIANT.UNDERWATER &&
      css`
        color: #22d3ee;
        font-family: 'Courier New', monospace;
        font-weight: 700;
        font-size: 0.7rem;
        letter-spacing: 1px;
        text-transform: uppercase;
      `}

    &::after {
      display: none;
    }
  }
`;

export const ActionsToggleButton = styled.button<{ $variant?: string }>`
  background: none;
  border: none;
  color: ${({ $variant }) => getActionsButtonColor($variant)};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s,
    transform 0.2s;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: monospace;
      text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}80;
      border: 1px solid ${VARIANT_COLORS.cyberpunk.secondary}66;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      &:hover {
        background: ${VARIANT_COLORS.cyberpunk.secondary}26;
      }
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      color: #22d3ee;
      &:hover {
        color: #a5f3fc;
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
      }
    `}

  &:hover {
    color: ${({ theme, $variant }) =>
      getActionsButtonHoverColor($variant, theme)};
    transform: scale(1.1);
  }
`;
