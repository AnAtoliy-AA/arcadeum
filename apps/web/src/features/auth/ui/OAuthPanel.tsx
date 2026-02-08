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
} from './styles';

export interface OAuthPanelLabels {
  oauthBadge: string;
  oauthTitle: string;
  heroStatusDescription: string;
  oauthButtonLabel: string;
  oauthLogoutLabel: string;
  processingStatusLabel: string;
  redirectingStatusLabel: string;
  oauthAuthorizationCodeLabel: string;
  oauthAccessTokenLabel: string;
}

export interface OAuthPanelForm {
  oauthLoading: boolean;
  isRedirecting: boolean;
  oauthError: string | null;
  authorizationCode: string | null;
  providerAccessToken: string | null;
  sessionSnapshot: {
    accessToken: string | null;
    provider: string | null;
  };
  handleStartOAuth: () => void;
  handleOAuthLogout: () => Promise<void>;
}

interface OAuthPanelProps {
  labels: OAuthPanelLabels;
  form: OAuthPanelForm;
}

export function OAuthPanel({ labels, form }: OAuthPanelProps) {
  const {
    oauthBadge,
    oauthTitle,
    heroStatusDescription,
    oauthButtonLabel,
    oauthLogoutLabel,
    processingStatusLabel,
    redirectingStatusLabel,
    oauthAuthorizationCodeLabel,
    oauthAccessTokenLabel,
  } = labels;

  const {
    oauthLoading,
    isRedirecting,
    oauthError,
    authorizationCode,
    providerAccessToken,
    sessionSnapshot,
    handleStartOAuth,
    handleOAuthLogout,
  } = form;

  const busy = oauthLoading || isRedirecting;
  const showTokens = Boolean(authorizationCode || providerAccessToken);
  const isOAuthProvider = sessionSnapshot.provider === 'oauth';

  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{oauthBadge}</PanelBadge>
        <PanelTitle>{oauthTitle}</PanelTitle>
        <PanelSubtitle>{heroStatusDescription}</PanelSubtitle>
      </PanelHeader>
      <ButtonRow>
        <PrimaryButton type="button" onClick={handleStartOAuth} disabled={busy}>
          {busy && processingStatusLabel
            ? processingStatusLabel
            : oauthButtonLabel}
        </PrimaryButton>
        {sessionSnapshot.accessToken && isOAuthProvider ? (
          <SecondaryButton
            type="button"
            onClick={() => void handleOAuthLogout()}
            disabled={oauthLoading}
          >
            {oauthLogoutLabel}
          </SecondaryButton>
        ) : null}
      </ButtonRow>
      {isRedirecting && redirectingStatusLabel ? (
        <StatusText>{redirectingStatusLabel}</StatusText>
      ) : null}
      {oauthError ? <ErrorText>{oauthError}</ErrorText> : null}
      {showTokens ? (
        <TokenList>
          {authorizationCode ? (
            <TokenRow>
              <TokenLabel>{oauthAuthorizationCodeLabel}</TokenLabel>
              <TokenValue>{authorizationCode}</TokenValue>
            </TokenRow>
          ) : null}
          {providerAccessToken ? (
            <TokenRow>
              <TokenLabel>{oauthAccessTokenLabel}</TokenLabel>
              <TokenValue>{providerAccessToken}</TokenValue>
            </TokenRow>
          ) : null}
        </TokenList>
      ) : null}
    </PanelCard>
  );
}
