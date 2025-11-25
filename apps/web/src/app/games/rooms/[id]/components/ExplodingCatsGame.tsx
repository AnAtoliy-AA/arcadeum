"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import type {
  GameRoomSummary,
  GameSessionSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsCatCard,
} from "@/shared/types/games";
import { useTranslation } from "@/shared/lib/useTranslation";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 24px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  min-height: 600px;
  box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart} 100%
    );
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% {
      opacity: 0.5;
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
    padding: 1.5rem;
    overflow-y: auto;
  }

  /* Firefox fullscreen */
  &:-moz-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1.5rem;
    overflow-y: auto;
  }

  /* Webkit fullscreen */
  &:-webkit-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1.5rem;
    overflow-y: auto;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GameTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const GameStatus = styled.div`
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

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const GameTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 2px solid ${({ theme }) => theme.surfaces.panel.border};
  position: relative;
  min-height: 400px;

  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}20,
      transparent 50%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}20
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const PlayersRing = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 900px;
  justify-items: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CenterTable = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 16px;
  background: ${({ theme }) => theme.background.base};
  border: 2px dashed ${({ theme }) => theme.surfaces.card.border};
  min-width: 300px;
  position: relative;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
`;

const InfoCard = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
`;

const InfoTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
`;

const PlayersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerCard = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean; $isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-radius: 16px;
  background: ${({ $isCurrentTurn, $isCurrentUser, theme }) =>
    $isCurrentTurn
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart})`
      : $isCurrentUser
      ? theme.surfaces.card.background
      : theme.surfaces.panel.background};
  color: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.text.primary};
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.5)};
  border: 2px solid
    ${({ $isCurrentTurn, $isCurrentUser, theme }) =>
      $isCurrentTurn
        ? theme.buttons.primary.gradientStart
        : $isCurrentUser
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.panel.border};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser }) =>
    $isCurrentTurn
      ? "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)"
      : $isCurrentUser
      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s ease;
  position: relative;
  min-width: 140px;

  ${({ $isCurrentTurn }) =>
    $isCurrentTurn &&
    `
    animation: glow 2s ease-in-out infinite;

    @keyframes glow {
      0%, 100% {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.5);
      }
      50% {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.8);
      }
    }
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $isCurrentTurn }) =>
      $isCurrentTurn
        ? "0 12px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.8)"
        : "0 6px 16px rgba(0, 0, 0, 0.2)"};
  }
`;

const PlayerAvatar = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean }>`
  width: 60px;
  height: 60px;
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
`;

const Card = styled.div<{ $cardType?: string; $index?: number }>`
  aspect-ratio: 2/3;
  border-radius: 12px;
  background: ${({ $cardType }) => {
    if ($cardType === "exploding_cat") return "linear-gradient(135deg, #DC2626, #991B1B)";
    if ($cardType === "defuse") return "linear-gradient(135deg, #10B981, #059669)";
    if ($cardType === "attack") return "linear-gradient(135deg, #F59E0B, #D97706)";
    if ($cardType === "skip") return "linear-gradient(135deg, #3B82F6, #2563EB)";
    return "linear-gradient(135deg, #8B5CF6, #7C3AED)";
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: ${({ $index }) => `cardFadeIn 0.3s ease-out ${($index || 0) * 0.05}s both`};

  @keyframes cardFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) rotateZ(-5deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateZ(0deg);
    }
  }

  &:hover {
    transform: translateY(-8px) rotateZ(2deg) scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 10;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }
`;

const CardEmoji = styled.div`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ variant, theme }) => {
    if (variant === "danger") {
      return `
        background: linear-gradient(135deg, #DC2626, #991B1B);
        color: white;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      `;
    }
    if (variant === "secondary") {
      return `
        background: ${theme.buttons.secondary.background};
        color: ${theme.buttons.secondary.text};
        border: 2px solid ${theme.buttons.secondary.border};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `;
    }
    return `
      background: linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart});
      color: ${theme.buttons.primary.text};
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    `;
  }}

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ variant }) =>
      variant === "danger"
        ? "0 6px 20px rgba(220, 38, 38, 0.6)"
        : variant === "secondary"
        ? "0 4px 16px rgba(0, 0, 0, 0.15)"
        : "0 6px 20px rgba(59, 130, 246, 0.6)"};

    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(50%);
  }
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
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onStart: () => void;
  onDraw: () => void;
  onPlayCard: (card: "skip" | "attack") => void;
  onPlayCatCombo: (input: {
    cat: ExplodingCatsCatCard;
    mode: "pair" | "trio";
    targetPlayerId: string;
    desiredCard?: ExplodingCatsCard;
  }) => void;
  onPostHistoryNote: (message: string, scope: "all" | "players") => void;
  actionBusy: string | null;
  startBusy: boolean;
}

function getCardTranslationKey(card: ExplodingCatsCard): string {
  const keys: Record<ExplodingCatsCard, string> = {
    exploding_cat: "games.table.cards.explodingCat",
    defuse: "games.table.cards.defuse",
    attack: "games.table.cards.attack",
    skip: "games.table.cards.skip",
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
    tacocat: "🌮",
    hairy_potato_cat: "🥔",
    rainbow_ralphing_cat: "🌈",
    cattermelon: "🍉",
    bearded_cat: "🧔",
  };
  return emojis[card] || "🐱";
}

