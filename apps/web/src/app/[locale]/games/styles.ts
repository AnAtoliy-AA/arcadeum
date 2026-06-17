import { styled, XStack, YStack, Text } from 'tamagui';
import {
  Spinner as SharedSpinner,
  PageTitle as SharedPageTitle,
} from '@arcadeum/ui';

export const Header = styled(XStack, {
  name: 'Header',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
});

export const HeaderControls = styled(XStack, {
  name: 'HeaderControls',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
});

// $sm = max-width:768px
export const ViewToggle = styled(XStack, {
  name: 'ViewToggle',
  borderRadius: 10,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  $sm: { display: 'none' },
});

// Pass size="xl" gradient as JSX props in consuming components
export const Title = SharedPageTitle;

export const Filters = styled(XStack, {
  name: 'Filters',
  width: '100%',
  maxWidth: '100%',
  columnGap: '1.5rem',
  rowGap: '1.25rem',
  flexWrap: 'wrap',
  paddingTop: '$5',
  paddingBottom: '$5',
  paddingHorizontal: '2.25rem',
  backgroundColor: '$background',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '$borderColor',
  alignItems: 'center',
  $sm: {
    paddingHorizontal: '$3',
  },
});

export const SearchContainer = styled(XStack, {
  name: 'SearchContainer',
  flex: 1,
  minWidth: 280,
  maxWidth: 450,
  gap: '0.5rem',
});

export const FilterGroup = styled(YStack, {
  name: 'FilterGroup',
  alignItems: 'flex-start',
  gap: '$1',
  minWidth: 150,
  maxWidth: '100%',
  padding: '$1',
});

export const FilterLabel = styled(Text, {
  name: 'FilterLabel',
  fontSize: '$3',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  color: '$color',
  marginBottom: '$1',
  userSelect: 'none',
  opacity: 0.8,
});

export const FilterChips = styled(XStack, {
  name: 'FilterChips',
  flexWrap: 'wrap',
  gap: '0.6rem',
  paddingVertical: '$2',
  paddingHorizontal: '$1',
});

export const Loading = styled(YStack, {
  name: 'Loading',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '4rem',
});

export const Spinner = styled(SharedSpinner, {
  name: 'Spinner',
  size: 'xl',
});

// Error: replaced Card with plain div (Card had variant/padding attrs)
export const Error = styled(Text, {
  name: 'Error',
  display: 'block',
  background: 'linear-gradient(135deg, #7f1d1d20, transparent)',
  borderColor: '#dc2626',
  borderWidth: 1,
  borderRadius: 12,
  padding: '1rem',
  color: '#ef4444',
  fontWeight: '500',
  gridColumn: '1 / -1',
});

export const Empty = styled(Text, {
  name: 'Empty',
  display: 'block',
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
});

export const ServerWakeUpContainer = styled(YStack, {
  name: 'ServerWakeUpContainer',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  minHeight: '50vh',
  flex: 1,
  gridColumn: '1 / -1',
});

export const EndOfListText = styled(Text, {
  name: 'EndOfListText',
  display: 'block',
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '2rem',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.95rem',
  fontWeight: '500',
});
