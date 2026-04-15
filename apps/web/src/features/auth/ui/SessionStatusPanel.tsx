import type { UseAuthFormResult } from '../hooks/useAuthForm';
import { useAuthLabels } from '../hooks';
import { GlassCard, Typography, YStack, XStack } from '@arcadeum/ui';

export function SessionStatusPanel({ auth }: { auth: UseAuthFormResult }) {
  const { isRegisterMode, hasSession, sessionSnapshot } = auth;
  const labels = useAuthLabels(isRegisterMode);
  const { statusHeading, statusDescription, statusActiveMessage } = labels;

  return (
    <GlassCard flex={1} minWidth={320} gap="$4" padding="$5">
      <YStack gap="$1">
        <Typography variant="heading" uiSize="lg">
          {statusHeading}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {statusDescription}
        </Typography>
      </YStack>

      {hasSession && sessionSnapshot ? (
        <YStack gap="$4">
          <YStack
            gap="$1"
            paddingVertical="$3"
            paddingHorizontal="$4"
            borderRadius={16}
            borderWidth={1}
            borderColor="$successBorder"
            backgroundColor="$successBgSoft"
          >
            <Typography variant="heading" uiSize="sm">
              {statusActiveMessage}
            </Typography>
            <Typography variant="body" uiSize="sm" color="$colorMuted">
              User:{' '}
              {sessionSnapshot.userId ||
                sessionSnapshot.displayName ||
                'Authenticated'}
            </Typography>
          </YStack>

          <YStack gap="$2">
            <XStack
              justifyContent="space-between"
              gap="$4"
              alignItems="baseline"
            >
              <Typography variant="body" uiSize="xs" color="$colorMuted">
                Session ID
              </Typography>
              <Typography variant="body" uiSize="sm" fontFamily="$body">
                {sessionSnapshot.userId}
              </Typography>
            </XStack>
            {sessionSnapshot.accessTokenExpiresAt && (
              <XStack
                justifyContent="space-between"
                gap="$4"
                alignItems="baseline"
              >
                <Typography variant="body" uiSize="xs" color="$colorMuted">
                  Expires
                </Typography>
                <Typography variant="body" uiSize="sm" fontFamily="$body">
                  {new Date(
                    sessionSnapshot.accessTokenExpiresAt,
                  ).toLocaleString()}
                </Typography>
              </XStack>
            )}
          </YStack>
        </YStack>
      ) : (
        <YStack gap="$4">
          <YStack
            gap="$1"
            paddingVertical="$3"
            paddingHorizontal="$4"
            borderRadius={16}
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundFocus"
          >
            <Typography variant="heading" uiSize="sm">
              Inactive
            </Typography>
          </YStack>
          <Typography variant="body" uiSize="sm" color="$colorMuted">
            No active session found. Please sign in to access your account.
          </Typography>
        </YStack>
      )}
    </GlassCard>
  );
}
