import React, { memo } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Typography } from '../Typography/Typography';
import { cx } from '../../utils/cx';

export type ChatMessageType = 'system' | 'action' | 'message';

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
  type?: ChatMessageType;
};

const MESSAGE_GROUP_BASE = 'flex flex-col gap-0.5 min-w-0 max-w-[85%] py-1';

function messageGroupClasses(isOwn: boolean, type: ChatMessageType): string {
  if (type === 'system') {
    return cx(
      MESSAGE_GROUP_BASE,
      'max-w-full self-center items-center opacity-80',
    );
  }
  if (type === 'action') {
    return cx(
      MESSAGE_GROUP_BASE,
      'max-w-full self-center items-center opacity-90',
    );
  }
  return cx(
    MESSAGE_GROUP_BASE,
    isOwn ? 'items-start self-end' : 'items-start self-start',
  );
}

const MESSAGE_BUBBLE_BASE =
  'flex flex-col min-w-0 shrink transition-transform duration-150 ease-out hover:scale-[1.01]';

function messageBubbleClasses(isOwn: boolean, type: ChatMessageType): string {
  if (type === 'system') {
    return cx(
      MESSAGE_BUBBLE_BASE,
      'border-0 bg-transparent px-2 py-1',
      isOwn ? 'self-end' : 'self-start',
    );
  }
  if (type === 'action') {
    return cx(
      MESSAGE_BUBBLE_BASE,
      'rounded-[24px] border border-dashed border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5',
      isOwn ? 'self-end' : 'self-start',
    );
  }
  return cx(
    MESSAGE_BUBBLE_BASE,
    'px-4 py-2.5',
    isOwn
      ? 'self-end rounded-2xl rounded-br bg-[linear-gradient(135deg,var(--primaryGradientStart)_0%,var(--primaryGradientEnd)_100%)] shadow-[0_4px_10px_color-mix(in_srgb,var(--primary)_30%,transparent)]'
      : 'self-start rounded-2xl rounded-bl-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] backdrop-blur-[16px] shadow-[0_2px_4px_var(--shadowColor)]',
  );
}

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
    <div className={messageGroupClasses(isOwn, type)}>
      {!isSystem && senderName && (
        <div
          className={cx(
            'flex w-full flex-row items-end gap-2 shrink',
            isOwn ? 'justify-end' : undefined,
          )}
        >
          {senderAvatar ?? (
            <div className="shrink-0">
              <Avatar name={senderName} size="sm" src={avatarUrl} />
              {badgeUrl ? (
                <div className="h-4 w-4">
                  <img
                    src={badgeUrl}
                    alt=""
                    width={16}
                    height={16}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ) : null}
            </div>
          )}
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            {emoji ? (
              <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
            ) : (
              <div
                className={messageBubbleClasses(isOwn, type)}
                data-testid="chat-message"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  width: '100%',
                }}
              >
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
              </div>
            )}
            <SenderName
              name={senderName}
              color={senderColor}
              nameStyle={senderNameStyle}
            />
          </div>
        </div>
      )}
      {isSystem && (
        <div
          className={messageBubbleClasses(isOwn, type)}
          data-testid="chat-message"
        >
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
        </div>
      )}
    </div>
  );
});
