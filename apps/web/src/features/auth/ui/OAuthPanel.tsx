import {
  PanelCard,
  PanelHeader,
  PanelBadge,
  PanelTitle,
  PanelSubtitle,
  ButtonRow,
  PrimaryButton,
  SecondaryButton,
  StatusText,
  ErrorText,
  TokenList,
  TokenRow,
  TokenLabel,
  TokenValue,
} from "./styles";

interface OAuthPanelProps {
  badge: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  logoutLabel: string;
  processingStatusLabel: string;
  redirectingStatusLabel: string;
  authorizationCodeLabel: string;
  accessTokenLabel: string;
  loading: boolean;
  isRedirecting: boolean;
  error: string | null;
  authorizationCode: string | null;
  providerAccessToken: string | null;
  sessionAccessToken: string | null;
  isOAuthProvider: boolean;
  onStartOAuth: () => void;
  onLogout: () => void;
}

export function OAuthPanel({
  badge,
  title,
  subtitle,
  buttonLabel,
  logoutLabel,
  processingStatusLabel,
  redirectingStatusLabel,
  authorizationCodeLabel,
  accessTokenLabel,
  loading,
  isRedirecting,
  error,
  authorizationCode,
  providerAccessToken,
  sessionAccessToken,
  isOAuthProvider,
  onStartOAuth,
  onLogout,
}: OAuthPanelProps) {
  const busy = loading || isRedirecting;
  const showTokens = Boolean(authorizationCode || providerAccessToken);

  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{badge}</PanelBadge>
        <PanelTitle>{title}</PanelTitle>
        <PanelSubtitle>{subtitle}</PanelSubtitle>
      </PanelHeader>
      <ButtonRow>
        <PrimaryButton
          type="button"
          onClick={onStartOAuth}
          disabled={busy}
        >
          {busy && processingStatusLabel ? processingStatusLabel : buttonLabel}
        </PrimaryButton>
        {sessionAccessToken && isOAuthProvider ? (
          <SecondaryButton
            type="button"
            onClick={onLogout}
            disabled={loading}
          >
            {logoutLabel}
          </SecondaryButton>
        ) : null}
      </ButtonRow>
      {isRedirecting && redirectingStatusLabel ? (
        <StatusText>{redirectingStatusLabel}</StatusText>
      ) : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {showTokens ? (
        <TokenList>
          {authorizationCode ? (
            <TokenRow>
              <TokenLabel>{authorizationCodeLabel}</TokenLabel>
              <TokenValue>{authorizationCode}</TokenValue>
            </TokenRow>
          ) : null}
          {providerAccessToken ? (
            <TokenRow>
              <TokenLabel>{accessTokenLabel}</TokenLabel>
              <TokenValue>{providerAccessToken}</TokenValue>
            </TokenRow>
          ) : null}
        </TokenList>
      ) : null}
    </PanelCard>
  );
}
