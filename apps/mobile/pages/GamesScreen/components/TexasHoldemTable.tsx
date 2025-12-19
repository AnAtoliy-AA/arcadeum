import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { GameRoomSummary, GameSessionSummary } from '../api/gamesApi';
import { useTexasHoldemGame } from './TexasHoldem/hooks/useTexasHoldemGame';
import Player from './TexasHoldem/components/Player';
import Controls from './TexasHoldem/components/Controls';
import CommunityCards from './TexasHoldem/components/CommunityCards';
import PotInfo from './TexasHoldem/components/PotInfo';
import { useTranslation } from '@/lib/i18n';

interface TexasHoldemTableProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  actionBusy: 'draw' | 'fold' | 'check' | 'call' | 'raise' | 'all-in' | null;
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
  const { snapshot, currentPlayer, isCurrentTurn, canAct, callAmount } =
    useTexasHoldemGame(session, currentUserId);

  if (!session || session.status === 'waiting') {
    return (
      <View style={styles.container}>
        <View style={styles.pokerTable}>
          <Text style={styles.potText}>
            {t('games.texasHoldem.waitingForStart')}
          </Text>
          {isHost && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => onStart(1000)}
              disabled={startBusy}
            >
              <Text style={styles.buttonText}>
                {startBusy
                  ? t('games.texasHoldem.starting')
                  : t('games.texasHoldem.start')}
              </Text>
            </TouchableOpacity>
          )}
          {!isHost && (
            <Text style={styles.infoText}>
              {t('games.texasHoldem.waitingForHost')}
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
          <Text style={styles.potText}>{t('games.texasHoldem.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Poker Table */}
      <View style={styles.pokerTable}>
        <PotInfo
          pot={snapshot.pot}
          bettingRound={snapshot.bettingRound}
          currentBet={snapshot.currentBet}
        />
        <CommunityCards cards={snapshot.communityCards} />
      </View>

      {/* Players */}
      <View style={styles.playersContainer}>
        {snapshot.players.map((player) => {
          const isCurrent = player.playerId === currentUserId;
          const isTurn =
            snapshot.playerOrder[snapshot.currentTurnIndex] === player.playerId;
          const isDealer =
            snapshot.playerOrder[snapshot.dealerIndex] === player.playerId;

          return (
            <Player
              key={player.playerId}
              player={player}
              isCurrent={isCurrent}
              isTurn={isTurn}
              isDealer={isDealer}
            />
          );
        })}
      </View>

      {/* Controls */}
      {canAct && (
        <Controls
          actionBusy={actionBusy}
          callAmount={callAmount}
          onAction={onAction}
        />
      )}

      {!canAct && currentPlayer && !currentPlayer.folded && (
        <Text style={styles.infoText}>
          {isCurrentTurn
            ? t('games.texasHoldem.waitingForAction')
            : t('games.texasHoldem.waitingForOthers')}
        </Text>
      )}

      {session.status === 'completed' && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>
            {t('games.texasHoldem.gameOver')}
          </Text>
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
  potText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playersContainer: {
    padding: 16,
    gap: 12,
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
