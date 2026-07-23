import './scrollbar.scss';
import React, { createContext, useContext } from 'react';
import { styled, XStack, YStack, Text } from 'tamagui';
import {
  GameContainer as BaseGameContainer,
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
  IconButton,
} from '@arcadeum/ui';
import { scrollbarStyles } from '@/shared/lib/styles';
import type { TurnContract } from './TurnIndicator';

const WidgetFullscreenContext = createContext<boolean>(false);

export function useWidgetFullscreen(): boolean {
  return useContext(WidgetFullscreenContext);
}

export { WidgetFullscreenContext };

interface ActiveEmote {
  key: string;
  userId: string;
  emoteId: string;
}

interface ActiveEmotesContextValue {
  emotes: ActiveEmote[];
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
}

const ActiveEmotesContext = createContext<ActiveEmotesContextValue>({
  emotes: [],
});

export function useActiveEmotes(): ActiveEmotesContextValue {
  return useContext(ActiveEmotesContext);
}

export function ActiveEmotesProvider({
  value,
  children,
}: {
  value: ActiveEmotesContextValue;
  children: React.ReactNode;
}) {
  return (
    <ActiveEmotesContext.Provider value={value}>
      {children}
    </ActiveEmotesContext.Provider>
  );
}

export const Container = styled(BaseGameContainer, {
  name: 'GameWidgetContainer',
  gap: '$5',
  paddingHorizontal: '$1',
  paddingTop: 0,
  paddingBottom: 0,
  borderRadius: 24,
  minHeight: 0,
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',
  backdropFilter: 'blur(20px)',
  height: 'auto',
  flexDirection: 'column',
  minWidth: 0,
  borderWidth: 1,
  borderColor: '$glassBorder',

  ...scrollbarStyles,

  $sm: {
    paddingHorizontal: '$2',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 16,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  variants: {
    $isMyTurn: {
      true: {
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        shadowColor: 'rgba(34, 197, 94, 0.4)',
      },
    },
    isFullscreen: {
      true: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        borderRadius: 0,
        background: '#151718',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 1100,
        paddingHorizontal: '$1',
        paddingTop: 0,
      },
    },
  } as const,
});

export const GameHeader = styled(XStack, {
  name: 'GameWidgetHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$7',
  paddingVertical: '$2',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  marginHorizontal: '-$1',
  marginTop: 0,
  position: 'sticky',
  top: 0,
  zIndex: 30,
  flexShrink: 0,

  $sm: {
    paddingHorizontal: '$4',
    paddingVertical: '$2',
    marginHorizontal: '-$2',
    marginTop: 0,
    top: 0,
    gap: '$1',
    flexWrap: 'nowrap',
  },
});

export const GameInfo = styled(XStack, {
  name: 'GameWidgetHeaderInfo',
  alignItems: 'center',
  gap: '$2',
  minWidth: 0,
  flex: 1,
  position: 'relative',

  $sm: {
    minWidth: 0,
    flex: 1,
  },
});

export const VariantIconBadge = styled(YStack, {
  name: 'GameWidgetVariantBadge',
  width: 30,
  height: 30,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  flexShrink: 0,

  $sm: {
    width: 24,
    height: 24,
  },
});

export const GameTitle = styled(Text, {
  name: 'GameWidgetTitle',
  margin: 0,
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: -0.3,
  numberOfLines: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as never,

  $sm: {
    fontSize: 13,
  },
});

export const TurnStatusPill = styled(XStack, {
  name: 'GameWidgetTurnPill',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderWidth: 1,
  alignItems: 'center',
  flexShrink: 0,

  variants: {
    $status: {
      yourTurn: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(16,185,129,0.4)',
      },
      waiting: {
        backgroundColor: 'rgba(234,179,8,0.1)',
        borderColor: 'rgba(234,179,8,0.35)',
      },
      completed: {
        backgroundColor: 'rgba(148,163,184,0.1)',
        borderColor: 'rgba(148,163,184,0.25)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

export const TurnStatusText = styled(Text, {
  name: 'GameWidgetTurnText',
  fontSize: 14,
  fontWeight: '600',

  variants: {
    $status: {
      yourTurn: { color: '$success' },
      waiting: { color: '$warning' },
      completed: { color: '$secondary' },
      default: { color: '$color', opacity: 0.7 },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

export const HeaderActions = styled(XStack, {
  name: 'GameWidgetHeaderActions',
  gap: '$2',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
});

export const FullscreenButton = (
  props: React.ComponentProps<typeof IconButton>,
) => (
  <IconButton
    size="sm"
    padding="$2"
    pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    {...props}
  />
);

export const SharedGameBoard = styled(BaseGameBoard, {
  name: 'SharedGameBoard',
  gap: '$4',
  zIndex: 20,
  flexDirection: 'column',
  position: 'relative',
  width: '100%',
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflow: 'visible',

  $sm: {
    padding: '$2',
  },
});

export const SharedTableArea = styled(BaseTableArea, {
  name: 'SharedTableArea',
  gap: '$4',
  flexDirection: 'column',
  minHeight: 0,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  height: 'auto',
});

export const SharedHandSection = styled(YStack, {
  name: 'SharedHandSection',
  gap: '$4',
  width: '100%',
  flexShrink: 0,
  zIndex: 30,
  position: 'relative',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingTop: '$4',
});

export type TurnStatusVariant =
  | 'completed'
  | 'yourTurn'
  | 'waiting'
  | 'default';

export interface SharedHeaderProps {
  variantEmoji: string;
  title: string;
  subtitle?: string;
  turn?: TurnContract;
  turnStatusVariant?: TurnStatusVariant;
  turnStatusText?: string;
  turnAvatar?: React.ReactNode;
  extraActions?: React.ReactNode;
  titleGradient?: string;
}
