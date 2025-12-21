import type { Locale } from "../../types";
import type { LegalMessages } from "./types";
import { legalMessagesEn } from "./en";
import { legalMessagesEs } from "./es";
import { legalMessagesFr } from "./fr";

export type { LegalMessages, TermsMessages, PrivacyMessages, ContactMessages } from "./types";

export const legalMessages: Record<Locale, LegalMessages> = {
  en: legalMessagesEn,
  es: legalMessagesEs,
  fr: legalMessagesFr,
};
