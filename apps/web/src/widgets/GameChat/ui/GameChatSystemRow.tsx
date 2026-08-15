'use client';

import type { ReactNode } from 'react';
import { ChatMessage } from '@arcadeum/ui';
import { SYS_COLOR, SysText, SysTime, SysWrap } from './GameChat.styled';
import { ChatSenderLabel } from './ChatSenderLabel';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
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
      style={{
        borderLeftColor: color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
      data-testid="game-chat-system-row"
    >
      <SysText style={{ flex: 0, color, fontWeight: 700 }}>
        {GLYPHS[kind]}
      </SysText>
      <SysText>
        {senderName ? (
          <>
            <SysText
              style={{ color: senderColor ?? color, fontWeight: 700 }}
              data-testid="system-row-sender"
            >
              {senderName}
            </SysText>
            {targetName ? (
              <>
                {' → '}
                <SysText
                  style={{ color: targetColor ?? color, fontWeight: 700 }}
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
  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: resolved?.equippedAvatarId,
    equippedBadgeId: resolved?.equippedBadgeId,
    equippedNameColorId: resolved?.equippedNameColorId,
    equippedFrameId: resolved?.equippedFrameId,
    equippedAuraId: resolved?.equippedAuraId,
    equippedBannerId: resolved?.equippedBannerId,
  });
  const nameStyleProps = nameColorRenderProps(nameColor);

  return (
    <div data-testid="game-chat-emote-row">
      <ChatMessage
        content=""
        emoji={emoji}
        senderName={senderName}
        senderColor={nameStyleProps.color ?? senderColor}
        senderNameStyle={nameStyleProps.style}
        isOwn={false}
        senderAvatar={
          senderName ? (
            <ChatSenderLabel
              senderName={senderName}
              senderId={senderId}
              resolveEquipped={resolveEquipped}
            />
          ) : undefined
        }
      />
    </div>
  );
}
