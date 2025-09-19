import React, { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function MessageScreen() {
  const [message, setMessage] = useState<string>('');

  useSocket('message', (msg: string) => {
    setMessage(msg);
  });

  return (
    <ThemedView style={{ padding: 20 }}>
      <ThemedText>Received from backend:</ThemedText>
      <ThemedText style={{ fontWeight: 'bold', marginTop: 10 }}>{message}</ThemedText>
    </ThemedView>
  );
}