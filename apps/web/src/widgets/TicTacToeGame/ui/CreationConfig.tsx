import { useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import {
  GameSelector,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
  ThemeHeader,
  GameTileItem,
  GameTileContainer,
  ComingSoonBadge,
} from '@/features/games/ui/create/styles';
import { RulesModal } from './RulesModal';
import { useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import {
  BOARD_SIZES,
  WIN_LENGTHS,
  MAX_PLAYERS_BY_BOARD_SIZE,
  type BoardSize,
} from '../types';

interface TicTacToeOptions {
  variant?: string;
  options?: {
    boardSize?: BoardSize;
  };
}

const TIC_TAC_TOE_VARIANTS = [
  {
    id: 'classic',
    emoji: '⭕',
    name: 'games.tic_tac_toe_v1.variants.classic.name',
    description: 'games.tic_tac_toe_v1.variants.classic.description',
    gradient: '',
  },
  {
    id: 'neon',
    emoji: '💜',
    name: 'games.tic_tac_toe_v1.variants.neon.name',
    description: 'games.tic_tac_toe_v1.variants.neon.description',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    id: 'paper',
    emoji: '📝',
    name: 'games.tic_tac_toe_v1.variants.paper.name',
    description: 'games.tic_tac_toe_v1.variants.paper.description',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  {
    id: 'pixel',
    emoji: '👾',
    name: 'games.tic_tac_toe_v1.variants.pixel.name',
    description: 'games.tic_tac_toe_v1.variants.pixel.description',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  {
    id: 'chalkboard',
    emoji: '🪧',
    name: 'games.tic_tac_toe_v1.variants.chalkboard.name',
    description: 'games.tic_tac_toe_v1.variants.chalkboard.description',
    gradient: 'linear-gradient(135deg, #374151, #6b7280)',
  },
  {
    id: 'retro',
    emoji: '🕹️',
    name: 'games.tic_tac_toe_v1.variants.retro.name',
    description: 'games.tic_tac_toe_v1.variants.retro.description',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
] as const;

export default function TicTacToeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<TicTacToeOptions>) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [allowedVariants, setAllowedVariants] = useState<
    CatalogVariant[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const entry = res.games.find((g) => g.gameId === 'tic_tac_toe_v1');
        setAllowedVariants(entry?.variants ?? null);
      })
      .catch(() => {
        if (!cancelled) setAllowedVariants(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleVariants =
    allowedVariants === null
      ? TIC_TAC_TOE_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : TIC_TAC_TOE_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  useEffect(() => {
    if (!options.variant) {
      onChange({ ...options, variant: 'classic' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.variant]);

  const handleUpdate = (updates: Partial<TicTacToeOptions>) => {
    onChange({ ...options, ...updates });
  };

  const currentBoardSize = options.options?.boardSize ?? 3;

  return (
    <>
      <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
        <ThemeHeader>
          <Button
            variant="link"
            size="sm"
            mb="$4"
            type="button"
            color="$accent"
            onClick={() => setShowRules(true)}
            data-testid="view-rules-button"
          >
            📖 {t('games.rules.button') || 'View Game Rules'}
          </Button>
        </ThemeHeader>
        <GameSelector>
          {visibleVariants.map((variant) => {
            const isComingSoon = variant.comingSoon;
            const isDisabled = isComingSoon;
            return (
              <GameTileContainer
                key={variant.id}
                data-testid={`variant-tile-${variant.id}`}
                aria-disabled={isDisabled || undefined}
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled && handleUpdate({ variant: variant.id })
                }
              >
                <GameTileItem
                  active={options.variant === variant.id}
                  disabled={isDisabled}
                >
                  {!isDisabled && (
                    <SelectionIndicator
                      active={options.variant === variant.id}
                    />
                  )}
                  {isDisabled && (
                    <ComingSoonBadge data-testid="coming-soon-badge">
                      {t('games.create.comingSoon') || 'Coming Soon'}
                    </ComingSoonBadge>
                  )}
                  <GameTileIcon
                    background={variant.gradient || undefined}
                    className={variant.gradient ? 'text-gradient' : undefined}
                  >
                    {variant.emoji}
                  </GameTileIcon>
                  <GameTileName>{variant.name}</GameTileName>
                  <GameTileSummary>{variant.description}</GameTileSummary>
                </GameTileItem>
              </GameTileContainer>
            );
          })}
        </GameSelector>
      </Section>

      <Section title={t('games.create.sectionHouseRules')}>
        <YStack gap="$3">
          <YStack gap="$1">
            <Text fontSize="$4" fontWeight="600">
              {t('games.create.tttBoardSize') || 'Board Size'}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {BOARD_SIZES.map((size) => (
                <Button
                  key={size}
                  variant="secondary"
                  size="sm"
                  isActive={currentBoardSize === size}
                  onClick={() =>
                    handleUpdate({
                      options: { ...options.options, boardSize: size },
                    })
                  }
                  data-testid={`board-size-${size}`}
                >
                  {size}×{size}
                </Button>
              ))}
            </XStack>
            <Text fontSize="$3" color="$colorSecondary">
              {t('games.create.tttWinLength', {
                n: String(WIN_LENGTHS[currentBoardSize]),
              }) || `${WIN_LENGTHS[currentBoardSize]} in a row to win`}
            </Text>
            <Text fontSize="$2" color="$colorTertiary">
              {t('games.create.tttMaxPlayers', {
                n: String(MAX_PLAYERS_BY_BOARD_SIZE[currentBoardSize]),
              }) ||
                `Up to ${MAX_PLAYERS_BY_BOARD_SIZE[currentBoardSize]} players`}
            </Text>
          </YStack>
        </YStack>
      </Section>

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        boardSize={currentBoardSize}
        winLength={WIN_LENGTHS[currentBoardSize]}
      />
    </>
  );
}
