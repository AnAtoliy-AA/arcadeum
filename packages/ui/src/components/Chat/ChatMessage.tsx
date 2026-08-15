import React, { memo } from 'react';
import { XStack, YStack, styled, ThemeableStack, GetProps, View } from 'tamagui';
import { Avatar } from '../Avatar/Avatar';
import { Typography } from '../Typography/Typography';

export type ChatMessageProps = {
  content: string;
  /** Optional rich rendering of the message body — when provided, takes
   * precedence over `content` for system/action rows. Used to inject
   * inline colored spans (e.g. HIT/MISS/SUNK keywords). */
  contentNode?: React.ReactNode;
  /** When set, renders an emoji instead of the text bubble. */
  emoji?: string;
  senderName?: string;
  senderColor?: string;
  /**
   * Extra style applied to the sender-name Typography. Used to render
   * gradient name-colors via `background-clip: text` — when present, takes
   * precedence over `senderColor`. Plain (hex) colors should keep using
   * `senderColor`.
   */
  senderNameStyle?: React.CSSProperties;
  targetName?: string;
  targetColor?: string;
  timestamp?: string;
  isOwn?: boolean;
  /** @deprecated pass `senderAvatar` instead. Kept for backward compat with
   *  callers that pre-date the PlayerAvatar slot. */
  avatarUrl?: string;
  /** Sender's equipped shop badge URL — rendered inline next to the name.
   *  @deprecated pass `senderAvatar` instead. */
  badgeUrl?: string;
  /** Rich avatar slot. When provided, replaces the legacy `<Avatar>` + badge
   *  block in the sender row. Designed for an `<EquippedPlayerAvatar>` from
   *  the web shared UI. */
  senderAvatar?: React.ReactNode;
  isEncrypted?: boolean;
  type?: 'system' | 'action' | 'message';
};

const MessageGroup = styled(ThemeableStack, {
  name: 'MessageGroup',
  flexDirection: 'column',
  gap: '$0.5',
  maxWidth: '85%',
  minWidth: 0,
  paddingVertical: '$1',
  
  variants: {
    isOwn: {
      true: {
        alignItems: 'flex-start',
        alignSelf: 'flex-end',
      },
      false: {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
      },
    },
    type: {
      system: {
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        opacity: 0.8,
      },
      action: {
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        opacity: 0.9,
      },
      message: {},
    },
  } as const,
  
  defaultVariants: {
    type: 'message',
  },
});

type MessageGroupProps = GetProps<typeof MessageGroup>;

const MessageBubble = styled(YStack, {
  paddingHorizontal: '$4',
  paddingVertical: '$2.5',
  flexShrink: 1,
  minWidth: 0,
  alignSelf: 'flex-start',
  
  hoverStyle: {
    scale: 1.01,
  },
  
  variants: {
    isOwn: {
      true: {
        alignSelf: 'flex-end',
        borderRadius: '$4',
        borderBottomRightRadius: '$1',
        background: 'linear-gradient(135deg, $primaryGradientStart 0%, $primaryGradientEnd 100%)',
        shadowColor: '$primary',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      false: {
        borderRadius: '$4',
        borderBottomLeftRadius: '$2',
        backgroundColor: '$glassBg',
        borderWidth: 1,
        borderColor: '$glassBorder',
        backdropFilter: 'blur(16px)',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },
    type: {
      system: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingVertical: '$1',
        paddingHorizontal: '$2',
      },
      action: {
        backgroundColor: '$glassBg',
        borderRadius: '$6',
        paddingVertical: '$1.5',
        paddingHorizontal: '$4',
        borderWidth: 1,
        borderColor: '$glassBorder',
        borderStyle: 'dashed',
      },
      message: {},
    },
  } as const,
});

const NAME_STYLE = { fontSize: 11, lineHeight: '16px' } as const;

function SenderName({
  name,
  color,
  nameStyle,
}: {
  name: string;
  color?: string;
  nameStyle?: React.CSSProperties;
}) {
  return (
    <Typography
      uiSize="xs"
      weight="600"
      {...(color ? { color } : { alpha: 'medium' })}
      className="uppercase tracking-[0.5px]"
      numberOfLines={1}
      style={{ ...NAME_STYLE, ...nameStyle }}
    >
      {name}
    </Typography>
  );
}

export const ChatMessage = memo(function ChatMessage({
  content,
  contentNode,
  senderName,
  senderColor,
  senderNameStyle,
  targetName,
  targetColor,
  timestamp,
  isOwn = false,
  avatarUrl,
  badgeUrl,
  senderAvatar,
  isEncrypted,
  emoji,
  type = 'message',
}: ChatMessageProps) {
  const isSystem = type === 'system' || type === 'action';

  return (
    <MessageGroup
      isOwn={isOwn}
      type={type}
      enterStyle={{ opacity: 0, scale: 0.9, y: 15 }}
    >
      {!isSystem && senderName && (
        <XStack
          ai="flex-end"
          gap="$2"
          width="100%"
          flexShrink={1}
          {...(isOwn ? { jc: 'flex-end' } : {})}
        >
          {senderAvatar ?? (
            <View flexShrink={0}>
              <Avatar name={senderName} size="sm" src={avatarUrl} />
              {badgeUrl ? (
                <View width={16} height={16}>
                  <img
                    src={badgeUrl}
                    alt=""
                    width={16}
                    height={16}
                    style={{ objectFit: 'contain' }}
                  />
                </View>
              ) : null}
            </View>
          )}
          <YStack flex={1} minWidth={0} gap="$1">
            {emoji ? (
              <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
            ) : (
              <MessageBubble isOwn={isOwn} type={type} data-testid="chat-message" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', width: '100%' }}>
                <Typography
                  uiSize="sm"
                  color={isOwn ? 'white' : '$color'}
                  className="text-left"
                >
                  {isEncrypted ? '[Encrypted Message]' : (contentNode ?? content)}
                </Typography>
                {timestamp && (
                  <Typography
                    uiSize="xs"
                    alpha="low"
                    color={isOwn ? 'white' : '$color'}
                    className="mt-1"
                    style={{ opacity: 0.7 }}
                  >
                    {timestamp}
                  </Typography>
                )}
              </MessageBubble>
            )}
            <SenderName
              name={senderName}
              color={senderColor}
              nameStyle={senderNameStyle}
            />
          </YStack>
        </XStack>
      )}
      {isSystem && (
        <MessageBubble isOwn={isOwn} type={type} data-testid="chat-message">
          <Typography
            uiSize="xs"
            color={isOwn ? 'white' : '$color'}
            className="text-center italic"
          >
            {senderName && !isEncrypted ? (
              <>
                <Typography
                  uiSize="xs"
                  weight="700"
                  className="not-italic"
                  {...(senderColor ? { color: senderColor } : {})}
                >
                  {senderName}
                </Typography>
                {targetName ? (
                  <>
                    {' → '}
                    <Typography
                      uiSize="xs"
                      weight="700"
                      className="not-italic"
                      {...(targetColor ? { color: targetColor } : {})}
                    >
                      {targetName}
                    </Typography>
                  </>
                ) : null}
                {contentNode ? <> {contentNode}</> : ` ${content}`}
              </>
            ) : isEncrypted ? (
              '[Encrypted Message]'
            ) : (
              (contentNode ?? content)
            )}
          </Typography>
        </MessageBubble>
      )}
    </MessageGroup>
  );
});
