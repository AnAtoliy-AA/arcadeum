import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams } from '../model/types';
import { useChat } from '../model/useChat';

export default function ChatScreen() {
  const { chatId, userId, receiverId } = useLocalSearchParams<ChatParams>();
  const { messages, onSend, isConnected } = useChat({ chatId, userId, receiverId });

  return (
    <View style={styles.container}>
      <ThemedText>Chats:</ThemedText>
      {isConnected ? (
        <Text>Connected to chat server</Text>
      ) : (
        <Text>Connecting...</Text>
      )}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userId as string }}
        showUserAvatar
        renderUsernameOnMessage
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});