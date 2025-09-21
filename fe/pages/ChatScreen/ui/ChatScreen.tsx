import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { View, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { socket, useSocket } from '@/hooks/useSocket';
import uuid from 'react-native-uuid';
import { ThemedText } from '@/components/ThemedText';
import { ChatParams, Message } from '../model/types';

export default function ChatScreen() {
  const { chatId, userId, receiverId } = useLocalSearchParams<ChatParams>();
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    socket.emit('joinChat', { chatId, users: [userId, receiverId] });
  }, [chatId, userId, receiverId]);

  useSocket('chatMessages', (loadedMessages: Message[]) => {
    const formattedMessages: IMessage[] = loadedMessages.map((msg) => ({
      _id: msg._id,
      text: msg.content,
      createdAt: new Date(msg.timestamp),
      user: {
        _id: msg.senderId,
        name: msg.senderId,
      } as User,
    }));
    setMessages(formattedMessages);
  });

  // On send
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      newMessages.forEach((message) => {
        const tempId = uuid.v4();
        const optimisticMessage = {
          _id: tempId,
          text: message.text,
          createdAt: new Date(),
          user: { _id: userId },
          pending: true,
        };
        setMessages((prev) => GiftedChat.append(prev, [optimisticMessage]));

        socket.emit('sendMessage', {
          chatId,
          senderId: userId,
          receiverId,
          content: message.text,
          timestamp: new Date(),
        });
      });
    },
    [chatId, userId, receiverId]
  );

  // On socket confirmation
  useSocket('message', (confirmedMessage) => {
    setMessages((prev) => {
      // If optimistic message exists, replace it with confirmed message
      const hasOptimistic = prev.some(
        (msg) =>
          msg.pending &&
          msg.text === confirmedMessage.content &&
          msg.user._id === confirmedMessage.senderId
      );
      if (hasOptimistic) {
        return prev.map((msg) =>
          msg.pending &&
          msg.text === confirmedMessage.content &&
          msg.user._id === confirmedMessage.senderId
            ? {
                _id: confirmedMessage._id,
                text: confirmedMessage.content,
                createdAt: new Date(confirmedMessage.timestamp),
                user: {
                  _id: confirmedMessage.senderId,
                  name: confirmedMessage.senderId,
                },
                pending: false,
              }
            : msg
        );
      }
      // Otherwise, add new message
      if (prev.some((msg) => msg._id === confirmedMessage._id)) {
        return prev;
      }
      const newMsg: IMessage = {
        _id: confirmedMessage._id,
        text: confirmedMessage.content,
        createdAt: new Date(confirmedMessage.timestamp),
        user: {
          _id: confirmedMessage.senderId,
          name: confirmedMessage.senderId,
        },
        pending: false,
      };
      return GiftedChat.append(prev, [newMsg]);
    });
  });

  const isConnected = socket.connected;

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