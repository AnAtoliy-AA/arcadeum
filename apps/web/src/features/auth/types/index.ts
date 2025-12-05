import type { AuthMessages } from "@/shared/i18n/types";

/**
 * Provider copy type for translation labels
 */
export type ProviderCopy = AuthMessages["providers"];

/**
 * Session detail item for displaying session information
 */
export interface SessionDetailItem {
  key: string;
  term: string;
  value: string | null | undefined;
}

/**
 * Labels for session status details
 */
export interface SessionDetailLabels {
  provider: string;
  displayName: string;
  userId: string;
  accessExpires: string;
  refreshExpires: string;
  updated: string;
  sessionAccessToken: string;
  refreshToken: string;
}
