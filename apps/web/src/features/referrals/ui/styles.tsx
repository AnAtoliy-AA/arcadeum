import React from 'react';
import { styled, XStack, YStack, Text } from 'tamagui';

// CSS for pseudo-states, keyframes, and hover effects — injected once in ReferralDashboard
export const referralsStyles = `
  @keyframes referralsGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(87, 195, 255, 0.3); }
    50% { box-shadow: 0 0 16px rgba(87, 195, 255, 0.5); }
  }
  .referrals-copy-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #7ad7ff; background: transparent; color: #7ad7ff; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .referrals-copy-btn:hover { background: #7ad7ff; color: #050316; }
  .referrals-tier-card-unlocked { animation: referralsGlow 3s ease-in-out infinite; }
`;

export const DashboardContainer = styled(YStack, {
  maxWidth: 720,
  alignSelf: 'center',
  gap: '$6',
  padding: '$7',
  $gtSm: {
    paddingVertical: '$9',
    paddingHorizontal: '$8',
  },
} as any);

export const DashboardTitle = styled(Text, {
  tag: 'h1',
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  margin: 0,
} as any);

export const DashboardSubtitle = styled(Text, {
  tag: 'p',
  fontSize: '$3',
  color: 'rgba(236,239,238,0.45)',
  marginTop: '-$2',
  marginBottom: '$3',
  lineHeight: 1.5 as any,
} as any);

export const CardTitle = styled(XStack, {
  tag: 'h2',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$3',
  alignItems: 'center',
  gap: '$2',
} as any);

export const CodeContainer = styled(XStack, {
  alignItems: 'center',
  gap: '$3',
  padding: '$3',
  paddingHorizontal: '$4',
  backgroundColor: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 10,
} as any);

export const CodeText = styled(Text, {
  tag: 'span',
  fontSize: '$5',
  fontWeight: '700',
  color: '$accent',
  flex: 1,
  style: { fontFamily: "'SF Mono','Fira Code','Courier New',monospace", letterSpacing: 2 },
} as any);

export function CopyButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button className="referrals-copy-btn" {...props}>
      {children}
    </button>
  );
}

export const ShareLinkRow = styled(XStack, {
  alignItems: 'center',
  gap: '$2',
  marginTop: '$3',
  fontSize: '$2',
  color: 'rgba(236,239,238,0.45)',
} as any);

export const ShareLink = styled(Text, {
  tag: 'span',
  color: '$accent',
  style: { wordBreak: 'break-all' },
} as any);

export const ProgressSection = styled(YStack, {
  gap: '$2',
} as any);

export const ProgressLabel = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '$3',
  color: 'rgba(236,239,238,0.7)',
} as any);

export const ProgressCount = styled(Text, {
  tag: 'span',
  fontWeight: '700',
  fontSize: '$7',
  color: '$color',
} as any);

export const ProgressTarget = styled(Text, {
  tag: 'span',
  fontWeight: '500',
  color: 'rgba(236,239,238,0.45)',
} as any);

export const TierList = styled(YStack, {
  gap: '$4',
} as any);

interface TierCardProps {
  $unlocked: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
  'data-unlocked'?: boolean;
}

export function TierCard({ $unlocked, children, ...props }: TierCardProps) {
  return (
    <XStack
      alignItems="flex-start"
      gap="$4"
      padding="$4"
      borderRadius={12}
      borderWidth={1}
      borderColor={$unlocked ? '$primaryGradientStart' : '$borderColor'}
      backgroundColor={$unlocked ? 'rgba(122,215,255,0.12)' : '$backgroundHover'}
      opacity={$unlocked ? 1 : 0.6}
      className={$unlocked ? 'referrals-tier-card-unlocked' : undefined}
      style={{ transition: 'all 0.3s' }}
      {...(props as any)}
    >
      {children}
    </XStack>
  );
}

export function TierIcon({
  $unlocked,
  children,
}: {
  $unlocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <Text fontSize="$6" opacity={$unlocked ? 1 : 0.4} flexShrink={0}>
      {children}
    </Text>
  );
}

export const TierContent = styled(YStack, {
  gap: '$2',
  flex: 1,
} as any);

export const TierTitle = styled(Text, {
  fontWeight: '600',
  fontSize: '$3',
  color: '$color',
} as any);

export const TierDescription = styled(Text, {
  fontSize: '$2',
  color: 'rgba(236,239,238,0.45)',
} as any);

export function TierBadge({
  $unlocked,
  children,
}: {
  $unlocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '0.25rem 0.5rem',
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: '0.25rem',
        background: $unlocked
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'rgba(107,114,128,0.3)',
        color: $unlocked ? 'white' : 'rgba(255,255,255,0.5)',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
}

export const CopiedNotice = styled(Text, {
  tag: 'span',
  color: '$accent',
  fontSize: '$2',
  fontWeight: '500',
} as any);

export const BadgesRowContainer = styled(XStack, {
  gap: '$2',
  flexWrap: 'wrap',
} as any);
