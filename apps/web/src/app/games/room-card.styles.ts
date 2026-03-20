import React from 'react';
import { styled, YStack } from 'tamagui';

const LIST_VIEW_MIN_WIDTH = '200px';

// ─── CSS strings for complex selectors ───────────────────────────────────────

/** Inject this CSS string into a <style> tag in the consuming component. */
export const roomCardCSS = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes gradientFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .room-card {
    animation: fadeIn 0.5s ease-out both;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .room-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #7ad7ff, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .room-card:hover {
    transform: translateY(-4px);
    border-color: #7ad7ff40;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px #7ad7ff20;
  }
  .room-card:hover::before {
    opacity: 1;
  }
  .room-card:nth-child(1) { animation-delay: 0s; }
  .room-card:nth-child(2) { animation-delay: 0.1s; }
  .room-card:nth-child(3) { animation-delay: 0.2s; }
  .room-card:nth-child(4) { animation-delay: 0.3s; }
  .room-card:nth-child(5) { animation-delay: 0.4s; }

  @media (max-width: 768px) {
    .room-card {
      padding: 1.5rem !important;
      border-radius: 20px !important;
      flex-direction: column !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
      gap: 1rem !important;
    }
  }

  .room-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(-45deg, #ecefee, #7ad7ff, #57c3ff, #ecefee);
    background-size: 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    animation: gradientFlow 5s ease infinite;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
    max-width: 100%;
  }
`;

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getRoomCardStyle(viewMode?: 'grid' | 'list'): React.CSSProperties {
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

export function getRoomHeaderStyle(viewMode?: 'grid' | 'list'): React.CSSProperties {
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

export function getRoomActionsStyle(viewMode?: 'grid' | 'list'): React.CSSProperties {
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

export const RoomMeta = styled(YStack, {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  fontSize: '0.85rem',
  color: '$color',
} as any);

export const MetaRow = styled(YStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.5rem',
  color: '$color',
} as any);

export const MetaIcon = styled(YStack, {
  tag: 'span',
  fontSize: '0.9rem',
  filter: 'grayscale(30%)',
} as any);

export const MetaLabel = styled(YStack, {
  tag: 'span',
  fontWeight: '500',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.8rem',
} as any);

export const MetaValue = styled(YStack, {
  tag: 'span',
  color: '$color',
  fontWeight: '600',
} as any);

export const ParticipantsLabel = styled(YStack, {
  tag: 'span',
  fontWeight: '500',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.8rem',
  display: 'block',
  marginBottom: '0.35rem',
} as any);

export const MetaListContainer = styled(YStack, {
  flexDirection: 'row',
  gap: '1.5rem',
  alignItems: 'center',
  flex: 1,
  flexWrap: 'wrap',
} as any);

export const ParticipantsList = styled(YStack, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.25rem',
  gridColumn: '1 / -1',
} as any);

export const FastBadge = styled(YStack, {
  tag: 'span',
  padding: '0.35rem 0.85rem',
  borderRadius: 8,
  fontSize: '0.7rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
  color: 'white',
  boxShadow: '0 2px 8px #eab30840',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  flexDirection: 'row',
  alignItems: 'center',
} as any);

export const BadgeIcon = styled(YStack, {
  tag: 'span',
  marginRight: 4,
} as any);
