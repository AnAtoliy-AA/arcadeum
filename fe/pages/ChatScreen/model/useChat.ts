import { useCallback, useEffect, useMemo, useState } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import uuid from 'react-native-uuid';

import { chatSocket, useChatSocket } from '@/hooks/useSocket';
import { MessagePayload } from './types';

type UseChatParams = {
  chatId: string;
  currentUserId: string;
  currentUsername?: string | null;
  receiverIds?: string[] | string;
};

type ExtendedMessage = IMessage & { pending?: boolean };

function mapToExtendedMessage(payload: MessagePayload): ExtendedMessage {
  const createdAt = payload.timestamp ? new Date(payload.timestamp) : new Date();

  return {
    _id: payload.id,
    text: payload.content,
    createdAt,
    user: {
      _id: payload.senderId,
      name: payload.senderUsername || payload.senderId,
    },
    pending: false,
  };
}

export function useChat({
  chatId,
  currentUserId,
  currentUsername,
  receiverIds: receiverIdsRaw,
}: UseChatParams) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(
    chatSocket.connected,
  );

  const receiverIds = useMemo(() => {
    if (Array.isArray(receiverIdsRaw)) {
      return receiverIdsRaw
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);
    }

    if (typeof receiverIdsRaw === 'string' && receiverIdsRaw.trim().length > 0) {
      return receiverIdsRaw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    return [];
  }, [receiverIdsRaw]);

  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
    };

    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);

    return () => {
      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!chatId || !currentUserId || !isConnected) {
      return;
    }

    const users = Array.from(new Set([currentUserId, ...receiverIds]));
    chatSocket.emit('joinChat', {
      chatId,
      users,
      currentUserId,
    });
  }, [chatId, currentUserId, receiverIds, isConnected]);

  const handleChatMessages = useCallback(
    (loadedMessages: MessagePayload[] = []) => {
      if (!chatId || !Array.isArray(loadedMessages)) {
        return;
      }

      const filtered = loadedMessages.filter((payload) => payload.chatId === chatId);

      if (!filtered.length) {
        return;
      }

      const normalized = filtered
        .map(mapToExtendedMessage)
        .sort(
          (a, b) =>
            (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime(),
        );

      setMessages(normalized);
    },
    [chatId],
  );

  useChatSocket('chatMessages', handleChatMessages);

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

        chatSocket.emit('sendMessage', {
          chatId,
          senderId: currentUserId,
          receiverIds,
          content: message.text,
        });
      });
    },
    [chatId, currentUserId, currentUsername, receiverIds],
  );

  const handleIncomingMessage = useCallback(
    (confirmedMessage: MessagePayload) => {
      if (!chatId || confirmedMessage?.chatId !== chatId) {
        return;
      }

      setMessages((prev) => {
        if (!confirmedMessage?.id) {
          return prev;
        }

        const normalized = mapToExtendedMessage(confirmedMessage);

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
              return normalized;
            }

            return msg;
          });
        }

        if (prev.some((msg) => msg._id === confirmedMessage.id)) {
          return prev;
        }

        return GiftedChat.append(prev, [normalized]);
      });
    },
    [chatId],
  );

  useChatSocket('message', handleIncomingMessage);

  return {
    messages,
    onSend,
    isConnected,
  };
}
