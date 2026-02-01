'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gamesApi } from '@/features/games/api';
import {
  PageLayout,
  Container,
  PageTitle,
  Section,
  Button,
  Input,
  TextArea,
  FormGroup,
} from '@/shared/ui';

import { ExpansionId, CARD_VARIANTS, gamesCatalog } from './constants';

import { ExpansionPacksSection } from './ExpansionPacksSection';

import { RulesModal } from '@/widgets/CriticalGame/ui/RulesModal';

import {
  Form,
  GameSelector,
  GameTile,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
  ExpansionGrid,
  ExpansionCheckbox,
  ExpansionLabel,
  ExpansionBadge,
  Row,
  VisibilityToggle,
  ErrorCard,
  ComingSoonBadge,
  RulesTrigger,
  ThemeHeader,
} from './styles';

// Filter out hidden games for display
const visibleGames = gamesCatalog.filter((game) => !game.isHidden);

export function CreateGameRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();

  const initialGameId = useMemo(() => {
    const gameId = searchParams?.get('gameId');
    return gameId && visibleGames.some((g) => g.id === gameId)
      ? gameId
      : visibleGames[0]?.id || '';
  }, [searchParams]);

  const [gameId, setGameId] = useState(initialGameId);
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [notes, setNotes] = useState('');
  const [expansions, setExpansions] = useState<ExpansionId[]>([]);
  const [customCards, setCustomCards] = useState<Record<string, number>>({});
  const [cardVariant, setCardVariant] = useState<string>('cyberpunk');
  const [allowActionCardCombos, setAllowActionCardCombos] = useState(false);
  const [idleTimerEnabled, setIdleTimerEnabled] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const {
    mutate: createRoom,
    isPending: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: async () => {
      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;

      return gamesApi.createRoom(
        {
          gameId,
          name: name.trim(),
          visibility,
          maxPlayers: maxPlayersNum,
          notes: notes.trim() || undefined,
          gameOptions:
            gameId === 'critical_v1'
              ? {
                  ...(expansions.length > 0 ? { expansions } : {}),
                  ...(Object.keys(customCards).length > 0
                    ? { customCards }
                    : {}),
                  cardVariant,
                  allowActionCardCombos,
                  idleTimerEnabled,
                }
              : undefined,
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    onSuccess: (data) => {
      // For private rooms, include invite code so creator auto-joins
      const roomUrl = data.room.inviteCode
        ? `/games/rooms/${data.room.id}?inviteCode=${encodeURIComponent(data.room.inviteCode)}`
        : `/games/rooms/${data.room.id}`;
      router.push(roomUrl);
    },
  });

  const error =
    mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? 'Failed to create room'
        : null;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!snapshot.accessToken) {
        return;
      }

      if (!name.trim()) {
        return;
      }

      const maxPlayersNum = maxPlayers.trim() ? Number(maxPlayers) : undefined;
      if (
        maxPlayersNum !== undefined &&
        (isNaN(maxPlayersNum) || maxPlayersNum < 2)
      ) {
        return;
      }

      createRoom();
    },
    [snapshot.accessToken, name, maxPlayers, createRoom],
  );

  return (
    <PageLayout>
      <Container size="md">
        <PageTitle size="lg">
          {t('games.create.title') || 'Create Game Room'}
        </PageTitle>

        <Form onSubmit={handleSubmit}>
          <Section title={t('games.create.sectionGame') || 'Select Game'}>
            <GameSelector>
              {visibleGames.map((game) => (
                <GameTile
                  key={game.id}
                  as="button"
                  type="button"
                  $active={gameId === game.id}
                  disabled={!game.isPlayable}
                  onClick={() => game.isPlayable && setGameId(game.id)}
                >
                  <GameTileName>{game.name}</GameTileName>
                  <GameTileSummary>{game.summary}</GameTileSummary>
                </GameTile>
              ))}
            </GameSelector>
          </Section>

          {gameId === 'critical_v1' && (
            <ExpansionPacksSection
              expansions={expansions}
              customCards={customCards}
              onExpansionsChange={setExpansions}
              onCustomCardsChange={setCustomCards}
            />
          )}

          {gameId === 'critical_v1' && (
            <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
              <ThemeHeader>
                <RulesTrigger type="button" onClick={() => setShowRules(true)}>
                  📖 {t('games.rules.button') || 'View Game Rules'}
                </RulesTrigger>
              </ThemeHeader>
              <GameSelector>
                {CARD_VARIANTS.map((variant) => (
                  <GameTile
                    key={variant.id}
                    as="button"
                    type="button"
                    $active={cardVariant === variant.id}
                    disabled={variant.disabled}
                    onClick={() =>
                      !variant.disabled && setCardVariant(variant.id)
                    }
                  >
                    {!variant.disabled && <SelectionIndicator />}
                    {variant.disabled && (
                      <ComingSoonBadge>
                        {t('games.create.comingSoon') || 'Coming Soon'}
                      </ComingSoonBadge>
                    )}
                    <GameTileIcon $gradient={variant.gradient}>
                      {variant.emoji}
                    </GameTileIcon>
                    <GameTileName>{variant.name}</GameTileName>
                    <GameTileSummary>{variant.description}</GameTileSummary>
                  </GameTile>
                ))}
              </GameSelector>
            </Section>
          )}

          {gameId === 'critical_v1' && (
            <Section title={t('games.create.sectionHouseRules')}>
              <ExpansionGrid>
                <ExpansionCheckbox>
                  <input
                    type="checkbox"
                    checked={allowActionCardCombos}
                    onChange={() =>
                      setAllowActionCardCombos(!allowActionCardCombos)
                    }
                  />
                  <ExpansionLabel>
                    {t('games.create.houseRuleActionCardCombos')}
                  </ExpansionLabel>
                  <ExpansionBadge>
                    {t('games.create.houseRuleActionCardCombosHint')}
                  </ExpansionBadge>
                </ExpansionCheckbox>

                <ExpansionCheckbox>
                  <input
                    type="checkbox"
                    checked={idleTimerEnabled}
                    onChange={() => setIdleTimerEnabled(!idleTimerEnabled)}
                  />
                  <ExpansionLabel>
                    {t('games.create.houseRuleIdleTimer') ||
                      'Idle Timer Autoplay'}
                  </ExpansionLabel>
                  <ExpansionBadge>
                    {t('games.create.houseRuleIdleTimerHint', {
                      seconds: String(IDLE_TIMER_DURATION_SEC),
                    }) || 'Automated play after 15s'}
                  </ExpansionBadge>
                </ExpansionCheckbox>
              </ExpansionGrid>
            </Section>
          )}

          <Section title={t('games.create.sectionDetails') || 'Room Details'}>
            <FormGroup
              label={t('games.create.fieldName') || 'Room Name'}
              htmlFor="room-name"
              required
            >
              <Input
                id="room-name"
                type="text"
                placeholder={
                  t('games.create.namePlaceholder') || 'Enter room name'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                fullWidth
              />
            </FormGroup>

            <Row>
              <FormGroup
                label={
                  t('games.create.fieldMaxPlayers') || 'Max Players (optional)'
                }
                htmlFor="max-players"
              >
                <Input
                  id="max-players"
                  type="number"
                  min="2"
                  placeholder={t('games.create.autoPlaceholder') || 'Auto'}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  aria-label={
                    t('games.create.maxPlayersAria') ||
                    'Maximum number of players'
                  }
                  fullWidth
                />
              </FormGroup>

              <FormGroup
                label={t('games.create.fieldVisibility') || 'Visibility'}
                htmlFor="visibility"
              >
                <VisibilityToggle
                  id="visibility"
                  type="button"
                  variant="secondary"
                  $isPublic={visibility === 'public'}
                  onClick={() =>
                    setVisibility(
                      visibility === 'public' ? 'private' : 'public',
                    )
                  }
                  aria-pressed={visibility === 'public'}
                  aria-label={
                    visibility === 'public' ? 'Public room' : 'Private room'
                  }
                  fullWidth
                >
                  {visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </VisibilityToggle>
              </FormGroup>
            </Row>

            <FormGroup
              label={t('games.create.fieldNotes') || 'Notes (optional)'}
              htmlFor="notes"
            >
              <TextArea
                id="notes"
                placeholder={
                  t('games.create.notesPlaceholder') || 'Add notes...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                aria-label={
                  t('games.create.notesAria') || 'Additional notes for the room'
                }
                fullWidth
              />
            </FormGroup>
          </Section>

          {error && (
            <ErrorCard variant="outlined" padding="sm">
              {error}
            </ErrorCard>
          )}

          {!snapshot.accessToken && (
            <ErrorCard
              variant="outlined"
              padding="sm"
              style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div>
                {t('games.create.loginRequired') ||
                  'You need to be logged in to create a room.'}
              </div>
              <Button
                type="button"
                onClick={() => router.push('/auth')}
                size="sm"
              >
                {t('games.create.loginButton') || 'Login'}
              </Button>
            </ErrorCard>
          )}

          <Button
            type="submit"
            disabled={loading || !snapshot.accessToken}
            size="lg"
            fullWidth
          >
            {loading
              ? t('games.create.submitCreating') || 'Creating...'
              : t('games.common.createRoom') || 'Create Room'}
          </Button>
        </Form>
      </Container>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        currentVariant={cardVariant}
        isFastMode={idleTimerEnabled}
        isPrivate={visibility === 'private'}
        t={t}
      />
    </PageLayout>
  );
}
