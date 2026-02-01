import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
import {
  maybeEncrypt,
  maybeDecrypt,
  setEncryptionKey,
  resetEncryptionKey,
} from '@/shared/lib/socket-encryption';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from '../api';

interface UseChatSocketProps {
  chatId: string | null;
  receiverIds: string;
}

export const useChatSocket = ({ chatId, receiverIds }: UseChatSocketProps) => {
  const { snapshot } = useSessionTokens();
  const socketRef = useRef<Socket | null>(null);

  const {
    isConnected,
    setConnected,
    setAuthenticated,
    addMessage,
    setMessages,
  } = useChatStore();

  useEffect(() => {
    if (!chatId || !snapshot.accessToken) return;

    // Connect to Socket.IO
    const socketUrl = resolveApiUrl('/');
    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: snapshot.accessToken,
      },
    });

    socket.on('connect', () => {
      console.debug('[useChatSocket] Connected');
      setConnected(true);
      setAuthenticated(true);

      // Join chat after connection
      socket.emit('joinChat', {
        chatId,
        currentUserId: snapshot.userId,
        users: [snapshot.userId, ...receiverIds.split(',')],
      });
    });

    socket.on('socket.encryption_key', async (data: { key: string }) => {
      console.debug('[useChatSocket] Received encryption key');
      await setEncryptionKey(data.key);
    });

    socket.on('message', async (payload: unknown) => {
      const message = await maybeDecrypt<ChatMessage>(payload);
      if (message) {
        addMessage(message);
      }
    });

    socket.on('chatMessages', async (payload: unknown) => {
      const msgs = await maybeDecrypt<ChatMessage[]>(payload);
      if (msgs && Array.isArray(msgs)) {
        setMessages(msgs);
      }
    });

    socket.on('disconnect', () => {
      console.debug('[useChatSocket] Disconnected');
      setConnected(false);
      setAuthenticated(false);
      resetEncryptionKey();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
      setAuthenticated(false);
    });

    socketRef.current = socket;

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
      setConnected(false);
      resetEncryptionKey();
    };
  }, [
    chatId,
    snapshot.accessToken,
    snapshot.userId,
    receiverIds,
    setConnected,
    setAuthenticated,
    addMessage,
    setMessages,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (
        !content.trim() ||
        !chatId ||
        !snapshot.accessToken ||
        !socketRef.current
      )
        return;

      try {
        const tempId = `temp-${Date.now()}`;
        const messagePayload = {
          chatId,
          senderId: snapshot.userId || '',
          receiverIds: receiverIds.split(',').filter(Boolean),
          content: content.trim(),
          tempId,
        };

        // Optimistically update
        const optimisticMessage: ChatMessage = {
          id: tempId,
          senderUsername: snapshot.displayName || snapshot.username || 'You',
          timestamp: new Date().toISOString(),
          ...messagePayload,
        };

        addMessage(optimisticMessage);

        const encryptedPayload = await maybeEncrypt(messagePayload);
        socketRef.current.emit('sendMessage', encryptedPayload);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [chatId, snapshot, receiverIds, addMessage],
  );

  return {
    sendMessage,
    isConnected,
  };
};
