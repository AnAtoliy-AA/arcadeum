import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import type { GameRoomSummary, GameSessionSummary } from '../api/gamesApi';
import { useTranslation } from '@/lib/i18n';

// Texas Hold'em types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type BettingRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in'
  | 'waiting';

export interface TexasHoldemPlayerState {
  playerId: string;
  chips: number;
  hand: Card[];
  currentBet: number;
  totalBet: number;
  folded: boolean;
  allIn: boolean;
  lastAction?: PlayerAction;
}

export interface TexasHoldemLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: 'all' | 'players';
}

export interface TexasHoldemSnapshot {
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  playerOrder: string[];
  dealerIndex: number;
  currentTurnIndex: number;
  bettingRound: BettingRound;
  currentBet: number;
  players: TexasHoldemPlayerState[];
  logs: TexasHoldemLogEntry[];
  lastToRaise: number | null;
  roundComplete: boolean;
}

interface TexasHoldemTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy:
    | 'draw'
    | 'fold'
    | 'check'
    | 'call'
    | 'raise'
    | 'all-in'
    | null;
  startBusy: boolean;
  isHost: boolean;
  onStart: (startingChips?: number) => void;
  onAction: (
    action: 'fold' | 'check' | 'call' | 'raise',
    raiseAmount?: number,
  ) => void;
  onPostHistoryNote: (message: string, scope: 'all' | 'players') => void;
  fullScreen?: boolean;
}

function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
}

function getSuitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1f2937';
}

