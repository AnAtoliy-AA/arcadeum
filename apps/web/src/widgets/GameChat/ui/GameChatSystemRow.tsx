'use client';

import type { ReactNode } from 'react';
import { SYS_COLOR, SysText, SysTime, SysWrap } from './GameChat.styled';

export type SystemRowKind = 'elim' | 'round' | 'combo' | 'join';

interface Props {
  kind: SystemRowKind;
  content: ReactNode;
  time?: string;
}

const GLYPHS: Record<SystemRowKind, string> = {
  elim: '☠',
  round: '◷',
  combo: '✦',
  join: '⇢',
};

export function GameChatSystemRow({ kind, content, time }: Props) {
  const color = SYS_COLOR[kind];
  return (
    <SysWrap
      borderLeftColor={color}
      backgroundColor={`color-mix(in srgb, ${color} 12%, transparent)`}
    >
      <SysText color={color} fontWeight="700">
        {GLYPHS[kind]}
      </SysText>
      <SysText>{content}</SysText>
      {time ? <SysTime>{time}</SysTime> : null}
    </SysWrap>
  );
}
