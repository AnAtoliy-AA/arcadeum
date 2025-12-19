import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { ExplodingCatsLogEntry, LogVisibility } from '../types';
import type { ExplodingCatsTableStyles } from '../styles';

interface GameLogsProps {
  logs: ExplodingCatsLogEntry[];
  isCurrentUserPlayer: boolean;
  messageDraft: string;
  onMessageChange: (text: string) => void;
  messageVisibility: LogVisibility;
  onVisibilityToggle: () => void;
  historySending: boolean;
  canSendHistoryMessage: boolean;
  onSend: () => void;
  formatLogMessage: (message: string) => string;
  logsScrollRef: React.RefObject<ScrollView | null>;
  currentUserId: string | null;
  playerNameMap: Map<string, string>;
  styles: ExplodingCatsTableStyles;
}

export function GameLogs({
  logs,
  isCurrentUserPlayer,
  messageDraft,
  onMessageChange,
  messageVisibility,
  onVisibilityToggle,
  historySending,
  canSendHistoryMessage,
  onSend,
  formatLogMessage,
  logsScrollRef,
  currentUserId,
  playerNameMap,
  styles,
}: GameLogsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.logsSection}>
      <View style={styles.logsHeader}>
        <IconSymbol
          name="list.bullet.rectangle"
          size={16}
          color={styles.logsHeaderText.color as string}
        />
        <ThemedText style={styles.logsHeaderText}>
          {t('games.table.logs.title')}
        </ThemedText>
      </View>
      {isCurrentUserPlayer ? (
        <>
          <View style={styles.logsComposer}>
            <TextInput
              style={styles.logsInput}
              value={messageDraft}
              onChangeText={onMessageChange}
              placeholder={t('games.table.logs.composerPlaceholder')}
              placeholderTextColor={styles.logsInputPlaceholder.color as string}
              multiline
              maxLength={500}
              editable={!historySending}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.logsSendButton,
                !canSendHistoryMessage || historySending
                  ? styles.logsSendButtonDisabled
                  : null,
              ]}
              onPress={onSend}
              disabled={!canSendHistoryMessage || historySending}
            >
              {historySending ? (
                <ActivityIndicator
                  size="small"
                  color={styles.logsSendButtonText.color as string}
                />
              ) : (
                <>
                  <IconSymbol
                    name="paperplane.fill"
                    size={14}
                    color={styles.logsSendButtonText.color as string}
                  />
                  <ThemedText style={styles.logsSendButtonText}>
                    {t('games.table.logs.send')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.logsCheckboxRow}
            onPress={onVisibilityToggle}
          >
            <View
              style={[
                styles.checkboxBox,
                messageVisibility === 'players'
                  ? styles.checkboxBoxChecked
                  : null,
              ]}
            >
              {messageVisibility === 'players' ? (
                <IconSymbol
                  name="checkmark"
                  size={12}
                  color={styles.checkboxCheck.color as string}
                />
              ) : null}
            </View>
            <View style={styles.checkboxCopy}>
              <ThemedText style={styles.checkboxLabel}>
                {t(
                  messageVisibility === 'players'
                    ? 'games.table.logs.checkboxLabelPlayers'
                    : 'games.table.logs.checkboxLabelAll',
                )}
              </ThemedText>
              <ThemedText style={styles.checkboxHint}>
                {t('games.table.logs.checkboxHint')}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </>
      ) : null}
      {logs.length ? (
        <ScrollView
          style={styles.logsList}
          ref={logsScrollRef}
          contentContainerStyle={styles.logsListContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {logs.map((log) => {
            const timestamp = new Date(log.createdAt);
            const timeLabel = Number.isNaN(timestamp.getTime())
              ? '--:--'
              : timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
            const isMessage = log.type === 'message';
            let senderDisplayName: string | null = null;
            if (isMessage) {
              if (log.senderName) {
                senderDisplayName = log.senderName;
              } else if (log.senderId) {
                senderDisplayName =
                  playerNameMap.get(log.senderId) ??
                  (currentUserId && log.senderId === currentUserId
                    ? t('games.table.logs.you')
                    : null);
              }
              if (!senderDisplayName) {
                senderDisplayName = t('games.table.logs.unknownSender');
              }
            }

            return (
              <View key={log.id} style={styles.logRow}>
                <ThemedText style={styles.logTimestamp}>{timeLabel}</ThemedText>
                {isMessage ? (
                  <View style={styles.logMessageColumn}>
                    <View style={styles.logMessageHeader}>
                      <ThemedText
                        style={styles.logMessageSender}
                        numberOfLines={1}
                      >
                        {senderDisplayName}
                      </ThemedText>
                      {log.scope === 'players' ? (
                        <View style={styles.logScopeBadge}>
                          <ThemedText style={styles.logScopeBadgeText}>
                            {t('games.table.logs.playersOnlyTag')}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                    <ThemedText style={styles.logMessageText}>
                      {log.message}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.logMessage}>
                    {formatLogMessage(log.message)}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ThemedText style={styles.logsEmptyText}>
          {t('games.table.logs.empty')}
        </ThemedText>
      )}
    </View>
  );
}