const TexasHoldemTable: React.FC<TexasHoldemTableProps> = ({
  room,
  session,
  currentUserId,
  actionBusy,
  startBusy,
  isHost,
  onStart,
  onAction,
  fullScreen = false,
}) => {
  const { t } = useTranslation();
  const [raiseAmount, setRaiseAmount] = useState<string>('20');

  const snapshot = useMemo(() => {
    if (!session?.state) return null;
    const stateData = session.state as any;
    return stateData?.snapshot as TexasHoldemSnapshot | undefined;
  }, [session]);

  const currentPlayer = useMemo(() => {
    if (!snapshot || !currentUserId) return null;
    return snapshot.players.find((p) => p.playerId === currentUserId);
  }, [snapshot, currentUserId]);

  const isCurrentTurn = useMemo(() => {
    if (!snapshot || !currentUserId) return false;
    return snapshot.playerOrder[snapshot.currentTurnIndex] === currentUserId;
  }, [snapshot, currentUserId]);

  const canAct = useMemo(() => {
    return (
      isCurrentTurn &&
      currentPlayer &&
      !currentPlayer.folded &&
      !currentPlayer.allIn
    );
  }, [isCurrentTurn, currentPlayer]);

  const callAmount = useMemo(() => {
    if (!currentPlayer || !snapshot) return 0;
    return snapshot.currentBet - currentPlayer.currentBet;
  }, [currentPlayer, snapshot]);

  const handleRaise = useCallback(() => {
    const amount = parseInt(raiseAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      onAction('raise', amount);
    }
  }, [raiseAmount, onAction]);

  if (!session || session.status === 'waiting') {
    return (
      <View style={styles.container}>
        <View style={styles.pokerTable}>
          <Text style={styles.potText}>Waiting for game to start...</Text>
          {isHost && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => onStart(1000)}
              disabled={startBusy}
            >
              <Text style={styles.buttonText}>
                {startBusy ? 'Starting...' : 'Start Texas Hold\'em'}
              </Text>
            </TouchableOpacity>
          )}
          {!isHost && (
            <Text style={styles.infoText}>
              Waiting for host to start the game...
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (!snapshot) {
    return (
      <View style={styles.container}>
        <View style={styles.pokerTable}>
          <Text style={styles.potText}>Loading game state...</Text>
        </View>
      </View>
    );
  }

  const renderCard = (card: Card, index: number) => {
    const suitColor = getSuitColor(card.suit);
    return (
      <View key={`${card.suit}-${card.rank}-${index}`} style={styles.card}>
        <Text style={[styles.cardRank, { color: suitColor }]}>
          {card.rank}
        </Text>
        <Text style={[styles.cardSuit, { color: suitColor }]}>
          {getSuitSymbol(card.suit)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Poker Table */}
      <View style={styles.pokerTable}>
        {/* Pot Info */}
        <View style={styles.potContainer}>
          <Text style={styles.potText}>
            Pot: ${snapshot.pot} | Round: {snapshot.bettingRound}
          </Text>
        </View>

        {/* Community Cards */}
        {snapshot.communityCards.length > 0 && (
          <View style={styles.communityCards}>
            {snapshot.communityCards.map((card, idx) => renderCard(card, idx))}
          </View>
        )}

        {/* Current Bet */}
        {snapshot.currentBet > 0 && (
          <Text style={styles.infoText}>Current Bet: ${snapshot.currentBet}</Text>
        )}
      </View>

      {/* Players */}
      <View style={styles.playersContainer}>
        {snapshot.players.map((player, idx) => {
          const isCurrent = player.playerId === currentUserId;
          const isTurn =
            snapshot.playerOrder[snapshot.currentTurnIndex] === player.playerId;
          const isDealer =
            snapshot.playerOrder[snapshot.dealerIndex] === player.playerId;

          return (
            <View
              key={player.playerId}
              style={[
                styles.playerCard,
                isCurrent && styles.currentPlayerCard,
                isTurn && styles.turnPlayerCard,
              ]}
            >
              <View style={styles.playerHeader}>
                <Text style={styles.playerName}>
                  {player.playerId} {isDealer && '🎯'}
                </Text>
                {player.folded && (
                  <View style={[styles.badge, styles.foldedBadge]}>
                    <Text style={styles.badgeText}>Folded</Text>
                  </View>
                )}
                {player.allIn && (
                  <View style={[styles.badge, styles.allInBadge]}>
                    <Text style={styles.badgeText}>All-In</Text>
                  </View>
                )}
              </View>

              <Text style={styles.playerInfo}>Chips: ${player.chips}</Text>
              <Text style={styles.playerInfo}>Bet: ${player.currentBet}</Text>

              {/* Player's hand (only show to current user) */}
              {isCurrent && player.hand.length > 0 && (
                <View style={styles.playerHand}>
                  {player.hand.map((card, idx) => renderCard(card, idx))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Controls */}
      {canAct && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={() => onAction('fold')}
            disabled={actionBusy === 'fold'}
          >
            <Text style={styles.buttonText}>
              {actionBusy === 'fold' ? 'Folding...' : 'Fold'}
            </Text>
          </TouchableOpacity>

          {callAmount === 0 ? (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => onAction('check')}
              disabled={actionBusy === 'check'}
            >
              <Text style={styles.buttonText}>
                {actionBusy === 'check' ? 'Checking...' : 'Check'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => onAction('call')}
              disabled={actionBusy === 'call'}
            >
              <Text style={styles.buttonText}>
                {actionBusy === 'call' ? 'Calling...' : `Call $${callAmount}`}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.raiseContainer}>
            <TextInput
              style={styles.raiseInput}
              value={raiseAmount}
              onChangeText={setRaiseAmount}
              keyboardType="numeric"
              placeholder="Raise amount"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleRaise}
              disabled={actionBusy === 'raise'}
            >
              <Text style={styles.buttonText}>
                {actionBusy === 'raise' ? 'Raising...' : `Raise`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!canAct && currentPlayer && !currentPlayer.folded && (
        <Text style={styles.infoText}>
          {isCurrentTurn
            ? 'Waiting for your action...'
            : 'Waiting for other players...'}
        </Text>
      )}

      {session.status === 'completed' && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  pokerTable: {
    backgroundColor: '#0f5132',
    borderRadius: 100,
    padding: 20,
    margin: 16,
    borderWidth: 8,
    borderColor: '#8b4513',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  potText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  communityCards: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  card: {
    width: 50,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardRank: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSuit: {
    fontSize: 16,
  },
  playersContainer: {
    padding: 16,
    gap: 12,
  },
  playerCard: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  currentPlayerCard: {
    backgroundColor: '#3b82f6',
  },
  turnPlayerCard: {
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foldedBadge: {
    backgroundColor: '#dc2626',
  },
  allInBadge: {
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  playerInfo: {
    color: '#e5e7eb',
    fontSize: 14,
    marginTop: 4,
  },
  playerHand: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  controls: {
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    margin: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  raiseContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  raiseInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  infoText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    padding: 16,
  },
  gameOverContainer: {
    backgroundColor: '#10b981',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameOverText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TexasHoldemTable;
