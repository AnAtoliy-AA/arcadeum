"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { useGameSession, useGameActions } from "@/features/games/hooks";
import type {
  GameRoomSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsCatCard,
} from "@/shared/types/games";
import { useTranslation } from "@/shared/lib/useTranslation";
import type { TranslationKey } from "@/shared/lib/useTranslation";
import { gameSocket } from "@/shared/lib/socket";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2.5rem;
  border-radius: 32px;
  background:
    radial-gradient(ellipse at top, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, ${({ theme }) => theme.background.base} 0%, ${({ theme }) => theme.surfaces.card.background} 100%);
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  min-height: 600px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 100%;

  /* Ambient lighting effect */
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 40%
    );
    animation: ambientGlow 8s ease-in-out infinite;
    pointer-events: none;
  }

  /* Top accent bar */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.buttons.primary.gradientStart} 20%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart} 80%,
      transparent 100%
    );
    box-shadow: 0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}80;
    animation: shimmer 4s ease-in-out infinite;
  }

  @keyframes ambientGlow {
    0%, 100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.5;
    }
    50% {
      transform: translate(10%, -10%) scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes shimmer {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  /* Fullscreen mode styles */
  &:fullscreen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1rem 1rem 2rem 1rem;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart}50 transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.buttons.primary.gradientStart}50;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme.buttons.primary.gradientStart}70;
    }

    /* Mobile optimizations for fullscreen */
    @media (max-width: 768px) {
      padding: 0.5rem 0.5rem 3rem 0.5rem;
      gap: 0.5rem;
    }

    /* Disable ambient glow in fullscreen to prevent unwanted scroll */
    &::before {
      display: none;
    }
  }

  /* Firefox fullscreen */
  &:-moz-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1rem 1rem 2rem 1rem;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart}50 transparent;

    /* Mobile optimizations for fullscreen */
    @media (max-width: 768px) {
      padding: 0.5rem 0.5rem 3rem 0.5rem;
      gap: 0.5rem;
    }

    /* Disable ambient glow in fullscreen to prevent unwanted scroll */
    &::before {
      display: none;
    }
  }

  /* Webkit fullscreen */
  &:-webkit-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1rem 1rem 2rem 1rem;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart}50 transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.buttons.primary.gradientStart}50;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme.buttons.primary.gradientStart}70;
    }

    /* Mobile optimizations for fullscreen */
    @media (max-width: 768px) {
      padding: 0.5rem 0.5rem 3rem 0.5rem;
      gap: 0.5rem;
    }

    /* Disable ambient glow in fullscreen to prevent unwanted scroll */
    &::before {
      display: none;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
    gap: 1.25rem;
    border-width: 1.5px;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background:
    linear-gradient(135deg,
      ${({ theme }) => theme.surfaces.card.background}dd,
      ${({ theme }) => theme.surfaces.panel.background}cc
    );
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GameTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const TurnStatus = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FullscreenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${({ theme }) => theme.buttons.primary.gradientStart}20, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChatToggleButton = styled.button<{ $active?: boolean }>`
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.buttons.primary.gradientStart : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  min-height: 0;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TableArea = styled.div<{ $showChat: boolean }>`
  display: grid;
  grid-template-columns: ${({ $showChat }) =>
    $showChat ? "minmax(0, 2fr) minmax(280px, 1fr)" : "minmax(0, 1fr)"};
  grid-template-rows: ${({ $showChat }) => ($showChat ? "1fr auto" : "1fr auto")};
  grid-template-areas: ${({ $showChat }) =>
    $showChat ? `"table chat" "hand chat"` : `"table" "hand"`};
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
  min-height: 0;
  height: auto;
  max-height: none;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: ${({ $showChat }) => ($showChat ? "auto auto 400px" : "auto auto")};
    grid-template-areas: ${({ $showChat }) =>
      $showChat ? `"table" "hand" "chat"` : `"table" "hand"`};
  }

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const HandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  grid-area: hand;
  min-width: 0;
`;

const GameTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border-radius: 32px;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    radial-gradient(
      ellipse at center,
      ${({ theme }) => theme.surfaces.panel.background}ee,
      ${({ theme }) => theme.background.base}dd
    );
  backdrop-filter: blur(20px);
  border: 3px solid;
  border-color: ${({ theme }) => theme.surfaces.panel.border};
  position: relative;
  width: 100%;
  flex: 1;
  min-height: clamp(500px, 65vh, 900px);
  max-height: none;
  grid-area: table;
  overflow: visible;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 100px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  /* Felt-like texture overlay */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 1px,
        rgba(0, 0, 0, 0.02) 1px,
        rgba(0, 0, 0, 0.02) 2px
      );
    border-radius: 32px;
    pointer-events: none;
  }

  /* Glowing border effect */
  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 32px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}40,
      transparent 30%,
      transparent 70%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}40
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.6;
    animation: borderGlow 3s ease-in-out infinite;
  }

  @keyframes borderGlow {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-height: 420px;
    border-radius: 24px;
    border-width: 2px;

    &::after {
      border-radius: 24px;
    }
  }
`;

const PlayersRing = styled.div<{ $playerCount: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 400px;
  }
`;

const PlayerPositionWrapper = styled.div<{ $position: number; $total: number }>`
  position: absolute;
  ${({ $position, $total }) => {
    const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
    const radiusX = 45; // percentage
    const radiusY = 42; // percentage
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return `
      left: ${x}%;
      top: ${y}%;
      transform: translate(-50%, -50%);
    `;
  }}

  @media (max-width: 768px) {
    ${({ $position, $total }) => {
      const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
      const radiusX = 44;
      const radiusY = 40;
      const x = 50 + radiusX * Math.cos(angle);
      const y = 50 + radiusY * Math.sin(angle);
      return `
        left: ${x}%;
        top: ${y}%;
      `;
    }}
  }
