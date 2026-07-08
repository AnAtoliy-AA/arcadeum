'use client';

import { memo } from 'react';
import { YStack, Text, Button, XStack } from 'tamagui';
import { PIECE_SYMBOLS } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RulesModalImpl({ open, onClose }: RulesModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <YStack
        gap="$4"
        padding="$5"
        borderRadius={16}
        backgroundColor="$background"
        alignItems="center"
        maxWidth={480}
        width="90%"
        maxHeight="80vh"
        style={{ overflow: 'auto' }}
      >
        <Text fontSize="$6" fontWeight="700">
          Chess Rules
        </Text>
        <YStack gap="$3" width="100%">
          <Text fontSize="$4" fontWeight="600">
            Objective
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            Checkmate your opponent&apos;s king. The king is in checkmate when
            it is in check and there is no legal move to escape.
          </Text>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            Pieces
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {(
              ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const
            ).map((type) => (
              <XStack
                key={type}
                gap="$1"
                alignItems="center"
                padding="$1"
                paddingHorizontal="$2"
                borderRadius={8}
                backgroundColor="rgba(255,255,255,0.05)"
              >
                <Text fontSize={20}>{PIECE_SYMBOLS[type].white}</Text>
                <Text fontSize="$2" textTransform="capitalize">
                  {type}
                </Text>
              </XStack>
            ))}
          </XStack>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            Special Moves
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">Castling:</Text> King moves two squares
            toward a rook, and the rook jumps over the king. Must be
            unobstructed, king not in check, and neither piece moved.
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">En passant:</Text> A pawn can capture an
            opposing pawn that just moved two squares forward, as if it moved
            only one.
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">Promotion:</Text> A pawn reaching the
            opposite end promotes to a queen, rook, bishop, or knight.
          </Text>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            Draw Conditions
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • Stalemate (no legal moves, not in check)
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • 50-move rule (50 moves without captures or pawn moves)
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • Threefold repetition
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • Insufficient material
          </Text>
        </YStack>
        <Button size="$3" onPress={onClose} mt="$2">
          Got it
        </Button>
      </YStack>
    </div>
  );
}

export const RulesModal = memo(RulesModalImpl);
