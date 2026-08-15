'use client';

import { useState } from 'react';
import { YStack, styled } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useScenePalette } from './ScenePaletteContext';

export interface MobileActionSheetProps {
  isOpen: boolean;
  title: string;
  description: string;
  opponents: Array<{ playerId: string; alive: boolean }>;
  resolveDisplayName: (id: string, fallback?: string) => string;
  onConfirm: (targetId: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const Sheet = styled(YStack, {
  name: 'MobileActionSheet',
  position: 'fixed' as unknown as 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  padding: '$4',
  gap: '$3',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(16px)',
  borderTopWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.14)',
  zIndex: 200,
});

export function MobileActionSheet({
  isOpen,
  title,
  description,
  opponents,
  resolveDisplayName,
  onConfirm,
  onCancel,
  confirmLabel = 'Play',
  cancelLabel = 'Cancel',
}: MobileActionSheetProps) {
  const palette = useScenePalette();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!isOpen) return null;

  const liveOpponents = opponents.filter((o) => o.alive);

  return (
    <Sheet
      data-testid="mobile-action-sheet"
      role="dialog"
      aria-modal={true}
      style={{ boxShadow: `0 -8px 32px ${palette.opponentTurnHaloColor}` }}
    >
      <span className="box-border text-[18px] font-bold text-[var(--color)]">
        {title}
      </span>
      <span className="box-border text-[13px] opacity-[0.75] text-[var(--color)]">
        {description}
      </span>

      <div className="box-border flex flex-col items-stretch gap-2">
        {liveOpponents.map((opp) => {
          const isSelected = selectedTarget === opp.playerId;
          return (
            <Button
              key={opp.playerId}
              variant={isSelected ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setSelectedTarget(opp.playerId)}
              active={isSelected}
            >
              {resolveDisplayName(opp.playerId)}
            </Button>
          );
        })}
      </div>

      <div className="box-border flex flex-row items-stretch gap-2 justify-end">
        <Button variant="secondary" size="md" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!selectedTarget}
          onClick={() => selectedTarget && onConfirm(selectedTarget)}
        >
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}