`;

const CenterTable = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem;
  border-radius: 50%;
  background:
    repeating-radial-gradient(
      circle at center,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 2px,
      rgba(0, 0, 0, 0.02) 4px
    ),
    radial-gradient(
      circle at 30% 30%,
      ${({ theme }) => theme.surfaces.card.background}ff,
      ${({ theme }) => theme.surfaces.card.background}ee 50%,
      ${({ theme }) => theme.background.base}dd
    );
  backdrop-filter: blur(30px);
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  width: 280px;
  height: 280px;
  position: relative;
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.4),
    inset 0 0 80px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);

  /* Rim lighting effect */
  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}60,
      transparent 90deg,
      transparent 270deg,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}60 360deg
    );
    animation: rotate 10s linear infinite;
    z-index: -1;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    width: 180px;
    height: 180px;
    padding: 1rem;
    border-width: 3px;

    &::before {
      inset: -3px;
    }
  }
`;

const InfoCard = styled.div`
  padding: 1.5rem;
  border-radius: 20px;
  background:
    linear-gradient(135deg,
      ${({ theme }) => theme.surfaces.panel.background}ee,
      ${({ theme }) => theme.surfaces.card.background}dd
    );
  backdrop-filter: blur(20px);
  border: 2px solid ${({ theme }) => theme.surfaces.panel.border};
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.02) 10px,
        rgba(255, 255, 255, 0.02) 20px
      );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }
`;

const ChatCard = styled(InfoCard)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  grid-area: chat;
  overflow: hidden;
  align-self: stretch;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    height: 400px;
    max-height: 400px;
    flex-shrink: 0;
  }
`;

const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: "";
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

const TableInfo = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  width: 90%;
  justify-content: space-around;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    gap: 0.4rem;
    bottom: 0.4rem;
  }
`;

const TableStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    gap: 0.15rem;

    > div:first-child {
      font-size: 0.9rem !important;
    }

    > div:last-child {
      font-size: 0.75rem !important;
    }
  }
`;

const PlayerCard = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean; $isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 0.75rem;
  border-radius: 16px;
  background: ${({ $isCurrentTurn, $isCurrentUser, $isAlive, theme }) =>
    !$isAlive
      ? `${theme.surfaces.panel.background}80`
      : $isCurrentTurn
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}ee, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}ee)`
      : $isCurrentUser
      ? `${theme.surfaces.card.background}dd`
      : `${theme.surfaces.panel.background}cc`};
  backdrop-filter: blur(10px);
  color: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.text.primary};
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.6)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(80%)')};
  border: 2px solid
    ${({ $isCurrentTurn, $isCurrentUser, theme }) =>
      $isCurrentTurn
        ? theme.buttons.primary.gradientStart
        : $isCurrentUser
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.panel.border};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser }) =>
    $isCurrentTurn
      ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(59, 130, 246, 0.6)"
      : $isCurrentUser
      ? "0 4px 16px rgba(0, 0, 0, 0.25)"
      : "0 2px 12px rgba(0, 0, 0, 0.15)"};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 120px;
  max-width: 140px;

  ${({ $isCurrentTurn }) =>
    $isCurrentTurn &&
    `
    animation: glow 2s ease-in-out infinite;

    @keyframes glow {
      0%, 100% {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(59, 130, 246, 0.6);
      }
      50% {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 36px rgba(59, 130, 246, 0.9);
      }
    }
  `}

  &:hover {
    transform: scale(1.05) translateY(-4px);
    box-shadow: ${({ $isCurrentTurn }) =>
      $isCurrentTurn
        ? "0 16px 48px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 1)"
        : "0 8px 24px rgba(0, 0, 0, 0.3)"};
  }

  @media (max-width: 768px) {
    min-width: 100px;
    max-width: 110px;
    padding: 0.75rem 0.5rem;
  }
`;

const PlayerAvatar = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn
      ? theme.buttons.primary.text
      : theme.background.base};
  border: 3px solid ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.surfaces.card.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  transition: all 0.3s ease;
  position: relative;

  ${({ $isAlive }) => !$isAlive && `
    filter: grayscale(100%);
  `}
`;

const PlayerName = styled.div<{ $isCurrentTurn?: boolean }>`
  font-weight: ${({ $isCurrentTurn }) => ($isCurrentTurn ? "700" : "600")};
  font-size: 0.875rem;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
`;

const PlayerCardCount = styled.div<{ $isCurrentTurn?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? `${theme.buttons.primary.text}20` : theme.background.base};
  border: 1px solid ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.surfaces.card.border};
  font-weight: 600;
`;

const TurnIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
`;

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
    gap: 0.75rem;
  }
