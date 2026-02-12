import type { SessionDetailItem, SessionDetailLabels } from '../types';
import {
  PanelCard,
  PanelHeader,
  PanelBadge,
  PanelTitle,
  PanelSubtitle,
  StatusText,
  SessionCallout,
  CalloutHeading,
  CalloutDetail,
  ButtonRow,
  SecondaryButton,
  TokenList,
  TokenRow,
  TokenLabel,
  TokenValue,
  SessionDetailList,
  SessionDetailRow,
  SessionDetailTerm,
  SessionDetailValue,
  EmptyState,
} from './styles';

export interface SessionStatusPanelLabels {
  statusBadge: string;
  statusHeading: string;
  statusDescription: string;
  statusActiveMessage: string;
  heroStatusHeadline: string;
  guestDescription: string;
  signOutLabel: string;
  loadingStatusLabel: string;
  oauthAccessTokenLabel: string;
  sessionDetailLabels: SessionDetailLabels;
}

export interface SessionStatusPanelForm {
  isSessionHydrating: boolean;
  hasSession: boolean;
  sessionSnapshot: {
    provider: string | null;
    accessToken: string | null;
    refreshToken: string | null;
  };
  handleSignOut: () => Promise<void>;
}

interface SessionStatusPanelProps {
  labels: SessionStatusPanelLabels;
  form: SessionStatusPanelForm;
  sessionDetails: SessionDetailItem[];
}

export function SessionStatusPanel({
  labels,
  form,
  sessionDetails,
}: SessionStatusPanelProps) {
  const {
    statusBadge,
    statusHeading,
    statusDescription,
    statusActiveMessage,
    heroStatusHeadline,
    guestDescription,
    signOutLabel,
    loadingStatusLabel,
    oauthAccessTokenLabel,
    sessionDetailLabels,
  } = labels;

  const { isSessionHydrating, hasSession, sessionSnapshot, handleSignOut } =
    form;

  const isOAuthProvider = sessionSnapshot.provider === 'oauth';

  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{statusBadge}</PanelBadge>
        <PanelTitle>{statusHeading}</PanelTitle>
        <PanelSubtitle>{statusDescription}</PanelSubtitle>
      </PanelHeader>
      {isSessionHydrating ? (
        loadingStatusLabel ? (
          <StatusText>{loadingStatusLabel}</StatusText>
        ) : null
      ) : (
        <>
          <SessionCallout>
            <CalloutHeading>
              {hasSession ? statusActiveMessage : heroStatusHeadline}
            </CalloutHeading>
            <CalloutDetail>
              {hasSession ? statusDescription : guestDescription}
            </CalloutDetail>
            {hasSession ? (
              <ButtonRow>
                <SecondaryButton
                  type="button"
                  onClick={() => void handleSignOut()}
                >
                  {signOutLabel}
                </SecondaryButton>
              </ButtonRow>
            ) : null}
          </SessionCallout>
          {hasSession ? (
            <>
              <TokenList>
                {sessionSnapshot.accessToken ? (
                  <TokenRow>
                    <TokenLabel>
                      {isOAuthProvider
                        ? oauthAccessTokenLabel
                        : sessionDetailLabels.sessionAccessToken}
                    </TokenLabel>
                    <TokenValue>{sessionSnapshot.accessToken}</TokenValue>
                  </TokenRow>
                ) : null}
                {sessionSnapshot.refreshToken ? (
                  <TokenRow>
                    <TokenLabel>{sessionDetailLabels.refreshToken}</TokenLabel>
                    <TokenValue>{sessionSnapshot.refreshToken}</TokenValue>
                  </TokenRow>
                ) : null}
              </TokenList>
              <SessionDetailList>
                {sessionDetails.map(({ key, term, value }) =>
                  value ? (
                    <SessionDetailRow key={key}>
                      <SessionDetailTerm>{term ?? key}</SessionDetailTerm>
                      <SessionDetailValue>{value}</SessionDetailValue>
                    </SessionDetailRow>
                  ) : null,
                )}
              </SessionDetailList>
            </>
          ) : (
            <EmptyState>{guestDescription}</EmptyState>
          )}
        </>
      )}
    </PanelCard>
  );
}