export function ExplodingCatsGame({
  room,
  session,
  currentUserId,
  isHost,
  onStart,
  onDraw,
  onPlayCard,
  onPlayCatCombo,
  onPostHistoryNote,
  actionBusy,
  startBusy,
}: ExplodingCatsGameProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [catComboModal, setCatComboModal] = useState<{
    cat: ExplodingCatsCatCard;
    availableModes: ("pair" | "trio")[];
  } | null>(null);
  const [selectedMode, setSelectedMode] = useState<"pair" | "trio" | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExplodingCatsCard | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatScope, setChatScope] = useState<"all" | "players">("all");

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

    onPlayCatCombo({
      cat: catComboModal.cat,
      mode: selectedMode,
      targetPlayerId: selectedTarget,
      desiredCard: selectedMode === "trio" ? selectedCard! : undefined,
    });

    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, [catComboModal, selectedMode, selectedTarget, selectedCard, onPlayCatCombo]);

  const handleCloseCatComboModal = useCallback(() => {
    setCatComboModal(null);
    setSelectedMode(null);
    setSelectedTarget(null);
    setSelectedCard(null);
  }, []);

  const handleSendChatMessage = useCallback(() => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;

    onPostHistoryNote(trimmed, chatScope);
    setChatMessage("");
  }, [chatMessage, chatScope, onPostHistoryNote]);

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
            <GameStatus>
              {room.playerCount} {t("games.table.lobby.playersInLobby") || "players in lobby"}
            </GameStatus>
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
            {isHost && (
              <StartButton onClick={onStart} disabled={startBusy || room.playerCount < 2}>
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
            {room.playerCount < 2
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
          <GameStatus>
            {currentTurnPlayer
              ? `${
                  currentTurnPlayer.playerId === currentUserId
                    ? t("games.table.players.yourTurn") || "Your turn"
                    : t("games.table.players.waitingFor") || "Waiting for player..."
                }`
              : "Game in progress"}
          </GameStatus>
        </GameInfo>
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
      </GameHeader>

      <GameBoard>
        <GameTable>
          <PlayersRing>
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
                <PlayerCard
                  key={playerId}
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
              );
            })}
          </PlayersRing>

          <CenterTable>
            <InfoTitle style={{ margin: 0 }}>
              {t("games.table.state.deck") || "Game State"}
            </InfoTitle>
            <div style={{
              display: "flex",
              gap: "2rem",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "1rem",
              fontWeight: 600
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎴</div>
                <div>{t("games.table.state.deck") || "Deck"}</div>
                <div style={{ fontSize: "1.5rem", color: "#3B82F6" }}>{snapshot.deck.length}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗑️</div>
                <div>{t("games.table.state.discard") || "Discard"}</div>
                <div style={{ fontSize: "1.5rem", color: "#F59E0B" }}>{snapshot.discardPile.length}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                <div>{t("games.table.state.pendingDraws") || "Pending"}</div>
                <div style={{ fontSize: "1.5rem", color: "#DC2626" }}>{snapshot.pendingDraws}</div>
              </div>
            </div>
          </CenterTable>

          {snapshot.logs && snapshot.logs.length > 0 && (
            <InfoCard style={{ maxWidth: "600px" }}>
              <InfoTitle>{t("games.table.log.title") || "Game Log"}</InfoTitle>
              <GameLog>
                {snapshot.logs.slice(-5).map((log) => {
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
              </GameLog>
            </InfoCard>
          )}
        </GameTable>
        {currentPlayer && currentPlayer.alive && (
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
                        <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                        <div>{t(getCardTranslationKey(card) as any) || card}</div>
                        {count > 1 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "0.5rem",
                              right: "0.5rem",
                              background: "rgba(0, 0, 0, 0.8)",
                              color: "white",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {count}
                          </div>
                        )}
                      </Card>
                    );
                  });
                })()}
              </CardsGrid>
            </InfoCard>

            {isMyTurn && (
              <InfoCard>
                <InfoTitle>{t("games.table.actions.start") || "Actions"}</InfoTitle>
                <ActionButtons>
                    <ActionButton
                      onClick={onDraw}
                      disabled={!canAct || actionBusy === "draw"}
                    >
                      {actionBusy === "draw"
                        ? t("games.table.actions.drawing") || "Drawing..."
                        : t("games.table.actions.draw") || "Draw Card"}
                    </ActionButton>
                    {currentPlayer.hand.includes("skip") && (
                      <ActionButton
                        variant="secondary"
                        onClick={() => onPlayCard("skip")}
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
                        onClick={() => onPlayCard("attack")}
                        disabled={!canAct || actionBusy === "attack"}
                      >
                        {actionBusy === "attack"
                          ? t("games.table.actions.playingAttack") || "Playing..."
                          : t("games.table.actions.playAttack") || "Play Attack"}
                      </ActionButton>
                    )}
                  </ActionButtons>
                </InfoCard>
              )}
          </HandContainer>
        )}

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
                        {t(getCardTranslationKey(card) as any) || card}
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
    </GameContainer>
  );
}