`;

const Card = styled.div<{ $cardType?: string; $index?: number }>`
  aspect-ratio: 2/3;
  border-radius: 16px;
  background: ${({ $cardType }) => {
    if ($cardType === "exploding_cat") return "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)";
    if ($cardType === "defuse") return "linear-gradient(135deg, #10B981 0%, #059669 100%)";
    if ($cardType === "attack") return "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
    if ($cardType === "skip") return "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)";
    if ($cardType === "favor") return "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)";
    if ($cardType === "shuffle") return "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)";
    if ($cardType === "see_the_future") return "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)";
    return "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)";
  }};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: ${({ $index }) => `cardSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${($index || 0) * 0.08}s both`};

  @keyframes cardSlideIn {
    from {
      opacity: 0;
      transform: translateY(40px) rotateZ(-8deg) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateZ(0deg) scale(1);
    }
  }

  &:hover {
    transform: translateY(-12px) rotateZ(3deg) scale(1.08);
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.15);
    z-index: 10;
  }

  /* Shine overlay */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    pointer-events: none;
    border-radius: 16px;
  }

  /* Pattern overlay */
  &::after {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)";
    pointer-events: none;
  }
`;

const CardInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
`;

const CardFrame = styled.div`
  position: absolute;
  inset: 4px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 2;

  &::before,
  &::after {
    content: "◆";
    position: absolute;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.6rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &::before {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    inset: 3px;
    border-width: 1.5px;

    &::before,
    &::after {
      font-size: 0.5rem;
    }
  }
`;

const CardCorner = styled.div<{ $position: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
  z-index: 2;

  ${({ $position }) => {
    switch ($position) {
      case 'tl':
        return `
          top: 6px;
          left: 6px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 4px;
        `;
      case 'tr':
        return `
          top: 6px;
          right: 6px;
          border-left: none;
          border-bottom: none;
          border-top-right-radius: 4px;
        `;
      case 'bl':
        return `
          bottom: 6px;
          left: 6px;
          border-right: none;
          border-top: none;
          border-bottom-left-radius: 4px;
        `;
      case 'br':
        return `
          bottom: 6px;
          right: 6px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 4px;
        `;
    }
  }}

  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
    border-width: 1.5px;

    ${({ $position }) => {
      switch ($position) {
        case 'tl':
          return `top: 4px; left: 4px;`;
        case 'tr':
          return `top: 4px; right: 4px;`;
        case 'bl':
          return `bottom: 4px; left: 4px;`;
        case 'br':
          return `bottom: 4px; right: 4px;`;
      }
    }}
  }
`;

const CardEmoji = styled.div`
  font-size: 2.5rem;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5));
  transform: scale(1);
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardName = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }
`;

const CardCountBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 900;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    top: 0.35rem;
    right: 0.35rem;
  }
`;

