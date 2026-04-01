import { styled, YStack, Text, Main } from 'tamagui';

export const Page = styled(Main, {
  name: 'StatsPage',
  minHeight: '100vh',
  backgroundColor: '$background',
  paddingTop: 80,
} as Record<string, unknown>);

export const Container = styled(YStack, {
  name: 'StatsContainer',
  maxWidth: 1200,
  width: '100%',
  alignSelf: 'center',
  padding: '$6',
  paddingHorizontal: '$4',
} as Record<string, unknown>);

// Card is provided by @arcadeum/ui — use <Card variant="default" cardPadding="md"> in JSX

export const CardTitle = styled(Text, {
  name: 'StatCardTitle',
  tag: 'h3',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  margin: 0,
} as Record<string, unknown>);

export const StatValue = styled(Text, {
  name: 'StatValue',
  fontSize: '$9',
  fontWeight: '700',
  color: '$primaryGradientStart',
} as Record<string, unknown>);

export const StatLabel = styled(Text, {
  name: 'StatLabel',
  fontSize: '$2',
  color: 'rgba(236,239,238,0.7)',
  textTransform: 'uppercase',
  letterSpacing: 1,
} as Record<string, unknown>);

export const BreakdownTable = styled(YStack, {
  name: 'BreakdownTable',
  width: '100%',
  marginTop: '$6',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 12,
  overflow: 'hidden',
} as Record<string, unknown>);
