import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams } from '../model/types';
import { useChat } from '../model/useChat';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';

export default function ChatScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<ChatParams>();
  const { tokens } = useSessionTokens();
  const rawChatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
  const rawReceiverIds = params.receiverIds;
  const conversationTitle = Array.isArray(params.title) ? params.title[0] : params.title;

  const currentUserId = tokens.userId ?? '';
  const currentUsername = tokens.username ?? tokens.email ?? null;
  const giftedUserId = currentUserId || 'local-user';
  const giftedUserName = currentUsername ?? giftedUserId;

  const { messages, onSend, isConnected } = useChat({
    chatId: rawChatId ?? '',
    currentUserId,
    currentUsername,
    receiverIds: rawReceiverIds,
  });
  const { shouldBlock } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: true,
  });

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!rawChatId) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom', 'left', 'right']}>
        <ThemedText style={styles.statusText}>Chat not found</ThemedText>
      </SafeAreaView>
    );
  }

  if (!currentUserId) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom', 'left', 'right']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusCircle,
            { backgroundColor: isConnected ? styles.statusCircleConnected.backgroundColor : styles.statusCircleDisconnected.backgroundColor },
          ]}
        />
        <ThemedText style={styles.statusText}>
          {isConnected ? 'Connected to chat server' : 'Connecting...'}
        </ThemedText>
      </View>
      {conversationTitle && (
        <ThemedText style={styles.chatTitle} numberOfLines={2}>
          {conversationTitle}
        </ThemedText>
      )}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: giftedUserId,
          name: giftedUserName,
        }}
        showUserAvatar
        renderUsernameOnMessage
      />
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      marginLeft: 12,
    },
    statusCircle: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    statusCircleConnected: {
      backgroundColor: palette.statusConnected,
    },
    statusCircleDisconnected: {
      backgroundColor: palette.statusDisconnected,
    },
    statusText: {
      fontSize: 16,
      color: palette.text,
    },
    chatTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
  });
}

