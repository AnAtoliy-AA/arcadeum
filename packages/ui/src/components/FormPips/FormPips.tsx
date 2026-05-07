import { XStack, View, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export type FormResult = 'W' | 'L' | 'D';

export type FormPipsProps = {
  results: FormResult[];
  max?: number;
  size?: number;
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

export function FormPips({
  results,
  max = 7,
  size,
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
      {sliced.map((r, i) => (
        <Pip
          key={i}
          result={r}
          width={size ?? 10}
          height={size ?? 10}
          borderRadius={(size ?? 10) / 2}
        />
      ))}
    </XStack>
  );
}
