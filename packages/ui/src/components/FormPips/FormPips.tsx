import { XStack, View, Text, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export type FormResult = 'W' | 'L' | 'D';

export type FormPipsProps = {
  results: FormResult[];
  max?: number;
  size?: number;
  variant?: 'dot' | 'letter';
} & Omit<ComponentProps<typeof XStack>, 'children'>;

const Pip = styled(View, {
  name: 'FormPip',
  width: 10,
  height: 10,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: 'transparent',
  variants: {
    result: {
      W: { backgroundColor: '$success' },
      L: { backgroundColor: '$danger' },
      D: { backgroundColor: '$neutral', borderColor: '$borderColor' },
    },
  } as const,
});

const LetterTile = styled(View, {
  name: 'FormPipLetter',
  width: 16,
  height: 16,
  borderRadius: 4,
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    result: {
      W: {
        backgroundColor: 'rgba(52,211,153,0.18)',
        borderColor: 'rgba(52,211,153,0.4)',
      },
      L: {
        backgroundColor: 'rgba(239,68,68,0.18)',
        borderColor: 'rgba(239,68,68,0.4)',
      },
      D: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: '$borderColor',
      },
    },
  } as const,
});

const LetterText = styled(Text, {
  name: 'FormPipLetterText',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 1,
  variants: {
    result: {
      W: { color: '$success' },
      L: { color: '$danger' },
      D: { color: '$textSecondary' },
    },
  } as const,
});

export function FormPips({
  results,
  max = 7,
  size,
  variant = 'dot',
  ...rest
}: FormPipsProps) {
  const sliced = results.slice(-max);
  return (
    <XStack
      gap={4}
      alignItems="center"
      accessibilityLabel="Recent form"
      {...rest}
    >
      {sliced.map((r, i) =>
        variant === 'letter' ? (
          <LetterTile key={i} result={r}>
            <LetterText result={r}>{r}</LetterText>
          </LetterTile>
        ) : (
          <Pip
            key={i}
            result={r}
            width={size ?? 10}
            height={size ?? 10}
            borderRadius={(size ?? 10) / 2}
          />
        ),
      )}
    </XStack>
  );
}
