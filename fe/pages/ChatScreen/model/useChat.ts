import { useState, useCallback, useEffect, useMemo } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import uuid from 'react-native-uuid';
import { socket, useSocket } from '@/hooks/useSocket';
import { MessagePayload } from './types';

type UseChatParams = {
  chatId: string;
  currentUserId: string;
  currentUsername?: string | null;
  receiverIds?: string[] | string;
};

type ExtendedMessage = IMessage & { pending?: boolean };

export function useChat({
  chatId,
  currentUserId,
  currentUsername,
  receiverIds: receiverIdsRaw,
}: UseChatParams) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);

  const receiverIds = useMemo(() => {
    if (Array.isArray(receiverIdsRaw)) {
      return receiverIdsRaw.filter(Boolean);
    }
    if (typeof receiverIdsRaw === 'string' && receiverIdsRaw.trim().length > 0) {
      return receiverIdsRaw.split(',').map((value) => value.trim()).filter(Boolean);
    }
    return [];
  }, [receiverIdsRaw]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;
    const users = Array.from(new Set([currentUserId, ...receiverIds]));
    socket.emit('joinChat', { chatId, users });
  }, [chatId, currentUserId, receiverIds]);

  useSocket('chatMessages', (loadedMessages: MessagePayload[]) => {
    const formattedMessages: ExtendedMessage[] = loadedMessages
      .map((msg) => ({
        _id: msg.id,
        text: msg.content,
        createdAt: new Date(msg.timestamp),
        user: {
          _id: msg.senderId,
          name: msg.senderUsername ?? msg.senderId,
        },
      }))
      .sort((a, b) =>
        (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime(),
      );
    setMessages(formattedMessages);
  });

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (!chatId || !currentUserId) {
        return;
      }
      newMessages.forEach((message) => {
        const tempId = String(uuid.v4());
        const optimisticMessage: ExtendedMessage = {
          _id: tempId,
          text: message.text,
          createdAt: new Date(),
          user: {
            _id: currentUserId,
            name: currentUsername ?? currentUserId,
          },
          pending: true,
        };
        setMessages((prev) => GiftedChat.append(prev, [optimisticMessage]));

        socket.emit('sendMessage', {
          chatId,
          senderId: currentUserId,
          receiverIds,
          content: message.text,
        });
      });
    },
    [chatId, currentUserId, currentUsername, receiverIds],
  );

  useSocket('message', (confirmedMessage: MessagePayload) => {
    setMessages((prev) => {
      if (!confirmedMessage?.id) {
        return prev;
      }
      const confirmedId = confirmedMessage.id;
      const confirmedTimestamp = new Date(confirmedMessage.timestamp);

      const hasOptimistic = prev.some(
        (msg) =>
          msg.pending &&
          msg.text === confirmedMessage.content &&
          msg.user._id === confirmedMessage.senderId,
      );

      if (hasOptimistic) {
        return prev.map((msg) => {
          if (
            msg.pending &&
            msg.text === confirmedMessage.content &&
            msg.user._id === confirmedMessage.senderId
          ) {
            return {
              _id: confirmedId,
              text: confirmedMessage.content,
              createdAt: confirmedTimestamp,
              user: {
                _id: confirmedMessage.senderId,
                name: confirmedMessage.senderUsername ?? confirmedMessage.senderId,
              },
              pending: false,
            };
          }
          return msg;
        });
      }

      if (prev.some((msg) => msg._id === confirmedId)) {
        return prev;
      }

      const newMsg: ExtendedMessage = {
        _id: confirmedId,
        text: confirmedMessage.content,
        createdAt: confirmedTimestamp,
        user: {
          _id: confirmedMessage.senderId,
          name: confirmedMessage.senderUsername ?? confirmedMessage.senderId,
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
