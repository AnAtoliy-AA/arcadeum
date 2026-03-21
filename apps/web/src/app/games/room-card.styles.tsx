import React from 'react';
import { styled, XStack, Text } from 'tamagui';

const LIST_VIEW_MIN_WIDTH = '200px';

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getRoomCardStyle(
  viewMode?: 'grid' | 'list',
): React.CSSProperties {
  const isList = viewMode === 'list';
  return {
    padding: isList ? '1rem 1.5rem' : '1.5rem',
    borderRadius: isList ? '14px' : '20px',
    border: '1px solid #32353d',
    background: 'linear-gradient(145deg, #151718 0%, #151718 100%)',
    display: 'flex',
    flexDirection: isList ? 'row' : 'column',
    alignItems: isList ? 'center' : 'stretch',
    justifyContent: isList ? 'space-between' : 'flex-start',
    gap: isList ? '1.5rem' : '1rem',
  };
}

export function getStatusBadgeStyle(status: string): React.CSSProperties {
  let background: string;
  let boxShadow: string;
  if (status === 'lobby') {
    background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    boxShadow = '0 2px 8px #10B98140';
  } else if (status === 'in_progress') {
    background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    boxShadow = '0 2px 8px #F59E0B40';
  } else {
    background = 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    boxShadow = '0 2px 8px #6B728040';
  }
  return {
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    background,
    color: 'white',
    boxShadow,
  };
}

export function getGameNameValueStyle(gradient?: string): React.CSSProperties {
  if (!gradient) return { color: '#ecefee', fontWeight: 600 };
  return {
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
    fontWeight: 600,
  };
}

export function getRoomHeaderStyle(
  viewMode?: 'grid' | 'list',
): React.CSSProperties {
  const isList = viewMode === 'list';
  return {
    display: 'flex',
    flexDirection: isList ? 'column' : 'row',
    justifyContent: isList ? 'flex-start' : 'space-between',
    alignItems: isList ? 'flex-start' : 'center',
    gap: isList ? '0.5rem' : '1rem',
    minWidth: isList ? LIST_VIEW_MIN_WIDTH : 'auto',
  };
}

export function getRoomActionsStyle(
  viewMode?: 'grid' | 'list',
): React.CSSProperties {
  const isList = viewMode === 'list';
  return {
    display: 'flex',
    gap: '0.75rem',
    marginTop: isList ? '0' : '0.5rem',
    paddingTop: isList ? '0' : '1rem',
    borderTop: isList ? 'none' : '1px solid #32353d',
    flexShrink: 0,
  };
}

export function getParticipantChipStyle(isHost?: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#ecefee',
    background: isHost
      ? 'linear-gradient(135deg, #7ad7ff30, transparent)'
      : '#151718',
    border: `1px solid ${isHost ? '#7ad7ff' : '#32353d'}`,
  };
}

// ─── Simple layout components (Tamagui YStack-based) ─────────────────────────

export const RoomMeta = ({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      fontSize: '0.85rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const MetaRow = styled(XStack, {
  name: 'MetaRow',
  alignItems: 'center',
  gap: '$2',
});

export const MetaIcon = ({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{ fontSize: '0.9rem', filter: 'grayscale(30%)', ...style }}
    {...props}
  >
    {children}
  </span>
);

export const MetaLabel = styled(Text, {
  name: 'MetaLabel',
  fontWeight: '500',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.8rem',
});

export const MetaValue = styled(Text, {
  name: 'MetaValue',
  color: '$color',
  fontWeight: '600',
});

export const ParticipantsLabel = styled(Text, {
  name: 'ParticipantsLabel',
  fontWeight: '500',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.8rem',
  display: 'block',
  marginBottom: '$1',
});

export const MetaListContainer = styled(XStack, {
  name: 'MetaListContainer',
  gap: '$4',
  alignItems: 'center',
  flex: 1,
  flexWrap: 'wrap',
});

export const ParticipantsList = ({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.25rem',
      gridColumn: '1 / -1',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const FastBadge = ({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.35rem 0.85rem',
      borderRadius: '8px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      color: 'white',
      boxShadow: '0 2px 8px #eab30840',
      flexShrink: 0,
      whiteSpace: 'nowrap',
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

export const BadgeIcon = styled(Text, {
  name: 'BadgeIcon',
  marginRight: 4,
});
