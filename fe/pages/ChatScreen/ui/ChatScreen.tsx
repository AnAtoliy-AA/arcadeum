import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams } from '../model/types';
import { useChat } from '../model/useChat';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';

export default function ChatScreen() {
  const styles = useThemedStyles(createStyles);
  const { chatId, userId, receiverIds } = useLocalSearchParams<ChatParams>();
  const { messages, onSend, isConnected } = useChat({ chatId, userId, receiverIds });
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
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userId as string }}
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
  });
}

