import React, { useState, useEffect } from 'react';
import {
  YStack,
  XStack,
  Text,
  Checkbox as TamaCheckbox,
  styled,
} from 'tamagui';
import type { UseAutoplayReturn } from '../hooks/useAutoplay';

interface AutoplayControlsProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  autoplayState: UseAutoplayReturn;
}

const Container = styled(YStack, {
  position: 'relative',
  zIndex: 50,
});

const Header = styled(XStack, {
  alignItems: 'center',
  gap: '$2',
  cursor: 'pointer',
  padding: '$2 $3',
  userSelect: 'none',
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.3)',
  borderRadius: '$4',

  hoverStyle: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },

  variants: {
    expanded: {
      true: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
      },
      false: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
    },
  } as const,
});

const HeaderText = styled(Text, {
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '$3',
  fontWeight: '600',
});

const Toggle = styled(Text, {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '$2',
});

const DropdownMenu = styled(YStack, {
  position: 'absolute',
  top: '100%',
  // Anchor to the right edge of the trigger so the 280px menu doesn't
  // overflow the viewport when the autoplay button sits in the
  // right-aligned widget header bar.
  right: 0,
  marginTop: '$2',
  width: 280,
  backgroundColor: '#1e1e2e',
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.3)',
  borderRadius: '$4',
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  padding: '$2',
  gap: '$1',
  overflow: 'hidden',
});

const Label = styled(XStack, {
  alignItems: 'center',
  gap: '$3',
  cursor: 'pointer',
  padding: '$2 $3',
  borderRadius: '$2',

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  variants: {
    secondary: {
      true: {
        paddingLeft: '$6',
        opacity: 0.9,
      },
    },
  } as const,
});

const ControlText = styled(Text, {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '$3',
  fontWeight: '500',
});

interface CheckboxItemProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  secondary?: boolean;
  disabled?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  checked,
  onCheckedChange,
  label,
  secondary,
  disabled,
}) => (
  <Label
    secondary={secondary}
    opacity={disabled ? 0.5 : 1}
    onClick={() => !disabled && onCheckedChange(!checked)}
  >
    <TamaCheckbox
      id={label}
      size="$4"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      borderColor="rgba(99, 102, 241, 0.5)"
      backgroundColor="rgba(99, 102, 241, 0.1)"
    >
      <TamaCheckbox.Indicator>
        <Text color="#6366f1">✓</Text>
      </TamaCheckbox.Indicator>
    </TamaCheckbox>
    <ControlText ml="$2">{label}</ControlText>
  </Label>
);

export const AutoplayControls: React.FC<AutoplayControlsProps> = ({
  t,
  autoplayState,
}) => {
  const [expanded, setExpanded] = useState(false);

  const {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled,
    setAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoDrawSkipAfterShuffleEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  } = autoplayState;

  useEffect(() => {
    const handleClickOutside = () => {
      if (expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expanded]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Container onClick={handleContainerClick}>
      <Header onClick={() => setExpanded(!expanded)} expanded={expanded}>
        <HeaderText>{t('games.table.autoplay.title')}</HeaderText>
        <Toggle>{expanded ? '▲' : '▼'}</Toggle>
      </Header>
      {expanded && (
        <DropdownMenu>
          <CheckboxItem
            checked={allEnabled}
            onCheckedChange={setAllEnabled}
            label={t('games.table.autoplay.autoPlay')}
          />
          <CheckboxItem
            checked={autoDrawEnabled}
            onCheckedChange={setAutoDrawEnabled}
            label={t('games.table.autoplay.autoDraw')}
            secondary
          />
          <CheckboxItem
            checked={autoSkipEnabled}
            onCheckedChange={setAutoSkipEnabled}
            label={t('games.table.autoplay.autoSkip')}
            secondary
          />
          <CheckboxItem
            checked={autoShuffleAfterDefuseEnabled}
            onCheckedChange={setAutoShuffleAfterDefuseEnabled}
            label={t('games.table.autoplay.autoShuffle')}
            secondary
          />
          <CheckboxItem
            checked={autoDrawSkipAfterShuffleEnabled}
            onCheckedChange={setAutoDrawSkipAfterShuffleEnabled}
            label={t('games.table.autoplay.autoDrawSkipAfterShuffle')}
            secondary
            disabled={!autoShuffleAfterDefuseEnabled}
          />
          <CheckboxItem
            checked={autoNopeAttackEnabled}
            onCheckedChange={setAutoNopeAttackEnabled}
            label={t('games.table.autoplay.autoNopeAttack')}
            secondary
          />
          <CheckboxItem
            checked={autoGiveFavorEnabled}
            onCheckedChange={setAutoGiveFavorEnabled}
            label={t('games.table.autoplay.autoGiveFavor')}
            secondary
          />
          <CheckboxItem
            checked={autoDefuseEnabled}
            onCheckedChange={setAutoDefuseEnabled}
            label={t('games.table.autoplay.autoDefuse')}
            secondary
          />
        </DropdownMenu>
      )}
    </Container>
  );
};
