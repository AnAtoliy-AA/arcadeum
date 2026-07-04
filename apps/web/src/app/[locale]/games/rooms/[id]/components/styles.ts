import { styled, XStack, YStack, Text } from 'tamagui';
import { Input as UIInput } from '@arcadeum/ui';

export const fullscreenStyles = `
  .games-room-container.is-fullscreen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 0.5rem !important;
    background: #151718 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 1000;
  }
  @media (min-width: 801px) {
    .games-room-container.is-fullscreen {
      padding: 1rem 1.5rem !important;
    }
  }
`;

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const formAnimationsCss = `
  @keyframes cardEnter {
    0% { opacity: 0; transform: translateY(24px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes iconGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.35), 0 4px 20px rgba(139,92,246,0.2); }
    50% { box-shadow: 0 0 0 12px rgba(139,92,246,0), 0 4px 28px rgba(139,92,246,0.35); }
  }
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(2px); }
  }
  .icon-pulse {
    position: relative;
  }
  .icon-pulse::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(139,92,246,0.25);
    animation: iconGlow 3s ease-in-out infinite;
    pointer-events: none;
  }
`;

export const cardEnterStyle = {
  animation: `cardEnter 500ms ${ease} both`,
} as const;

export const fadeInUpDelayed = (delay: string) =>
  ({
    animation: `fadeInUp 500ms ${ease} ${delay} both`,
  }) as const;

export const errorShakeStyle = {
  animation: 'errorShake 0.4s ease-in-out',
} as const;

export const Container = styled(YStack, {
  name: 'Container',
  maxWidth: 1400,
  width: '100%',
  marginHorizontal: 'auto',
  padding: '1rem',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
  minHeight: 0,
  $md: {
    overflowY: 'auto',
  },
  $tablet: {
    padding: '$3',
    gap: '$3',
    flex: 1,
    overflowY: 'auto',
  },
  $sm: {
    padding: '$2',
    gap: '$2',
    flex: 1,
    overflowY: 'auto',
  },
} as Record<string, unknown>);

export const CenteredContainer = styled(Container, {
  name: 'CenteredContainer',
  alignItems: 'center',
  justifyContent: 'center',
});

export const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50vh',
  fontSize: '1.125rem',
  color: '$textSecondary',
} as Record<string, unknown>);

export const ErrorContainer = styled(YStack, {
  name: 'ErrorContainer',
  padding: '2rem',
  alignItems: 'center',
  color: '$danger',
} as Record<string, unknown>);

export const GameWrapper = styled(YStack, {
  name: 'GameWrapper',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: 'visible',
  borderRadius: '$4',
  flexDirection: 'column',

  $md: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    overflow: 'visible',
    minHeight: 'calc(100dvh - 180px)',
  },
  $tablet: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    overflow: 'visible',
  },
  $sm: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
} as Record<string, unknown>);

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  borderWidth: 1,
  borderColor: '$glassBorder',
  borderRadius: 24,
  paddingTop: '3.5rem',
  paddingBottom: '2.5rem',
  paddingHorizontal: '2.5rem',
  maxWidth: 460,
  width: '100%',
  marginHorizontal: 'auto',
  boxShadow:
    '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 0,
  overflow: 'hidden',
} as Record<string, unknown>);

export const IconCircle = styled(YStack, {
  name: 'IconCircle',
  width: 80,
  height: 80,
  borderRadius: 40,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  marginBottom: '1.75rem',
  background:
    'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.18) 100%)',
  borderWidth: 1,
  borderColor: 'rgba(139,92,246,0.25)',
  shadowColor: '#8b5cf6',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 20,
} as Record<string, unknown>);

export const IconEmoji = styled(Text, {
  name: 'IconEmoji',
  fontSize: '2.25rem',
});

export const Title = styled(Text, {
  name: 'Title',
  tag: 'h2',
  fontSize: '1.625rem',
  fontWeight: '700',
  marginBottom: '0.625rem',
  textAlign: 'center',
  letterSpacing: '-0.015em',
  color: '$accent',
});

export const Description = styled(YStack, {
  name: 'Description',
  marginBottom: '2rem',
  paddingHorizontal: '1rem',
  alignItems: 'center',
});

export const DescriptionText = styled(Text, {
  name: 'DescriptionText',
  color: '$color',
  opacity: 0.6,
  lineHeight: 22,
  fontSize: '0.9375rem',
  textAlign: 'center',
});

export const Form = styled(YStack, {
  name: 'Form',
  tag: 'form',
  width: '100%',
  flexDirection: 'column',
  gap: '1rem',
} as Record<string, unknown>);

export const InputRow = styled(YStack, {
  name: 'InputRow',
  width: '100%',
  gap: '0.75rem',
} as Record<string, unknown>);

export const InputGroup = styled(XStack, {
  name: 'InputGroup',
  gap: '0.75rem',
  width: '100%',
} as Record<string, unknown>);

export const ErrorBanner = styled(XStack, {
  name: 'ErrorBanner',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  backgroundColor: 'rgba(239,68,68,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(239,68,68,0.15)',
  borderRadius: 12,
  padding: '0.75rem 1rem',
});

export const ErrorMessage = styled(YStack, {
  name: 'ErrorMessage',
  backgroundColor: '$errorBg',
  paddingVertical: '0.75rem',
  paddingHorizontal: '2rem',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '$errorBorder',
  alignItems: 'center',
  alignSelf: 'center',
});

export const ErrorText = styled(Text, {
  name: 'ErrorText',
  color: '$error',
  fontSize: '0.875rem',
  fontWeight: '600',
  textAlign: 'center',
});

export { UIInput as Input };

export const LoginLink = styled(YStack, {
  name: 'LoginLink',
  tag: 'a',
  color: '$accent',
  textDecoration: 'underline',
  marginTop: '1rem',
  display: 'inline-block',
} as Record<string, unknown>);

export const LockIcon = styled(Text, {
  name: 'LockIcon',
  fontSize: '2rem',
  textAlign: 'center',
});

export const NoticeMessage = styled(Text, {
  name: 'NoticeMessage',
  color: '$accent',
  fontSize: '0.8125rem',
  backgroundColor: 'rgba(139,92,246,0.08)',
  padding: '0.625rem 1rem',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(139,92,246,0.12)',
  textAlign: 'center',
  alignSelf: 'center',
});

export const PasswordToggle = styled(Text, {
  name: 'PasswordToggle',
  color: 'rgba(236,239,238,0.4)',
  fontSize: '0.8125rem',
  textAlign: 'center',
  marginTop: '-0.25rem',
});
