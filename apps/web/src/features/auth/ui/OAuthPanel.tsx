import { useAuthForm, useAuthLabels } from '../hooks';
import { Button, XStack, YStack, GlassCard, Typography } from '@arcadeum/ui';

export function OAuthPanel() {
  const { isRegisterMode, authorizationCode, handleStartOAuth, oauthLoading } =
    useAuthForm();
  const labels = useAuthLabels(isRegisterMode);
  const {
    oauthTitle,
    oauthSubtitle,
    oauthAuthorizationCodeLabel,
    oauthEmptyState,
    oauthButtonLabel,
  } = labels;

  return (
    <GlassCard flex={1} minWidth={320} gap="$4" padding="$5">
      <YStack gap="$1">
        <Typography variant="heading" uiSize="lg">
          {oauthTitle}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {oauthSubtitle}
        </Typography>
      </YStack>

      <XStack gap="$3" flexWrap="wrap">
        <Button
          onPress={handleStartOAuth}
          disabled={oauthLoading}
          variant="primary"
          pill
        >
          {oauthButtonLabel || 'Sign in with Google'}
        </Button>
      </XStack>

      {authorizationCode ? (
        <YStack gap="$2" marginTop="$2">
          <YStack gap="$1">
            <Typography variant="label" uiSize="xs" color="$colorMuted">
              {oauthAuthorizationCodeLabel}
            </Typography>
            <YStack
              padding="$2.5"
              borderRadius={10}
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="$background"
            >
              <Typography
                variant="body"
                uiSize="xs"
                color="$accent"
                fontFamily="$body"
              >
                {authorizationCode}
              </Typography>
            </YStack>
          </YStack>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              if (authorizationCode) {
                void navigator.clipboard.writeText(authorizationCode);
              }
            }}
            pill
            alignSelf="flex-start"
          >
            Copy Code
          </Button>
        </YStack>
      ) : (
        !oauthLoading && (
          <Typography variant="body" uiSize="sm" color="$colorMuted">
            {oauthEmptyState}
          </Typography>
        )
      )}
    </GlassCard>
  );
}
