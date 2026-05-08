'use client';
import { XStack, Text } from 'tamagui';

interface BadgePillProps {
  icon: string;
  label: string;
  bg: string;
  border: string;
  color: string;
  className?: string;
  ariaLabel?: string;
}

export function BadgePill({
  icon,
  label,
  bg,
  border,
  color,
  className,
  ariaLabel,
}: BadgePillProps) {
  return (
    <XStack
      alignItems="center"
      gap="$1"
      paddingHorizontal="$2"
      paddingVertical="$0.5"
      borderRadius={8}
      borderWidth={1}
      backgroundColor={bg}
      borderColor={border}
      className={className}
      aria-label={ariaLabel}
    >
      <Text fontSize={10}>{icon}</Text>
      <Text
        fontSize={9}
        fontWeight="700"
        color={color}
        textTransform="uppercase"
      >
        {label}
      </Text>
    </XStack>
  );
}

export function TeamPill({
  team,
}: {
  team: { name: string; color: string };
}) {
  return (
    <XStack
      alignItems="center"
      gap="$1"
      paddingHorizontal="$2"
      paddingVertical="$0.5"
      borderRadius={999}
      borderWidth={1}
      backgroundColor="rgba(0,0,0,0.3)"
      borderColor={team.color}
      marginLeft="$1"
    >
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: team.color,
        }}
      />
      <Text
        fontSize={9}
        fontWeight="700"
        color={team.color}
        textTransform="uppercase"
      >
        {team.name}
      </Text>
    </XStack>
  );
}
