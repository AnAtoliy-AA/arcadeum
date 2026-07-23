'use client';

import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';

interface LobbyOptionSectionProps {
  title: string;
  children: React.ReactNode;
  hint?: string;
}

export function LobbyOptionSection({
  title,
  children,
  hint,
}: LobbyOptionSectionProps) {
  return (
    <YStack gap="$2">
      <Text
        fontSize="$2"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing={0.5}
        color="$textSecondary"
      >
        {title}
      </Text>
      {children}
      {hint && (
        <Text fontSize="$1" color="$textMuted" opacity={0.7}>
          {hint}
        </Text>
      )}
    </YStack>
  );
}

interface ChipOption {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
  comingSoon?: boolean;
}

interface LobbyChipGroupProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accentColor?: string;
  testIdPrefix?: string;
}

export function LobbyChipGroup({
  options,
  value,
  onChange,
  disabled = false,
  accentColor = '#6366f1',
  testIdPrefix = 'chip',
}: LobbyChipGroupProps) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {options.map((option) => {
        const isActive = value === option.id;
        const isDisabled = disabled || option.comingSoon;
        return (
          <Button
            key={option.id}
            variant="chip"
            size="sm"
            data-testid={`${testIdPrefix}-${option.id}`}
            data-active={isActive}
            disabled={isDisabled}
            backgroundColor={
              isActive ? `${accentColor}20` : 'rgba(255, 255, 255, 0.04)'
            }
            borderColor={
              isActive ? `${accentColor}80` : 'rgba(255, 255, 255, 0.10)'
            }
            color={isActive ? accentColor : '#cbd5e1'}
            hoverStyle={{
              backgroundColor: isActive
                ? `${accentColor}30`
                : 'rgba(255, 255, 255, 0.08)',
            }}
            borderRadius={10}
            fontWeight={500}
            fontSize={13}
            opacity={option.comingSoon ? 0.4 : disabled && !isActive ? 0.5 : 1}
            onPress={() => !isDisabled && onChange(option.id)}
          >
            {option.emoji && <Text marginRight={2}>{option.emoji}</Text>}
            {option.label}
            {option.comingSoon && (
              <Text marginLeft={2} fontSize={10} opacity={0.85}>
                Coming Soon
              </Text>
            )}
          </Button>
        );
      })}
    </XStack>
  );
}

interface LobbyToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function LobbyToggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  hint,
}: LobbyToggleProps) {
  return (
    <YStack gap="$1">
      <XStack alignItems="center" gap="$3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          style={{
            width: 16,
            height: 16,
            accentColor: '#6366f1',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <Text
          fontSize="$3"
          fontWeight="500"
          color={disabled ? '$textMuted' : '$color'}
        >
          {label}
        </Text>
      </XStack>
      {hint && (
        <Text fontSize="$1" color="$textMuted" opacity={0.7} marginLeft={28}>
          {hint}
        </Text>
      )}
    </YStack>
  );
}
