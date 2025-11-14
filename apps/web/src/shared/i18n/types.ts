import type { ThemePreference } from "../config/theme";

export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LanguagePreference = Locale;

export const DEFAULT_LOCALE: Locale = "en";

export type HomeMessages = {
  kicker?: string;
  tagline?: string;
  description?: string;
  primaryCtaLabel?: string;
  supportCtaLabel?: string;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
};

export type ThemeOptionMessages = {
  label?: string;
  description?: string;
};

export type SettingsMessages = {
  title?: string;
  description?: string;
  appearanceTitle?: string;
  appearanceDescription?: string;
  themeOptions?: Partial<Record<ThemePreference, ThemeOptionMessages>>;
  languageTitle?: string;
  languageDescription?: string;
  languageOptionLabels?: Partial<Record<Locale, string>>;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
  accountTitle?: string;
  accountDescription?: string;
  accountGuestStatus?: string;
  accountPrimaryCta?: string;
  accountSupportCtaLabel?: string;
};

export type AuthMessages = {
  badge?: string;
  title?: string;
  description?: string;
  statusHeadline?: string;
  statusDescription?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
  homeLinkLabel?: string;
  shortcuts?: {
    browseGames?: string;
  };
  sections?: {
    local?: string;
    oauth?: string;
    status?: string;
  };
  providers?: {
    guest?: string;
    local?: string;
    oauth?: string;
  };
  statuses?: {
    processing?: string;
    redirecting?: string;
    loadingSession?: string;
  };
  local?: {
    loginTitle?: string;
    registerTitle?: string;
    helper?: {
      allowedCharacters?: string;
    };
    errors?: {
      passwordMismatch?: string;
      usernameTooShort?: string;
    };
  };
  oauth?: {
    title?: string;
    loginButton?: string;
    logoutButton?: string;
    accessTokenLabel?: string;
    authorizationCodeLabel?: string;
  };
  statusCard?: {
    heading?: string;
    description?: string;
    sessionActive?: string;
    signOutLabel?: string;
    guestDescription?: string;
    details?: {
      provider?: string;
      displayName?: string;
      userId?: string;
      accessExpires?: string;
      refreshExpires?: string;
      updated?: string;
      sessionAccessToken?: string;
      refreshToken?: string;
    };
  };
};

export type TeamMemberMessages = {
  role?: string;
  bio?: string;
};

export type ActionMessages = {
  title?: string;
  description?: string;
  cta?: string;
  successMessage?: string;
};

export type SupportMessages = {
  title?: string;
  tagline?: string;
  description?: string;
  thanks?: string;
  teamSectionTitle?: string;
  actionsSectionTitle?: string;
  team?: Partial<Record<string, TeamMemberMessages>>;
  actions?: Partial<Record<string, ActionMessages>>;
};

export type CommonMessages = {
  languageNames?: Partial<Record<Locale, string>>;
  labels?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  };
  actions?: {
    login?: string;
    register?: string;
    logout?: string;
    openApp?: string;
  };
  prompts?: {
    haveAccount?: string;
    needAccount?: string;
  };
  statuses?: {
    authenticated?: string;
  };
};

export type NavigationMessages = {
  chatsTab?: string;
  gamesTab?: string;
  historyTab?: string;
  settingsTab?: string;
};

export type ChatMessages = {
  notFound?: string;
  status?: {
    connected?: string;
    connecting?: string;
  };
  input?: {
    placeholder?: string;
    ariaLabel?: string;
  };
  send?: string;
};

export type ChatListMessages = {
  search?: {
    placeholder?: string;
    ariaLabel?: string;
  };
  empty?: {
    noChats?: string;
    unauthenticated?: string;
  };
  messages?: {
    directChat?: string;
  };
};

export type GamesMessages = {
  lounge?: {
    activeTitle?: string;
    emptyTitle?: string;
    filters?: {
      statusLabel?: string;
      participationLabel?: string;
      status?: {
        all?: string;
        lobby?: string;
        in_progress?: string;
        completed?: string;
      };
      participation?: {
        all?: string;
        hosting?: string;
        joined?: string;
        not_joined?: string;
      };
    };
  };
  rooms?: {
    status?: {
      lobby?: string;
      in_progress?: string;
      completed?: string;
    };
    hostedBy?: string;
    participants?: string;
  };
  room?: {
    gameArea?: string;
  };
  detail?: {
    title?: string;
    empty?: string;
  };
  common?: {
    createRoom?: string;
    joinRoom?: string;
    joining?: string;
    watchRoom?: string;
  };
  create?: {
    title?: string;
    sectionGame?: string;
    sectionDetails?: string;
    fieldName?: string;
    namePlaceholder?: string;
    fieldMaxPlayers?: string;
    maxPlayersAria?: string;
    autoPlaceholder?: string;
    fieldVisibility?: string;
    fieldNotes?: string;
    notesPlaceholder?: string;
    notesAria?: string;
    submitCreating?: string;
  };
};

export type HistoryMessages = {
  list?: {
    emptyNoEntries?: string;
    emptySignedOut?: string;
  };
  status?: {
    lobby?: string;
    in_progress?: string;
    completed?: string;
    waiting?: string;
    active?: string;
  };
};

export type PaymentsMessages = {
  title?: string;
  amountLabel?: string;
  amountPlaceholder?: string;
  amountAria?: string;
  currencyLabel?: string;
  currencyPlaceholder?: string;
  currencyAria?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  noteAria?: string;
  submit?: string;
  submitting?: string;
  status?: {
    success?: string;
  };
  errors?: {
    invalidAmount?: string;
    amountTooLarge?: string;
    invalidUrl?: string;
    noUrl?: string;
    failed?: string;
  };
};

export type TranslationBundle = {
  common?: CommonMessages;
  home?: HomeMessages;
  settings?: SettingsMessages;
  support?: SupportMessages;
  auth?: AuthMessages;
  navigation?: NavigationMessages;
  chat?: ChatMessages;
  chatList?: ChatListMessages;
  games?: GamesMessages;
  history?: HistoryMessages;
  payments?: PaymentsMessages;
};
