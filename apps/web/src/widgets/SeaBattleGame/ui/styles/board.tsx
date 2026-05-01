import { styled, XStack, YStack, Text } from 'tamagui';
import type { ReactNode, CSSProperties } from 'react';

// CSS Grid wrapper — 10×10 grid that reliably computes its own height.
// Accepts the same theme props (backgroundColor, borderColor) as inline styles.
interface BoardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundColor?: string;
  borderColor?: string;
  pointerEvents?: CSSProperties['pointerEvents'];
  children?: ReactNode;
}

export function BoardGrid({
  backgroundColor,
  borderColor,
  pointerEvents,
  style,
  children,
  ...rest
}: BoardGridProps) {
  return (
    <div
      {...rest}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gridTemplateRows: 'repeat(10, 1fr)',
        aspectRatio: '1',
        padding: 4,
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: backgroundColor ?? undefined,
        borderColor: borderColor ?? undefined,
        pointerEvents: pointerEvents ?? 'auto',
        ...(typeof style === 'object' ? style : {}),
      }}
    >
      {children}
    </div>
  );
}

// State-aware coloring is done inline by the component via useSeaBattleTheme()
export const BoardCell = styled(YStack, {
  name: 'BoardCell',

  variants: {
    isClickable: {
      true: { cursor: 'crosshair' },
      false: { cursor: 'default' },
    },
    animated: {
      true: { animation: 'medium' },
    },
  } as const,

  defaultVariants: {
    animated: false,
  },
  pointerEvents: 'auto',
  userSelect: 'none',
});

// CSS Grid layout: [empty corner] [col labels]
// [row labels ] [board grid ]
export function BoardWithLabels({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto auto',
        gap: '4px',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

export const RowLabels = styled(YStack, {
  name: 'RowLabels',
  justifyContent: 'space-around',
  paddingVertical: 4,
});

export const ColLabels = styled(XStack, {
  name: 'ColLabels',
  justifyContent: 'space-around',
  paddingHorizontal: 4,
});

export const Label = styled(Text, {
  name: 'Label',
  fontSize: 14,
  width: 24,
  height: 24,
  textAlign: 'center',

  $md: {
    fontSize: 14,
    width: 25,
    height: 25,
  },

  $sm: {
    fontSize: 10,
    width: 16,
    height: 16,
  },
});