const LastPlayedCard = styled(Card)<{ $isAnimating?: boolean }>`
  position: absolute;
  width: 100px;
  max-width: 100px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) ${({ $isAnimating }) => $isAnimating ? 'rotateY(180deg) scale(1.1)' : 'rotateY(0deg)'};
  z-index: 10;
  animation: ${({ $isAnimating }) => $isAnimating ? 'cardFlip 0.6s ease-out' : 'cardFloat 3s ease-in-out infinite'};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  cursor: default;

  @keyframes cardFlip {
    0% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) rotateY(90deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotateY(180deg) scale(1);
    }
  }

  @keyframes cardFloat {
    0%, 100% {
      transform: translate(-50%, -50%) translateY(0px);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-8px);
    }
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  @media (max-width: 768px) {
    width: 65px;
    max-width: 65px;
    padding: 0.5rem 0.35rem;
    gap: 0.35rem;

    ${CardEmoji} {
      font-size: 1.5rem;
    }

    > div {
      font-size: 0.55rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 1rem 1.75rem;
  border-radius: 16px;
  border: none;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.75px;

  ${({ variant, theme }) => {
    if (variant === "danger") {
      return `
        background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
        color: white;
        box-shadow:
          0 6px 20px rgba(220, 38, 38, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      `;
    }
    if (variant === "secondary") {
      return `
        background: linear-gradient(135deg, ${theme.buttons.secondary.background}, ${theme.buttons.secondary.background}dd);
        color: ${theme.buttons.secondary.text};
        border: 2px solid ${theme.buttons.secondary.border};
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      `;
    }
    return `
      background: linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart});
      color: ${theme.buttons.primary.text};
      box-shadow:
        0 6px 20px rgba(59, 130, 246, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    `;
  }}

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: all 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ variant }) =>
      variant === "danger"
        ? "0 10px 32px rgba(220, 38, 38, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
        : variant === "secondary"
        ? "0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
        : "0 10px 32px rgba(59, 130, 246, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3)"};

    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);

    &::after {
      opacity: 0.8;
      transform: scale(1);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(60%);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.825rem;
    border-radius: 14px;
  }
`;

const ChatSendButton = styled(ActionButton)`
  padding: 0.65rem 1.25rem;
  font-size: 0.75rem;
`;

const GameLog = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const LogEntry = styled.div<{ $type?: string }>`
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $type, theme }) => {
    if ($type === "action") return theme.surfaces.panel.background;
    if ($type === "system") return theme.background.base;
    return "transparent";
  }};
  color: ${({ theme }) => theme.text.secondary};
  border-left: 3px solid
    ${({ $type }) => {
      if ($type === "action") return "#3B82F6";
      if ($type === "system") return "#8B5CF6";
      return "transparent";
    }};
  padding-left: 0.75rem;
`;

const ChatMessages = styled(GameLog)`
  flex: 1 1 0;
  display: flex;
  flex-direction: column-reverse;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart} transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    border-radius: 999px;
  }
`;

const ScopeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ScopeOption = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 120px;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.buttons.primary.gradientStart : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

const ChatInput = styled.textarea`
  width: 100%;
  min-height: 90px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const ChatControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ChatHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  opacity: 0.85;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 24px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.surfaces.card.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.surfaces.panel.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
    transform: rotate(90deg);
  }
`;

const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

const OptionButton = styled.button<{ $selected?: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? theme.buttons.primary.gradientStart : theme.surfaces.card.border};
  background: ${({ $selected, theme }) =>
    $selected
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.panel.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const ModalButton = styled(ActionButton)`
  flex: 1;
`;

interface ExplodingCatsGameProps {
  roomId: string;
  room: GameRoomSummary;
  isHost: boolean;
  initialSession?: unknown | null;
}

function getCardTranslationKey(card: ExplodingCatsCard): TranslationKey {
  const keys: Record<ExplodingCatsCard, TranslationKey> = {
    exploding_cat: "games.table.cards.explodingCat",
    defuse: "games.table.cards.defuse",
    attack: "games.table.cards.attack",
    skip: "games.table.cards.skip",
    favor: "games.table.cards.favor",
    shuffle: "games.table.cards.shuffle",
    see_the_future: "games.table.cards.seeTheFuture",
    tacocat: "games.table.cards.tacocat",
    hairy_potato_cat: "games.table.cards.hairyPotatoCat",
    rainbow_ralphing_cat: "games.table.cards.rainbowRalphingCat",
    cattermelon: "games.table.cards.cattermelon",
    bearded_cat: "games.table.cards.beardedCat",
  };
  return keys[card] || "games.table.cards.generic";
}

function getCardEmoji(card: ExplodingCatsCard): string {
  const emojis: Record<ExplodingCatsCard, string> = {
    exploding_cat: "💣",
    defuse: "🛡️",
    attack: "⚔️",
    skip: "⏭️",
    favor: "🤝",
    shuffle: "🔀",
    see_the_future: "🔮",
    tacocat: "🌮",
    hairy_potato_cat: "🥔",
    rainbow_ralphing_cat: "🌈",
    cattermelon: "🍉",
    bearded_cat: "🧔",
  };
  return emojis[card] || "🐱";
}

export default function ExplodingCatsGame({ roomId, room, isHost, initialSession }: ExplodingCatsGameProps) {
  const { t } = useTranslation();
  const { snapshot: userSession } = useSessionTokens();

  // Use hooks to get session and actions
  const { session, actionBusy, setActionBusy, startBusy } = useGameSession({
    roomId,
    enabled: true,
    initialSession,
  });

  const actions = useGameActions({
    roomId,
    userId: userSession.userId,
    gameType: "exploding_cats_v1",
    onActionComplete: () => setActionBusy(null),
  });

  const currentUserId = userSession.userId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [catComboModal, setCatComboModal] = useState<{
    cat: ExplodingCatsCatCard;
    availableModes: ("pair" | "trio")[];
  } | null>(null);
  const [favorModal, setFavorModal] = useState(false);
  const [seeTheFutureModal, setSeeTheFutureModal] = useState<{
    cards: ExplodingCatsCard[];
  } | null>(null);
  const [selectedMode, setSelectedMode] = useState<"pair" | "trio" | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExplodingCatsCard | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatScope, setChatScope] = useState<"all" | "players">("all");
  const [showChat, setShowChat] = useState(true);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Failed to toggle fullscreen:", err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F key to toggle fullscreen
      if (e.key === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in input/textarea
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  const snapshot: ExplodingCatsSnapshot | null = useMemo(() => {
    if (!session?.state?.snapshot) return null;
    return session.state.snapshot as ExplodingCatsSnapshot;
  }, [session]);
  const chatLogCount = snapshot?.logs?.length ?? 0;

  // Auto-scroll chat to newest message
  useEffect(() => {
    if (chatMessagesRef.current?.lastElementChild) {
      chatMessagesRef.current.lastElementChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [chatLogCount]);

  // Listen for See the Future response
  useEffect(() => {
    const handleSeeTheFuture = (data: { topCards: string[] }) => {
      if (data.topCards) {
        setSeeTheFutureModal({ cards: data.topCards as ExplodingCatsCard[] });
      }
    };

    gameSocket.on("games.session.see_the_future.played", handleSeeTheFuture);

    return () => {
      gameSocket.off("games.session.see_the_future.played", handleSeeTheFuture);
    };
  }, []);

  const currentPlayer: ExplodingCatsPlayerState | null = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId) || null;
  }, [snapshot, currentUserId]);

  const currentTurnPlayer = useMemo(() => {
    if (!snapshot) return null;
    const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex];
    return snapshot.players.find((p) => p.playerId === turnPlayerId);
  }, [snapshot]);

  const isMyTurn = useMemo(() => {
    return currentTurnPlayer?.playerId === currentUserId;
  }, [currentTurnPlayer, currentUserId]);

  const canAct = useMemo(() => {
    return isMyTurn && !actionBusy && currentPlayer?.alive;
  }, [isMyTurn, actionBusy, currentPlayer]);

  const catCards: ExplodingCatsCatCard[] = useMemo(() => [
    "tacocat",
    "hairy_potato_cat",
    "rainbow_ralphing_cat",
    "cattermelon",
    "bearded_cat",
  ], []);

  const allGameCards: ExplodingCatsCard[] = useMemo(() => [
    "exploding_cat",
    "defuse",
    "attack",
    "skip",
    ...catCards,
  ], [catCards]);

  const aliveOpponents = useMemo(() => {
    if (!snapshot || !currentUserId) return [];
    return snapshot.players.filter(
      (p) => p.alive && p.playerId !== currentUserId
    );
  }, [snapshot, currentUserId]);

  const handleOpenCatCombo = useCallback((cat: ExplodingCatsCatCard) => {
    if (!currentPlayer) return;

    const count = currentPlayer.hand.filter((c) => c === cat).length;
    const availableModes: ("pair" | "trio")[] = [];

    if (count >= 2) availableModes.push("pair");
    if (count >= 3) availableModes.push("trio");

    if (availableModes.length === 0) return;

    setCatComboModal({ cat, availableModes });
    setSelectedMode(availableModes[0]);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, [currentPlayer]);

  const handleConfirmCatCombo = useCallback(() => {
    if (!catComboModal || !selectedMode || !selectedTarget) return;

    if (selectedMode === "trio" && !selectedCard) return;

    actions.playCatCombo(
      catComboModal.cat,
      selectedMode,
      selectedTarget,
      selectedMode === "trio" ? selectedCard! : undefined,
    );

    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, [catComboModal, selectedMode, selectedTarget, selectedCard, actions]);

  const handleCloseCatComboModal = useCallback(() => {
    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, []);

  const handleSendChatMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;

    actions.postHistoryNote(trimmed, chatScope);
    setChatMessage("");
  }, [chatMessage, chatScope, actions]);

  const trimmedChatMessage = chatMessage.trim();
  const canSendChatMessage = trimmedChatMessage.length > 0;
  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const resolveDisplayName = useCallback(
    (userId?: string | null, fallback?: string | null) => {
      if (!userId) {
        return fallback ?? "";
      }
      if (userId === currentUserId) {
        return t("games.table.players.you") || "You";
      }
      if (room.host?.id === userId) {
        return room.host.displayName || room.host.id;
      }
      const member = room.members?.find((candidate) => candidate.id === userId);
      if (member) {
        return member.displayName || member.id;
      }
      return (
        fallback ||
        (userId.length > 8
          ? `${userId.slice(0, 8)}…`
          : userId)
      );
    },
    [currentUserId, room.host, room.members, t]
  );

  const participantReplacements = useMemo(() => {
    const entries = new Map<string, string>();
    const register = (userId?: string | null, fallback?: string | null) => {
      if (!userId) {
        return;
      }
      if (entries.has(userId)) {
        return;
      }
      entries.set(userId, resolveDisplayName(userId, fallback));
    };

    register(room.host?.id, room.host?.displayName ?? null);
    room.members?.forEach((member) =>
      register(
        member.id,
        member.displayName ?? null
      )
    );
    snapshot?.players.forEach((player) =>
      register(
        player.playerId,
        player.playerId === currentUserId
          ? t("games.table.players.you") || "You"
          : `Player ${player.playerId.slice(0, 8)}`
      )
    );

    return Array.from(entries.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );
  }, [currentUserId, resolveDisplayName, room.host, room.members, snapshot?.players, t]);

  const formatLogMessage = useCallback(
    (message?: string | null) => {
      if (!message || participantReplacements.length === 0) {
        return message || "";
      }
      return participantReplacements.reduce((acc, [id, name]) => {
        if (!id || !name || id === name || !acc.includes(id)) {
          return acc;
        }
        return acc.split(id).join(name);
      }, message);
    },
    [participantReplacements]
  );

  // Game not started yet
  if (!snapshot) {
    return (
      <GameContainer ref={containerRef}>
        <GameHeader>
          <GameInfo>
            <GameTitle>Exploding Cats</GameTitle>
            <TurnStatus>
              {room.playerCount} {t("games.table.lobby.playersInLobby") || "players in lobby"}
            </TurnStatus>
          </GameInfo>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <FullscreenButton
              onClick={toggleFullscreen}
              title={
                isFullscreen
                  ? t("games.table.fullscreen.exit") || "Exit fullscreen (Esc)"
                  : t("games.table.fullscreen.enter") || "Enter fullscreen (F)"
              }
              aria-label={
                isFullscreen
                  ? t("games.table.fullscreen.exit") || "Exit fullscreen"
                  : t("games.table.fullscreen.enter") || "Enter fullscreen"
              }
            >
              {isFullscreen ? "⤓" : "⤢"}
            </FullscreenButton>
            {isHost && room.status === "lobby" && (
              <StartButton onClick={actions.startExplodingCats} disabled={startBusy || room.playerCount < 2}>
                {startBusy
                  ? t("games.table.actions.starting") || "Starting..."
                  : t("games.table.actions.start") || "Start Game"}
              </StartButton>
            )}
          </div>
        </GameHeader>
        <EmptyState>
          <div style={{ fontSize: "3rem" }}>🎮</div>
          <div>
            <strong>{t("games.table.lobby.waitingToStart") || "Waiting for game to start..."}</strong>
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            {room.status !== "lobby"
              ? "Game is loading..."
              : room.playerCount < 2
              ? t("games.table.lobby.needTwoPlayers") || "Need at least 2 players to start"
              : isHost
              ? t("games.table.lobby.hostCanStart") || "Click 'Start Game' when ready"
              : t("games.table.lobby.waitingForHost") || "Waiting for host to start the game"}
          </div>
        </EmptyState>
      </GameContainer>
    );
  }

  // Game in progress
  return (
    <GameContainer ref={containerRef}>
      <GameHeader>
        <GameInfo>
          <GameTitle>Exploding Cats</GameTitle>
          <TurnStatus>
            {currentTurnPlayer
              ? `${
                  currentTurnPlayer.playerId === currentUserId
                    ? t("games.table.players.yourTurn") || "Your turn"
                    : t("games.table.players.waitingFor") || "Waiting for player..."
                }`
              : "Game in progress"}
          </TurnStatus>
        </GameInfo>
        <HeaderActions>
          <ChatToggleButton
            type="button"
            onClick={handleToggleChat}
            $active={showChat}
            aria-pressed={showChat}
          >
            {showChat
              ? t("games.table.chat.hide") || "Hide Chat"
              : t("games.table.chat.show") || "Show Chat"}
          </ChatToggleButton>
          <FullscreenButton
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? t("games.table.fullscreen.exit") || "Exit fullscreen (Esc)"
                : t("games.table.fullscreen.enter") || "Enter fullscreen (F)"
            }
            aria-label={
              isFullscreen
                ? t("games.table.fullscreen.exit") || "Exit fullscreen"
                : t("games.table.fullscreen.enter") || "Enter fullscreen"
            }
          >
            {isFullscreen ? "⤓" : "⤢"}
          </FullscreenButton>
        </HeaderActions>
      </GameHeader>

      <GameBoard>
        <TableArea $showChat={showChat}>
          <GameTable>
            <PlayersRing $playerCount={snapshot.playerOrder.length}>
            {snapshot.playerOrder.map((playerId, index) => {
              const player = snapshot.players.find((p) => p.playerId === playerId);
              if (!player) return null;

              const isCurrent = index === snapshot.currentTurnIndex;
              const isCurrentUserCard = playerId === currentUserId;
              const displayName = resolveDisplayName(
                playerId,
                playerId === currentUserId
                  ? t("games.table.players.you") || "You"
                  : `Player ${playerId.slice(0, 8)}`
              );

              return (
                <PlayerPositionWrapper
                  key={playerId}
                  $position={index}
                  $total={snapshot.playerOrder.length}
                >
                  <PlayerCard
                    $isCurrentTurn={isCurrent}
                    $isAlive={player.alive}
                    $isCurrentUser={isCurrentUserCard}
                  >
                    {isCurrent && <TurnIndicator>⭐</TurnIndicator>}
                    <PlayerAvatar $isCurrentTurn={isCurrent} $isAlive={player.alive}>
                      {player.alive ? "🎮" : "💀"}
                    </PlayerAvatar>
                    <PlayerName $isCurrentTurn={isCurrent}>{displayName}</PlayerName>
                    {player.alive && (
                      <PlayerCardCount $isCurrentTurn={isCurrent}>
                        🃏 {player.hand.length}
                      </PlayerCardCount>
                    )}
                  </PlayerCard>
                </PlayerPositionWrapper>
              );
            })}

              <CenterTable>
                {snapshot.discardPile.length > 0 && (
                  <LastPlayedCard
                    $cardType={snapshot.discardPile[snapshot.discardPile.length - 1]}
                    $isAnimating={false}
                  >
                    <CardCorner $position="tl" />
                    <CardCorner $position="tr" />
                    <CardCorner $position="bl" />
                    <CardCorner $position="br" />
                    <CardFrame />
                    <CardInner>
                      <CardEmoji>{getCardEmoji(snapshot.discardPile[snapshot.discardPile.length - 1])}</CardEmoji>
                      <CardName>
                        {t(getCardTranslationKey(snapshot.discardPile[snapshot.discardPile.length - 1])) || snapshot.discardPile[snapshot.discardPile.length - 1]}
                      </CardName>
                    </CardInner>
                  </LastPlayedCard>
                )}
                <TableInfo>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>🎴</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{snapshot.deck.length}</div>
                  </TableStat>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>🗑️</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{snapshot.discardPile.length}</div>
                  </TableStat>
                  <TableStat>
                    <div style={{ fontSize: "1.2rem" }}>⏳</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#DC2626" }}>{snapshot.pendingDraws}</div>
                  </TableStat>
                </TableInfo>
              </CenterTable>

            </PlayersRing>
          </GameTable>

          {currentPlayer && currentPlayer.alive && (
            <HandSection>
              {isMyTurn && (
                <InfoCard>
                  <InfoTitle>{t("games.table.actions.start") || "Actions"}</InfoTitle>
                  <ActionButtons>
                    <ActionButton
                      onClick={actions.drawCard}
                      disabled={!canAct || actionBusy === "draw"}
                    >
                      {actionBusy === "draw"
                        ? t("games.table.actions.drawing") || "Drawing..."
                        : t("games.table.actions.draw") || "Draw Card"}
                    </ActionButton>
                    {currentPlayer.hand.includes("skip") && (
                      <ActionButton
                        variant="secondary"
                        onClick={() => actions.playActionCard("skip")}
                        disabled={!canAct || actionBusy === "skip"}
                      >
                        {actionBusy === "skip"
                          ? t("games.table.actions.playingSkip") || "Playing..."
                          : t("games.table.actions.playSkip") || "Play Skip"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("attack") && (
                      <ActionButton
                        variant="danger"
                        onClick={() => actions.playActionCard("attack")}
                        disabled={!canAct || actionBusy === "attack"}
                      >
                        {actionBusy === "attack"
                          ? t("games.table.actions.playingAttack") || "Playing..."
                          : t("games.table.actions.playAttack") || "Play Attack"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("shuffle") && (
                      <ActionButton
                        variant="secondary"
                        onClick={() => actions.playActionCard("shuffle")}
                        disabled={!canAct || actionBusy === "shuffle"}
                      >
                        {actionBusy === "shuffle"
                          ? "Playing..."
                          : "🔀 Shuffle"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("favor") && (
                      <ActionButton
                        variant="primary"
                        onClick={() => setFavorModal(true)}
                        disabled={!canAct || actionBusy === "favor"}
                      >
                        {actionBusy === "favor"
                          ? "Playing..."
                          : "🤝 Favor"}
                      </ActionButton>
                    )}
                    {currentPlayer.hand.includes("see_the_future") && (
                      <ActionButton
                        variant="primary"
                        onClick={actions.playSeeTheFuture}
                        disabled={!canAct || actionBusy === "see_the_future"}
                      >
                        {actionBusy === "see_the_future"
                          ? "Playing..."
                          : "🔮 See Future"}
                      </ActionButton>
                    )}
                  </ActionButtons>
                </InfoCard>
              )}

              <HandContainer>
                <InfoCard>
                  <InfoTitle>
                    {t("games.table.hand.title") || "Your Hand"} ({currentPlayer.hand.length}{" "}
                    {currentPlayer.hand.length === 1
                      ? t("games.table.state.card") || "card"
                      : t("games.table.state.cards") || "cards"}
                    )
                  </InfoTitle>
                  <CardsGrid>
                    {(() => {
                      // Get unique cards and their counts
                      const uniqueCards = Array.from(new Set(currentPlayer.hand));
                      const cardCounts = new Map<ExplodingCatsCard, number>();
                      currentPlayer.hand.forEach((card) => {
                        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
                      });

                      return uniqueCards.map((card) => {
                        const count = cardCounts.get(card) || 1;
                        const isCatCard = catCards.includes(card as ExplodingCatsCatCard);
                        const canPlayCombo = isCatCard && count >= 2 && canAct && aliveOpponents.length > 0;

                        return (
                          <Card
                            key={card}
                            $cardType={card}
                            $index={0}
                            onClick={() => {
                              if (canPlayCombo) {
                                handleOpenCatCombo(card as ExplodingCatsCatCard);
                              }
                            }}
                            style={{
                              cursor: canPlayCombo ? "pointer" : "default",
                              opacity: canPlayCombo ? 1 : isCatCard && count === 1 ? 0.7 : 1,
                            }}
                          >
                            <CardCorner $position="tl" />
                            <CardCorner $position="tr" />
                            <CardCorner $position="bl" />
                            <CardCorner $position="br" />
                            <CardFrame />
                            <CardInner>
                              <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                              <CardName>{t(getCardTranslationKey(card)) || card}</CardName>
                            </CardInner>
                            {count > 1 && (
                              <CardCountBadge>
                                {count}
                              </CardCountBadge>
                            )}
                          </Card>
                        );
                      });
                    })()}
                  </CardsGrid>
                </InfoCard>
              </HandContainer>
            </HandSection>
          )}

          {showChat && (
            <ChatCard>
            <InfoTitle>{t("games.table.chat.title") || "Table Chat"}</InfoTitle>
            {snapshot.logs && snapshot.logs.length > 0 ? (
              <ChatMessages ref={chatMessagesRef}>
                {snapshot.logs.map((log) => {
                  const senderDisplay = resolveDisplayName(
                    log.senderId ?? undefined,
                    log.senderName ?? undefined
                  );
                  const renderedMessage = formatLogMessage(log.message);

                  return (
                    <LogEntry key={log.id} $type={log.type}>
                      {senderDisplay && <strong>{senderDisplay}: </strong>}
                      {renderedMessage}
                    </LogEntry>
                    );
                  })}
              </ChatMessages>
            ) : (
              <ChatHint>
                {t("games.table.chat.empty") || "No messages yet. Break the ice!"}
              </ChatHint>
            )}

            <ScopeToggle>
              <ScopeOption
                type="button"
                $active={chatScope === "all"}
                onClick={() => setChatScope("all")}
              >
                {t("games.table.chat.scope.all") || "All"}
              </ScopeOption>
              <ScopeOption
                type="button"
                $active={chatScope === "players"}
                onClick={() => setChatScope("players")}
              >
                {t("games.table.chat.scope.players") || "Players"}
              </ScopeOption>
            </ScopeToggle>

            <ChatInput
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder={
                chatScope === "all"
                  ? t("games.table.chat.placeholderAll") || "Send a note to everyone at the table"
                  : t("games.table.chat.placeholderPlayers") || "Send a note only to active players"
              }
              disabled={!currentUserId}
            />

            <ChatControls>
              <ChatHint>
                {chatScope === "all"
                  ? t("games.table.chat.hintAll") || "Visible to everyone in room"
                  : t("games.table.chat.hintPlayers") || "Visible to alive players only"}
              </ChatHint>
              <ChatSendButton
                type="button"
                onClick={handleSendChatMessage}
                disabled={!currentUserId || !canSendChatMessage}
              >
                {t("games.table.chat.send") || "Send"}
              </ChatSendButton>
            </ChatControls>
            </ChatCard>
          )}
        </TableArea>

        {currentPlayer && !currentPlayer.alive && (
          <EmptyState>
            <div style={{ fontSize: "4rem" }}>💀</div>
            <div>
              <strong style={{ fontSize: "1.25rem" }}>
                {t("games.table.eliminated.title") || "You have been eliminated!"}
              </strong>
            </div>
            <div style={{ fontSize: "1rem" }}>
              {t("games.table.eliminated.message") ||
                "Watch the remaining players battle it out"}
            </div>
          </EmptyState>
        )}
      </GameBoard>

      {/* Cat Combo Modal */}
      {catComboModal && (
        <Modal onClick={handleCloseCatComboModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {getCardEmoji(catComboModal.cat)} Play Cat Combo
              </ModalTitle>
              <CloseButton onClick={handleCloseCatComboModal}>×</CloseButton>
            </ModalHeader>

            {/* Mode Selection */}
            <ModalSection>
              <SectionLabel>Select Combo Mode</SectionLabel>
              <OptionGrid>
                {catComboModal.availableModes.includes("pair") && (
                  <OptionButton
                    $selected={selectedMode === "pair"}
                    onClick={() => setSelectedMode("pair")}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🎴🎴</div>
                    <div>Pair</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      Random card from target
                    </div>
                  </OptionButton>
                )}
                {catComboModal.availableModes.includes("trio") && (
                  <OptionButton
                    $selected={selectedMode === "trio"}
                    onClick={() => setSelectedMode("trio")}
                  >
                    <div style={{ fontSize: "1.5rem" }}>🎴🎴🎴</div>
                    <div>Trio</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      Choose specific card
                    </div>
                  </OptionButton>
                )}
              </OptionGrid>
            </ModalSection>

            {/* Target Player Selection */}
            <ModalSection>
              <SectionLabel>Select Target Player</SectionLabel>
              <OptionGrid>
                {aliveOpponents.map((opponent) => {
                  const displayName = resolveDisplayName(
                    opponent.playerId,
                    `Player ${opponent.playerId.slice(0, 8)}`
                  );
                  return (
                    <OptionButton
                      key={opponent.playerId}
                      $selected={selectedTarget === opponent.playerId}
                      onClick={() => setSelectedTarget(opponent.playerId)}
                    >
                      <div style={{ fontSize: "1.5rem" }}>🎮</div>
                      <div>{displayName}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {opponent.hand.length} cards
                      </div>
                    </OptionButton>
                  );
                })}
              </OptionGrid>
            </ModalSection>

            {/* Desired Card Selection (for trio mode) */}
            {selectedMode === "trio" && (
              <ModalSection>
                <SectionLabel>Select Desired Card</SectionLabel>
                <OptionGrid>
                  {allGameCards.map((card) => (
                    <OptionButton
                      key={card}
                      $selected={selectedCard === card}
                      onClick={() => setSelectedCard(card)}
                    >
                      <div style={{ fontSize: "1.5rem" }}>{getCardEmoji(card)}</div>
                      <div style={{ fontSize: "0.75rem" }}>
                        {t(getCardTranslationKey(card)) || card}
                      </div>
                    </OptionButton>
                  ))}
                </OptionGrid>
              </ModalSection>
            )}

            {/* Confirm/Cancel Actions */}
            <ModalActions>
              <ModalButton variant="secondary" onClick={handleCloseCatComboModal}>
                Cancel
              </ModalButton>
              <ModalButton
                onClick={handleConfirmCatCombo}
                disabled={
                  !selectedTarget ||
                  (selectedMode === "trio" && !selectedCard)
                }
              >
                Play Combo
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Favor Modal */}
      {favorModal && (
        <Modal onClick={() => setFavorModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🤝 Play Favor Card</ModalTitle>
              <CloseButton onClick={() => setFavorModal(false)}>×</CloseButton>
            </ModalHeader>

            <ModalSection>
              <SectionLabel>Select Target Player</SectionLabel>
              <OptionGrid>
                {aliveOpponents.map((opponent) => {
                  const displayName = resolveDisplayName(
                    opponent.playerId,
                    `Player ${opponent.playerId.slice(0, 8)}`
                  );
                  return (
                    <OptionButton
                      key={opponent.playerId}
                      $selected={selectedTarget === opponent.playerId}
                      onClick={() => setSelectedTarget(opponent.playerId)}
                    >
                      <div style={{ fontSize: "1.5rem" }}>🎮</div>
                      <div>{displayName}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {opponent.hand.length} cards
                      </div>
                    </OptionButton>
                  );
                })}
              </OptionGrid>
            </ModalSection>

            <ModalSection>
              <SectionLabel>Select Desired Card</SectionLabel>
              <OptionGrid>
                {allGameCards.map((card) => (
                  <OptionButton
                    key={card}
                    $selected={selectedCard === card}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div style={{ fontSize: "1.5rem" }}>{getCardEmoji(card)}</div>
                    <div style={{ fontSize: "0.75rem" }}>
                      {t(getCardTranslationKey(card)) || card}
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>

            <ModalActions>
              <ModalButton variant="secondary" onClick={() => {
                setFavorModal(false);
                setSelectedTarget(null);
                setSelectedCard(null);
              }}>
                Cancel
              </ModalButton>
              <ModalButton
                onClick={() => {
                  if (selectedTarget && selectedCard) {
                    actions.playFavor(selectedTarget, selectedCard);
                    setFavorModal(false);
                    setSelectedTarget(null);
                    setSelectedCard(null);
                  }
                }}
                disabled={!selectedTarget || !selectedCard}
              >
                Play Favor
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* See the Future Modal */}
      {seeTheFutureModal && (
        <Modal onClick={() => setSeeTheFutureModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>🔮 Top Cards of the Deck</ModalTitle>
              <CloseButton onClick={() => setSeeTheFutureModal(null)}>×</CloseButton>
            </ModalHeader>

            <ModalSection>
              <SectionLabel>
                Next {seeTheFutureModal.cards.length} card(s) to be drawn:
              </SectionLabel>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {seeTheFutureModal.cards.map((card, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                      {getCardEmoji(card)}
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {t(getCardTranslationKey(card)) || card}
                    </div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.25rem" }}>
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </ModalSection>

            <ModalActions>
              <ModalButton onClick={() => setSeeTheFutureModal(null)}>
                Close
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </GameContainer>
  );
}
