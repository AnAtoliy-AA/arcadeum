'use client';

import { useState } from 'react';
import { EmotePicker, type EmoteId } from './EmotePicker';
import { QuickButton, QuickButtonText, QuickRow } from './GameChat.styled';

const QUICK_PHRASES = ['gl hf', 'nice play', 'thinking…', 'gg'];

interface ChatQuickBarProps {
  onEmote?: (emoteId: EmoteId) => void;
  onQuickPhrase: (phrase: string) => void;
}

export function ChatQuickBar({ onEmote, onQuickPhrase }: ChatQuickBarProps) {
  const [emoteOpen, setEmoteOpen] = useState(false);

  if (emoteOpen && onEmote) {
    return (
      <EmotePicker
        onEmote={(id) => {
          onEmote(id);
          setEmoteOpen(false);
        }}
      />
    );
  }

  return (
    <QuickRow role="toolbar" aria-label="Quick phrases">
      <QuickButton onPress={() => setEmoteOpen(true)} aria-label="Send emote">
        <QuickButtonText>😀</QuickButtonText>
      </QuickButton>
      {QUICK_PHRASES.map((p) => (
        <QuickButton key={p} onPress={() => onQuickPhrase(p)} aria-label={p}>
          <QuickButtonText>{p}</QuickButtonText>
        </QuickButton>
      ))}
    </QuickRow>
  );
}
