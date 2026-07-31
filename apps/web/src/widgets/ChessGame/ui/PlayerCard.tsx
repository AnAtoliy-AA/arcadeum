'use client';

import { XStack, YStack, Text } from 'tamagui';
import {
  PlayerCard as PlayerCardStyled,
  PlayerAvatar,
  PlayerName,
  PlayerRating,
} from './styles';

interface PlayerCardProps {
  name: string;
  rating?: number;
  color: 'white' | 'black';
  $isActive: boolean;
  capturedPieces?: { type: string; color: string }[];
  mainTime?: string;
  incrTime?: string;
}

const KING_SYMBOLS = { white: '♔', black: '♚' } as const;

const PIECE_SYMBOLS: Record<string, string> = {
  pawn: '♟',
  knight: '♞',
  bishop: '♝',
  rook: '♜',
  queen: '♛',
  king: '♚',
};

export function PlayerCard({
  name,
  rating,
  color,
  $isActive,
  capturedPieces = [],
  mainTime = '--:--',
  incrTime = '+0',
}: PlayerCardProps) {
  return (
    <PlayerCardStyled $isActive={$isActive}>
      <XStack gap={12} alignItems="center">
        <PlayerAvatar
          background={
            color === 'white'
              ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
              : 'linear-gradient(135deg, #475569, #1e293b)'
          }
          borderWidth={2}
          borderColor={
            $isActive ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.1)'
          }
        >
          <Text fontSize={18} color={color === 'white' ? '#1e293b' : '#f8fafc'}>
            {KING_SYMBOLS[color]}
          </Text>
        </PlayerAvatar>
        <YStack flex={1} minWidth={0}>
          <PlayerName>{name}</PlayerName>
          {rating != null && <PlayerRating>Rating: {rating}</PlayerRating>}
        </YStack>
      </XStack>

      {capturedPieces.length > 0 && (
        <XStack gap={2} marginTop={8} opacity={0.5}>
          {capturedPieces.map((p, i) => (
            <Text key={i} fontSize={11}>
              {PIECE_SYMBOLS[p.type] ?? '♟'}
            </Text>
          ))}
        </XStack>
      )}

      <XStack gap={8} marginTop={10}>
        <YStack
          flex={1}
          padding="8px 12px"
          borderRadius={8}
          backgroundColor="rgba(255, 255, 255, 0.03)"
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.08)"
          alignItems="center"
        >
          <Text fontSize={20} fontWeight="700" color="#f8fafc">
            {mainTime}
          </Text>
          <Text
            fontSize={9}
            fontWeight="600"
            color="rgba(148, 163, 184, 0.6)"
            textTransform="uppercase"
            marginTop={2}
          >
            MAIN
          </Text>
        </YStack>
        <YStack
          flex={1}
          padding="8px 12px"
          borderRadius={8}
          backgroundColor="rgba(255, 255, 255, 0.03)"
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.08)"
          alignItems="center"
        >
          <Text fontSize={20} fontWeight="700" color="#f8fafc">
            {incrTime}
          </Text>
          <Text
            fontSize={9}
            fontWeight="600"
            color="rgba(148, 163, 184, 0.6)"
            textTransform="uppercase"
            marginTop={2}
          >
            INCR
          </Text>
        </YStack>
      </XStack>
    </PlayerCardStyled>
  );
}
