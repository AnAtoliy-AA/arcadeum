import { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { socket, useSocket } from '@/hooks/useSocket';
import uuid from 'react-native-uuid';
import { Message } from '../model/types';

interface UseChatProps {
  chatId: string;
  userId: string;
  receiverId: string;
}

export function useChat({ chatId, userId, receiverId }: UseChatProps) {
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

  useSocket('message', (confirmedMessage) => {
    setMessages((prev) => {
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

  return {
    messages,
    onSend,
    isConnected,
  };
}
