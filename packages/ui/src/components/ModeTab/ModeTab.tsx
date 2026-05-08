import { XStack, YStack, View, Text, styled } from 'tamagui';
import type { KeyboardEvent } from 'react';

export type ModeTabProps = {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  gradient: string;
  active?: boolean;
  onSelect?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  testID?: string;
};

const Card = styled(XStack, {
  name: 'ModeTab',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.02)',
  cursor: 'pointer',
  minWidth: 200,
  borderTopWidth: 2,
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.04)' },
  focusStyle: { outlineWidth: 0, borderColor: '$mythicAccent' },
  variants: {
    active: {
      true: {
        borderTopColor: '$mythicAccent',
        backgroundColor: 'rgba(236,72,153,0.06)',
      },
      false: {
        borderTopColor: '$borderColor',
      },
    },
  } as const,
});

const IconTile = styled(View, {
  name: 'ModeTabIconTile',
  width: 36,
  height: 36,
  borderRadius: '$2',
  alignItems: 'center',
  justifyContent: 'center',
});

export function ModeTab({
  id,
  name,
  subtitle,
  icon,
  gradient,
  active = false,
  onSelect,
  onKeyDown,
  testID,
}: ModeTabProps) {
  return (
    <Card
      active={active}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onPress={onSelect}
      onKeyDown={onKeyDown}
      testID={testID ?? `mode-tab-${id}`}
    >
      <IconTile style={{ background: gradient }}>
        <Text fontSize="$5">{icon}</Text>
      </IconTile>
      <YStack gap={2} flex={1}>
        <Text fontSize="$3" fontWeight="700">
          {name}
        </Text>
        {subtitle ? (
          <Text fontSize="$1" opacity={0.7}>
            {subtitle}
          </Text>
        ) : null}
      </YStack>
    </Card>
  );
}
