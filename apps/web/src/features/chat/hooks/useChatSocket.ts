import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
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
      setConnected(true);
      setAuthenticated(true);

      // Join chat after connection
      socket.emit('joinChat', {
        chatId,
        currentUserId: snapshot.userId,
        users: [snapshot.userId, ...receiverIds.split(',')],
      });
    });

    socket.on('message', (message: ChatMessage) => {
      addMessage(message);
    });

    socket.on('chatMessages', (msgs: ChatMessage[]) => {
      if (msgs && Array.isArray(msgs)) {
        setMessages(msgs);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setAuthenticated(false);
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
    (content: string) => {
      if (
        !content.trim() ||
        !chatId ||
        !snapshot.accessToken ||
        !socketRef.current
      )
        return;

      const messagePayload = {
        chatId,
        senderId: snapshot.userId || '',
        receiverIds: receiverIds.split(',').filter(Boolean),
        content: content.trim(),
      };

      try {
        socketRef.current.emit('sendMessage', messagePayload);

        // Optimistically update
        const optimisticMessage: ChatMessage = {
          id: Date.now().toString(),
          senderUsername: snapshot.displayName || snapshot.username || 'You',
          timestamp: new Date().toISOString(),
          ...messagePayload,
        };

        addMessage(optimisticMessage);
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
