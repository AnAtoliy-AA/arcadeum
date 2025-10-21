import React, { useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams } from '../model/types';
import { useChat } from '../model/useChat';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';

export default function ChatScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<ChatParams>();
  const { tokens } = useSessionTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chatListRoute = '/(tabs)/chats' as const satisfies Href;
  const homeRoute = '/(tabs)' as const satisfies Href;
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
  const { t } = useTranslation();

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: chatListRoute });
    }
  }, [router, chatListRoute]);

  const handleGoHome = useCallback(() => {
    router.replace({ pathname: homeRoute });
  }, [router, homeRoute]);

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom }]}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!rawChatId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom }]}>
          <ThemedText style={styles.statusText}>{t('chat.notFound')}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUserId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom }]}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navButton} onPress={handleGoBack}>
            <ThemedText style={styles.navButtonText}>{t('chat.nav.backToChats')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleGoHome}>
            <ThemedText style={styles.navButtonText}>{t('chat.nav.goHome')}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusCircle,
              {
                backgroundColor: isConnected
                  ? styles.statusCircleConnected.backgroundColor
                  : styles.statusCircleDisconnected.backgroundColor,
              },
            ]}
          />
          <ThemedText style={styles.statusText}>
            {isConnected ? t('chat.status.connected') : t('chat.status.connecting')}
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
      </View>
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
      paddingTop: 12,
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
      paddingTop: 12,
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
    },
    navButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: palette.tint,
    },
    navButtonText: {
      color: palette.background,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

