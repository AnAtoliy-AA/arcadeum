"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useTranslation } from "@/shared/lib/useTranslation";
import { gameSocket } from "@/shared/lib/socket";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";

interface GamesControlPanelProps {
  roomId?: string;
  className?: string;
  onMovePlayer?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView?: () => void;
  showMoveControls?: boolean;
}

const Panel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 1rem;
  z-index: 10;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${({ $variant, theme }) => {
    if ($variant === "danger") {
      return `
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        color: white;
      `;
    }
    if ($variant === "primary") {
      return `
        background: linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart});
        color: ${theme.buttons.primary.text};
      `;
    }
    return `
      background: ${theme.surfaces.card.background};
      color: ${theme.text.primary};
      border: 1px solid ${theme.surfaces.card.border};
    `;
  }}

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

export function GamesControlPanel({ roomId, className, onMovePlayer, onCenterView, showMoveControls }: GamesControlPanelProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (roomId && snapshot.userId) {
      gameSocket.emit("games.room.leave", { roomId, userId: snapshot.userId });
    }
    router.push("/games");
  }, [roomId, snapshot.userId, router]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMovePlayer?.(direction);
  };

  const handleCenterView = () => {
    onCenterView?.();
  };

  return (
    <Panel className={className} ref={containerRef}>
      <Button onClick={handleFullscreenToggle} title={isFullscreen ? t("games.table.controlPanel.exitFullscreen") : t("games.table.controlPanel.enterFullscreen")}>
        {isFullscreen ? "⤓" : "⤢"} {t("games.table.controlPanel.fullscreen")}
      </Button>
      
      {showMoveControls && (
        <>
          <div style={{
            display: 'flex',
            gap: '0.25rem',
            border: '1px solid var(--surfaces-card-border, #e5e7eb)',
            borderRadius: '6px',
            padding: '0.25rem'
          }}>
            <Button
              $variant="secondary"
              onClick={() => handleMove('up')}
              title={t("games.table.controlPanel.moveControls.shortcuts.up")}
              style={{ padding: '0.5rem', minWidth: 'auto' }}
            >
              ↑
            </Button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Button
                $variant="secondary"
                onClick={() => handleMove('left')}
                title={t("games.table.controlPanel.moveControls.shortcuts.left")}
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                ←
              </Button>
              <Button
                $variant="secondary"
                onClick={() => handleCenterView()}
                title={t("games.table.controlPanel.moveControls.shortcuts.center")}
                style={{ padding: '0.5rem', minWidth: 'auto', fontSize: '0.75rem' }}
              >
                ⚡
              </Button>
              <Button
                $variant="secondary"
                onClick={() => handleMove('right')}
                title={t("games.table.controlPanel.moveControls.shortcuts.right")}
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                →
              </Button>
            </div>
            <Button
              $variant="secondary"
              onClick={() => handleMove('down')}
              title={t("games.table.controlPanel.moveControls.shortcuts.down")}
              style={{ padding: '0.5rem', minWidth: 'auto' }}
            >
              ↓
            </Button>
          </div>
        </>
      )}

      <Button $variant="danger" onClick={handleLeaveRoom}>
        🚪 {t("games.table.controlPanel.leaveRoom")}
      </Button>
    </Panel>
  );
}
