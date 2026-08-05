'use client';

import type { ReactNode } from 'react';
import { SYS_COLOR, SysText, SysTime, SysWrap } from './GameChat.styled';
import { ChatSenderLabel } from './ChatSenderLabel';
import type { EquippedResolver } from './types';

export type SystemRowKind = 'elim' | 'round' | 'combo' | 'join';

interface Props {
  kind: SystemRowKind;
  content: ReactNode;
  senderName?: string;
  senderColor?: string;
  targetName?: string;
  targetColor?: string;
  time?: string;
}

const GLYPHS: Record<SystemRowKind, string> = {
  elim: '☠',
  round: '◷',
  combo: '✦',
  join: '⇢',
};

export function GameChatSystemRow({
  kind,
  content,
  senderName,
  senderColor,
  targetName,
  targetColor,
  time,
}: Props) {
  const color = SYS_COLOR[kind];
  return (
    <SysWrap
      borderLeftColor={color}
      backgroundColor={`color-mix(in srgb, ${color} 12%, transparent)`}
      data-testid="game-chat-system-row"
    >
      <SysText flex={0} color={color} fontWeight="700">
        {GLYPHS[kind]}
      </SysText>
      <SysText>
        {senderName ? (
          <>
            <SysText
              color={senderColor ?? color}
              fontWeight="700"
              data-testid="system-row-sender"
            >
              {senderName}
            </SysText>
            {targetName ? (
              <>
                {' → '}
                <SysText
                  color={targetColor ?? color}
                  fontWeight="700"
                  data-testid="system-row-target"
                >
                  {targetName}
                </SysText>
              </>
            ) : null}{' '}
          </>
        ) : null}
        {content}
      </SysText>
      {time ? <SysTime>{time}</SysTime> : null}
    </SysWrap>
  );
}

interface EmoteRowProps {
  emoji: string;
  senderName?: string;
  senderColor?: string;
  senderId?: string | null;
  resolveEquipped?: EquippedResolver;
}

export function GameChatEmoteRow({
  emoji,
  senderName,
  senderColor,
  senderId,
  resolveEquipped,
}: EmoteRowProps) {
  return (
    <div
      data-testid="game-chat-emote-row"
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}
    >
      {senderName ? (
        <ChatSenderLabel
          senderName={senderName}
          senderColor={senderColor}
          senderId={senderId}
          resolveEquipped={resolveEquipped}
        />
      ) : null}
      <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
    </div>
  );
}
