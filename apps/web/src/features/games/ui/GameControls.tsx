"use client";

import React from "react";
import styled from "styled-components";

interface GameControlsProps {
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "primary" | "secondary" | "minimal";
  showFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
}

const ControlsContainer = styled.div<{ $position?: string; $variant?: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case "primary": return theme.surfaces.panel.background;
      case "secondary": return "rgba(255, 255, 255, 0.05)";
      case "minimal": return "transparent";
      default: return theme.surfaces.panel.background;
    }
  }};
  border-radius: 12px;
  border: ${({ theme, $variant }) => 
    $variant === "minimal" ? "none" : `1px solid ${theme.surfaces.card.border}`
  };
  box-shadow: ${({ $variant }) => 
    $variant === "minimal" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)"
  };
  backdrop-filter: blur(10px);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
`;

const ControlButton = styled.button<{ $variant?: string }>`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case "primary": return theme.buttons.primary.gradientStart;
      case "secondary": return theme.surfaces.card.background;
      case "minimal": return "transparent";
      default: return theme.buttons.secondary.background;
    }
  }};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "primary": return theme.buttons.primary.text;
      case "secondary": return theme.text.primary;
      case "minimal": return theme.text.primary;
      default: return theme.text.primary;
    }
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: ${({ theme, $variant }) => 
    $variant === "minimal" ? `1px solid ${theme.surfaces.card.border}` : "none"
  };

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.surfaces.card.border};
  opacity: 0.3;
`;

export function GameControls({ 
  children, 
  className, 
  position = "bottom",
  variant = "primary",
  showFullscreen = true,
  onFullscreenToggle,
  showSettings = false,
  onSettings,
  showHelp = false,
  onHelp
}: GameControlsProps) {
  return (
    <ControlsContainer 
      className={className} 
      $position={position}
      $variant={variant}
    >
      {children}
      
      {(children && (showFullscreen || showSettings || showHelp)) && (
        <Divider />
      )}
      
      {showFullscreen && (
        <ControlButton 
          $variant={variant}
          onClick={onFullscreenToggle}
          title="Toggle fullscreen"
        >
          🖥️
        </ControlButton>
      )}
      
      {showSettings && (
        <ControlButton 
          $variant={variant}
          onClick={onSettings}
          title="Game settings"
        >
          ⚙️
        </ControlButton>
      )}
      
      {showHelp && (
        <ControlButton 
          $variant={variant}
          onClick={onHelp}
          title="Game help"
        >
          ❓
        </ControlButton>
      )}
    </ControlsContainer>
  );
}

// Specific control buttons for common game actions
export function LeaveButton({
  onClick,
  className,
  variant = "secondary"
}: {
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <ControlButton 
      className={className}
      $variant={variant}
      onClick={onClick}
      title="Leave game"
    >
      🚪 Leave
    </ControlButton>
  );
}

export function StartButton({ 
  onClick, 
  className,
  disabled = false,
  variant = "primary"
}: { 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <ControlButton
      className={className}
      $variant={variant}
      onClick={onClick}
      disabled={disabled}
      title="Start game"
    >
      ▶️ Start
    </ControlButton>
  );
}

export function ReadyButton({ 
  onClick, 
  className,
  ready = false,
  variant = "primary"
}: { 
  onClick?: () => void; 
  className?: string;
  ready?: boolean;
  variant?: "primary" | "secondary" | "success";
}) {
  return (
    <ControlButton 
      className={className}
      $variant={ready ? "success" : variant}
      onClick={onClick}
      title={ready 
        ? "Not ready"
        : "I'm ready"
      }
    >
      {ready ? "✅" : "⚪"} {ready ? "Ready" : "Not Ready"}
    </ControlButton>
  );
}