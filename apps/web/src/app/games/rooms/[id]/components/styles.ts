import { Main, styled, XStack, YStack } from 'tamagui';
import { Input as UIInput } from '@arcadeum/ui';

// ─── Fullscreen CSS for Container ─────────────────────────────────────────────
export const fullscreenStyles = `
  .games-room-container:fullscreen,
  .games-room-container:-webkit-full-screen,
  .games-room-container:-moz-full-screen {
    max-width: 100% !important;
    width: 100% !important;
    height: 100% !important;
    background: #151718 !important;
    padding: 1rem 2rem !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
`;

export const Page = styled(Main, {
  name: 'Page',
  height: '100vh',
  flexDirection: 'column',
  backgroundColor: '$background',
  color: '$color',
  position: 'relative',
  overflow: 'hidden',
} as Record<string, unknown>);

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
  overflowY: 'hidden',
  $tablet: {
    padding: '$3',
    gap: '$3',
    flex: 1,
    overflowY: 'auto',
  },
  $sm: {
    padding: '$3',
    gap: '$3',
    flex: 1,
    overflowY: 'auto',
  },
} as Record<string, unknown>);

export const LoadingContainer = styled(YStack, {
  name: 'LoadingContainer',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50vh',
  fontSize: '1.125rem',
  color: 'rgba(236,239,238,0.7)',
} as Record<string, unknown>);

export const ErrorContainer = styled(YStack, {
  name: 'ErrorContainer',
  padding: '2rem',
  alignItems: 'center',
  color: '#dc2626',
} as Record<string, unknown>);

export const GameWrapper = styled(YStack, {
  name: 'GameWrapper',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: 'auto',
  flexDirection: 'column',

  $md: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  $tablet: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  $sm: {
    flex: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
} as Record<string, unknown>);

// Glassmorphism card — no GlassCard in @arcadeum/ui, use YStack with inline styles
export const Card = styled(YStack, {
  name: 'Card',
  background: 'rgba(30,30,40,0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 24,
  padding: '3rem 2rem',
  maxWidth: 480,
  width: '100%',
  marginHorizontal: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  flexDirection: 'column',
  alignItems: 'center',
} as Record<string, unknown>);

// Title: rendered with gradient via inline style in consuming component
export const Title = styled(YStack, {
  name: 'Title',
  tag: 'h2',
  fontSize: '1.75rem',
  fontWeight: '700',
  marginBottom: '0.75rem',
} as Record<string, unknown>);

export const titleGradientStyle = {
  background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

export const Description = styled(YStack, {
  name: 'Description',
  tag: 'p',
  color: 'rgba(236,239,238,0.7)',
  marginBottom: '2rem',
  lineHeight: 1.6,
  fontSize: '1rem',
} as Record<string, unknown>);

export const Form = styled(YStack, {
  name: 'Form',
  tag: 'form',
  width: '100%',
  flexDirection: 'column',
  gap: '1rem',
} as Record<string, unknown>);

export const InputGroup = styled(XStack, {
  name: 'InputGroup',
  gap: '$4',
  width: '100%',
} as Record<string, unknown>);

export const ErrorMessage = styled(YStack, {
  name: 'ErrorMessage',
  color: '#ef4444',
  fontSize: '0.875rem',
  background: 'rgba(239,68,68,0.1)',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: 'rgba(239,68,68,0.2)',
} as Record<string, unknown>);

// Input: use @arcadeum/ui Input instead of styled.input
export { UIInput as Input };

export const LoginLink = styled(YStack, {
  name: 'LoginLink',
  tag: 'a',
  color: '$accent',
  textDecoration: 'underline',
  marginTop: '1rem',
  display: 'inline-block',
} as Record<string, unknown>);

export const LockIcon = styled(YStack, {
  name: 'LockIcon',
  fontSize: '3rem',
  marginBottom: '1rem',
  justifyContent: 'center',
  alignItems: 'center',
} as Record<string, unknown>);

export const NoticeMessage = styled(YStack, {
  name: 'NoticeMessage',
  color: '$accent',
  fontSize: '0.875rem',
  background: '$backgroundHover',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '$borderColor',
} as Record<string, unknown>);
