import { useEffect, useCallback, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { chatSocket, getChatsSocket } from '@/shared/lib/socket';
import { maybeEncrypt, maybeDecrypt } from '@/shared/lib/socket-encryption';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from '../api';

interface UseChatSocketProps {
  chatId: string | null;
  receiverIds: string;
}

export const useChatSocket = ({ chatId, receiverIds }: UseChatSocketProps) => {
  const { snapshot } = useSessionTokens();
  const addMessage = useChatStore((s) => s.addMessage);
  const setMessages = useChatStore((s) => s.setMessages);
  const [isConnected, setIsConnected] = useState(chatSocket.connected);

  useEffect(() => {
    if (!snapshot.accessToken) return;
    const s = getChatsSocket();
    s.auth = { token: snapshot.accessToken };
    if (!s.connected) s.connect();
  }, [snapshot.accessToken]);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    chatSocket.on('connect', onConnect);
    chatSocket.on('disconnect', onDisconnect);

    return () => {
      chatSocket.off('connect', onConnect);
      chatSocket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!chatId || !snapshot.userId || !isConnected) return;

    const users = [snapshot.userId, ...receiverIds.split(',').filter(Boolean)];
    chatSocket.emit('joinChat', {
      chatId,
      currentUserId: snapshot.userId,
      users,
    });
  }, [chatId, snapshot.userId, receiverIds, isConnected]);

  useEffect(() => {
    if (!chatId) return;

    const onMessage = async (payload: unknown) => {
      const msg = await maybeDecrypt<ChatMessage>(payload);
      if (msg) addMessage(msg);
    };

    const onChatMessages = async (payload: unknown) => {
      const msgs = await maybeDecrypt<ChatMessage[]>(payload);
      if (msgs && Array.isArray(msgs)) {
        setMessages(msgs);
      }
    };

    chatSocket.on('message', onMessage);
    chatSocket.on('chatMessages', onChatMessages);

    return () => {
      chatSocket.off('message', onMessage);
      chatSocket.off('chatMessages', onChatMessages);
    };
  }, [chatId, addMessage, setMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !chatId || !snapshot.userId) return;

      const tempId = `temp-${Date.now()}`;
      const messagePayload = {
        chatId,
        senderId: snapshot.userId,
        receiverIds: receiverIds.split(',').filter(Boolean),
        content: content.trim(),
        tempId,
      };

      const optimisticMessage: ChatMessage = {
        id: tempId,
        senderUsername: snapshot.displayName || snapshot.username || 'You',
        timestamp: new Date().toISOString(),
        ...messagePayload,
      };

      addMessage(optimisticMessage);

      const encryptedPayload = await maybeEncrypt(messagePayload);
      chatSocket.emit('sendMessage', encryptedPayload);
    },
    [chatId, snapshot, receiverIds, addMessage],
  );

  return {
    sendMessage,
    isConnected,
  };
};
