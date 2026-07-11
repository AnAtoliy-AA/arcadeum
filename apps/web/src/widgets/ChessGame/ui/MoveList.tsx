'use client';

import { useState, useCallback } from 'react';
import { XStack, YStack, Text, ScrollView } from 'tamagui';
import type { ChessClientState } from '../types';
import { generateMoveList, generatePGN } from '../lib/pgn';

interface MoveListProps {
  state: ChessClientState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any, params?: Record<string, string | number>) => string;
}

export function MoveList({ state, t }: MoveListProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const moves = generateMoveList(state);

  const pairs: { white: string; black: string; num: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i] ?? '',
      black: moves[i + 1] ?? '',
    });
  }

  const visiblePairs = expanded ? pairs : pairs.slice(-6);

  const handleCopyPGN = useCallback(() => {
    const pgn = generatePGN(state);
    navigator.clipboard.writeText(pgn).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state]);

  if (moves.length === 0) return null;

  return (
    <YStack gap="$1" mt="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$2" opacity={0.5}>
          {t('chess_v1.actions.moveList') ?? 'Move List'}
        </Text>
        <XStack gap="$2">
          {pairs.length > 6 && (
            <Text
              fontSize="$2"
              opacity={0.6}
              cursor="pointer"
              hoverStyle={{ opacity: 1 }}
              onPress={() => setExpanded(!expanded)}
            >
              {expanded
                ? t('games.chess_v1.status.collapse')
                : t('games.chess_v1.status.showAll', { count: pairs.length })}
            </Text>
          )}
          <Text
            fontSize="$2"
            opacity={0.6}
            cursor="pointer"
            hoverStyle={{ opacity: 1 }}
            onPress={handleCopyPGN}
          >
            {copied
              ? t('games.chess_v1.status.copied')
              : t('games.chess_v1.actions.copyPGN')}
          </Text>
        </XStack>
      </XStack>
      <ScrollView maxHeight={200}>
        <YStack>
          {visiblePairs.map((pair) => (
            <XStack key={pair.num} gap="$2" alignItems="center">
              <Text fontSize="$2" opacity={0.4} width={30}>
                {pair.num}.
              </Text>
              <Text fontSize="$2" width={60}>
                {pair.white}
              </Text>
              <Text fontSize="$2" opacity={0.6} width={60}>
                {pair.black}
              </Text>
            </XStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
