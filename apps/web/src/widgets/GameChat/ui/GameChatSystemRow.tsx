'use client';

import type { ReactNode } from 'react';
import { SYS_COLOR, SysText, SysTime, SysWrap } from './GameChat.styled';

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
