import { styled, View, XStack, YStack, Text } from 'tamagui';

export const Square = styled(View, {
  name: 'ChessSquare',
  flex: 1,
  aspectRatio: '1 / 1',
  borderWidth: 0,
  borderStyle: 'solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'default',
  transition: 'background-color 0.15s ease',
  overflow: 'hidden',
  position: 'relative',

  variants: {
    $isLight: {
      true: { backgroundColor: 'rgba(120, 140, 160, 0.25)' },
      false: { backgroundColor: 'rgba(40, 55, 75, 0.7)' },
    },
    $isSelected: {
      true: {
        backgroundColor: 'rgba(255, 215, 0, 0.25)',
        className: 'chess-square-selected',
      },
    },
    $isCheck: {
      true: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        className: 'chess-square-check',
      },
    },
    $isLastMove: {
      true: {
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        className: 'chess-square-last-move',
      },
    },
    $isLegalTarget: {
      true: { cursor: 'pointer' },
    },
  } as const,

  defaultVariants: {
    $isLight: false,
  },
});

export const Piece = styled(Text, {
  name: 'ChessPiece',
  position: 'relative',
  zIndex: 3,
  lineHeight: 1,
  userSelect: 'none',
  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s',
  filter:
    'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',

  hoverStyle: {
    transform: 'translateY(-3px)',
    filter:
      'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25))',
  },
});

export const RankLabel = styled(Text, {
  name: 'ChessRankLabel',
  position: 'absolute',
  right: 3,
  top: 2,
  fontSize: 10,
  fontWeight: '600',
  opacity: 0.35,
  pointerEvents: 'none',
  zIndex: 4,
  lineHeight: 1,
});

export const FileLabel = styled(Text, {
  name: 'ChessFileLabel',
  flex: 1,
  textAlign: 'center',
  fontSize: 11,
  opacity: 0.4,
  paddingTop: 4,
  fontWeight: '500',
});

export const PlayerCard = styled(XStack, {
  name: 'ChessPlayerCard',
  flexDirection: 'column',
  gap: 8,
  padding: 14,
  borderRadius: 12,
  flex: 1,
  minWidth: 0,
  backdropFilter: 'blur(12px)',
  transition: 'all 0.3s ease',

  variants: {
    $isActive: {
      true: {
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderColor: 'rgba(34, 197, 94, 0.4)',
        borderWidth: 1,
      },
      false: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
      },
    },
  } as const,

  defaultVariants: {
    $isActive: false,
  },
});

export const PlayerAvatar = styled(YStack, {
  name: 'ChessPlayerAvatar',
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const PlayerName = styled(Text, {
  name: 'ChessPlayerName',
  fontSize: 13,
  fontWeight: '700',
  color: '#f8fafc',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const PlayerRating = styled(Text, {
  name: 'ChessPlayerRating',
  fontSize: 11,
  color: 'rgba(148, 163, 184, 0.8)',
});

export const EvalBarContainer = styled(YStack, {
  name: 'ChessEvalBar',
  width: 24,
  height: '100%',
  minHeight: 200,
  borderRadius: 6,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.06)',
  position: 'relative',
  flexShrink: 0,
});

export const ClockContainer = styled(XStack, {
  name: 'ChessClockContainer',
  gap: 8,
  width: '100%',
});

export const ClockFace = styled(YStack, {
  name: 'ChessClockFace',
  flex: 1,
  padding: '8px 12px',
  borderRadius: 8,
  alignItems: 'center',
  transition: 'all 0.3s ease',

  variants: {
    $isActive: {
      true: {
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
      },
      false: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
      },
    },
  } as const,

  defaultVariants: {
    $isActive: false,
  },
});

export const ClockTime = styled(Text, {
  name: 'ChessClockTime',
  fontSize: 18,
  fontWeight: '700',
  color: '#f8fafc',

  variants: {
    $isLow: {
      true: { color: '#eab308' },
    },
    $isCritical: {
      true: { color: '#ef4444' },
    },
  } as const,
});

export const ClockLabel = styled(Text, {
  name: 'ChessClockLabel',
  fontSize: 9,
  fontWeight: '600',
  color: 'rgba(148, 163, 184, 0.6)',
  textTransform: 'uppercase',
  marginTop: 2,
});

export const ModalOverlay = styled(YStack, {
  name: 'ChessModalOverlay',
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
});

export const ModalContent = styled(YStack, {
  name: 'ChessModalContent',
  alignItems: 'center',
  gap: 20,
  padding: 28,
  borderRadius: 16,
  backgroundColor: 'rgba(20, 24, 32, 0.95)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(20px)',
});

export const ModalTitle = styled(Text, {
  name: 'ChessModalTitle',
  fontSize: 18,
  fontWeight: '700',
  color: '#f8fafc',
});

export const PromotionGrid = styled(XStack, {
  name: 'ChessPromotionGrid',
  gap: 12,
  justifyContent: 'center',
});

export const PromotionOption = styled(YStack, {
  name: 'ChessPromotionOption',
  width: 64,
  height: 64,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(167, 139, 250, 0.5)',
    scale: 1.08,
  },
});

export const ModalButton = styled(Text, {
  name: 'ChessModalButton',
  padding: '10px 24px',
  borderRadius: 8,
  backgroundColor: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
  cursor: 'pointer',

  hoverStyle: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
  },
});

export const CancelButton = styled(Text, {
  name: 'ChessCancelButton',
  padding: '8px 20px',
  borderRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(148, 163, 184, 0.8)',
  fontSize: 13,
  fontWeight: '600',
  cursor: 'pointer',
  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
