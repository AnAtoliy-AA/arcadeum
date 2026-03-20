import React from 'react';
import { styled, YStack } from 'tamagui';
import {
  Spinner as SharedSpinner,
  PageTitle as SharedPageTitle,
} from '@/shared/ui';

export const fadeInCSS = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const Page = styled(YStack, {
  tag: 'main',
  minHeight: '100vh',
  padding: '2rem 1.5rem',
  backgroundColor: '$background',
  color: '$color',
} as any);

export const Container = styled(YStack, {
  maxWidth: 1200,
  marginHorizontal: 'auto',
  flexDirection: 'column',
  gap: '2rem',
} as any);

export const Header = styled(YStack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
} as any);

export const HeaderControls = styled(YStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '1rem',
} as any);

// $sm = max-width:768px
export const ViewToggle = styled(YStack, {
  flexDirection: 'row',
  borderRadius: 10,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  $sm: { display: 'none' },
} as any);

// Pass size="xl" gradient as JSX props in consuming components
export const Title = styled(SharedPageTitle, {
  fontWeight: '800',
} as any);

export const Filters = styled(YStack, {
  flexDirection: 'row',
  gap: '2rem',
  flexWrap: 'wrap',
  padding: '1.25rem 1.5rem',
  backgroundColor: '$background',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '$borderColor',
} as any);

export const SearchContainer = styled(YStack, {
  flex: 1,
  minWidth: 200,
  maxWidth: 400,
  flexDirection: 'row',
  gap: '0.5rem',
} as any);

export const FilterGroup = styled(YStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.75rem',
} as any);

export const FilterLabel = styled(YStack, {
  tag: 'label',
  fontSize: '0.8rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'rgba(236,239,238,0.45)',
} as any);

export const FilterChips = styled(YStack, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.5rem',
} as any);

/** Returns inline CSS for the rooms container based on viewMode. */
export function getRoomsContainerStyle(
  viewMode?: 'grid' | 'list',
): React.CSSProperties {
  if (viewMode === 'list')
    return { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem',
  };
}

// Legacy named export kept for backward-compat
export const RoomsContainer = styled(YStack, {} as any);

export const Loading = styled(YStack, {
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '4rem',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.95rem',
} as any);

export const Spinner = styled(SharedSpinner, {
  size: 'lg',
} as any);

// Error: replaced Card with plain div (Card had variant/padding attrs)
export const Error = styled(YStack, {
  background: 'linear-gradient(135deg, #7f1d1d20, transparent)',
  borderColor: '#dc2626',
  borderWidth: 1,
  borderRadius: 12,
  padding: '1rem',
  color: '#ef4444',
  fontWeight: '500',
  gridColumn: '1 / -1',
} as any);

export const Empty = styled(YStack, {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '1.1rem',
  backgroundColor: '$background',
  borderRadius: 20,
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: '$borderColor',
  gridColumn: '1 / -1',
} as any);

export const ServerWakeUpContainer = styled(YStack, {
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  minHeight: '50vh',
  flex: 1,
  gridColumn: '1 / -1',
} as any);

export const ScrollSentinel = styled(YStack, {
  gridColumn: '1 / -1',
  justifyContent: 'center',
  padding: '2rem',
  width: '100%',
} as any);

export const EndOfListText = styled(YStack, {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '2rem',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.95rem',
  fontWeight: '500',
} as any);
