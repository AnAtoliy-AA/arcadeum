import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams } from '../model/types';
import { useChat } from '../model/useChat';
import { Colors } from '@/constants/Colors';
import { styles } from './ChatScreen.styles';

export default function ChatScreen() {
  const { chatId, userId, receiverId } = useLocalSearchParams<ChatParams>();
  const { messages, onSend, isConnected } = useChat({ chatId, userId, receiverId });
  const colorScheme = useColorScheme() ?? 'light';

  const statusColor = isConnected
    ? Colors[colorScheme].statusConnected
    : Colors[colorScheme].statusDisconnected;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusCircle,
            {
              backgroundColor: statusColor,
            },
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
