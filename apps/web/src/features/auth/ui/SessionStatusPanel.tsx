import type { SessionDetailItem, SessionDetailLabels } from "../types";
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
} from "./styles";

interface SessionStatusPanelProps {
  badge: string;
  heading: string;
  description: string;
  statusActiveMessage: string;
  heroStatusHeadline: string;
  guestDescription: string;
  signOutLabel: string;
  loadingStatusLabel: string;
  accessTokenLabel: string;
  sessionDetailLabels: SessionDetailLabels;
  isHydrating: boolean;
  hasSession: boolean;
  isOAuthProvider: boolean;
  sessionAccessToken: string | null;
  sessionRefreshToken: string | null;
  sessionDetails: SessionDetailItem[];
  onSignOut: () => void;
}

export function SessionStatusPanel({
  badge,
  heading,
  description,
  statusActiveMessage,
  heroStatusHeadline,
  guestDescription,
  signOutLabel,
  loadingStatusLabel,
  accessTokenLabel,
  sessionDetailLabels,
  isHydrating,
  hasSession,
  isOAuthProvider,
  sessionAccessToken,
  sessionRefreshToken,
  sessionDetails,
  onSignOut,
}: SessionStatusPanelProps) {
  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{badge}</PanelBadge>
        <PanelTitle>{heading}</PanelTitle>
        <PanelSubtitle>{description}</PanelSubtitle>
      </PanelHeader>
      {isHydrating ? (
        loadingStatusLabel ? <StatusText>{loadingStatusLabel}</StatusText> : null
      ) : (
        <>
          <SessionCallout>
            <CalloutHeading>
              {hasSession ? statusActiveMessage : heroStatusHeadline}
            </CalloutHeading>
            <CalloutDetail>
              {hasSession ? description : guestDescription}
            </CalloutDetail>
            {hasSession ? (
              <ButtonRow>
                <SecondaryButton type="button" onClick={onSignOut}>
                  {signOutLabel}
                </SecondaryButton>
              </ButtonRow>
            ) : null}
          </SessionCallout>
          {hasSession ? (
            <>
              <TokenList>
                {sessionAccessToken ? (
                  <TokenRow>
                    <TokenLabel>
                      {isOAuthProvider
                        ? accessTokenLabel
                        : sessionDetailLabels.sessionAccessToken}
                    </TokenLabel>
                    <TokenValue>{sessionAccessToken}</TokenValue>
                  </TokenRow>
                ) : null}
                {sessionRefreshToken ? (
                  <TokenRow>
                    <TokenLabel>{sessionDetailLabels.refreshToken}</TokenLabel>
                    <TokenValue>{sessionRefreshToken}</TokenValue>
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
