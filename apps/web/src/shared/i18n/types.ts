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
  "exploding-kittens"?: { name?: string };
  "exploding-cats"?: { name?: string };
  "texas-holdem"?: { name?: string };
  coup?: { name?: string };
  "pandemic-lite"?: { name?: string };
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
    hostLabel?: string;
    playersLabel?: string;
    statusLabel?: string;
    visibilityLabel?: string;
    visibility?: {
      public?: string;
      private?: string;
    };
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
  roomPage?: {
    loading?: string;
    loadingGame?: string;
    errors?: {
      notAuthenticated?: string;
      loginButton?: string;
      loadingRoom?: string;
      roomNotFound?: string;
      unsupportedGame?: string;
    };
  };
  table?: {
    cards?: {
      explodingCat?: string;
      defuse?: string;
      attack?: string;
      skip?: string;
      favor?: string;
      shuffle?: string;
      seeTheFuture?: string;
      tacocat?: string;
      hairyPotatoCat?: string;
      rainbowRalphingCat?: string;
      cattermelon?: string;
      beardedCat?: string;
      generic?: string;
    };
    actions?: {
      start?: string;
      starting?: string;
      draw?: string;
      drawing?: string;
      playSkip?: string;
      playingSkip?: string;
      playAttack?: string;
      playingAttack?: string;
    };
    state?: {
      deck?: string;
      discard?: string;
      pendingDraws?: string;
      cards?: string;
      card?: string;
    };
    players?: {
      you?: string;
      alive?: string;
      eliminated?: string;
      yourTurn?: string;
      waitingFor?: string;
    };
    lobby?: {
      waitingToStart?: string;
      playersInLobby?: string;
      needTwoPlayers?: string;
      hostCanStart?: string;
      waitingForHost?: string;
    };
    hand?: {
      title?: string;
      empty?: string;
    };
    log?: {
      title?: string;
      empty?: string;
    };
    chat?: {
      title?: string;
      empty?: string;
      send?: string;
      show?: string;
      hide?: string;
      placeholderAll?: string;
      placeholderPlayers?: string;
      hintAll?: string;
      hintPlayers?: string;
      scope?: {
        all?: string;
        players?: string;
      };
    };
    eliminated?: {
      title?: string;
      message?: string;
    };
    fullscreen?: {
      enter?: string;
      exit?: string;
      hint?: string;
    };
    controlPanel?: {
      fullscreen?: string;
      exitFullscreen?: string;
      enterFullscreen?: string;
      leaveRoom?: string;
      moveControls?: {
        moveUp?: string;
        moveDown?: string;
        moveLeft?: string;
        moveRight?: string;
        centerView?: string;
        shortcuts?: {
          up?: string;
          down?: string;
          left?: string;
          right?: string;
          center?: string;
          fullscreen?: string;
          exitFullscreen?: string;
        };
      };
    };
  };
};

export type HistoryMessages = {
  unknownGame?: string;
  loading?: string;
  list?: {
    emptyNoEntries?: string;
    emptySignedOut?: string;
  };
  search?: {
    label?: string;
    placeholder?: string;
    noResults?: string;
  };
  filter?: {
    label?: string;
    all?: string;
    clear?: string;
  };
  pagination?: {
    showing?: string;
    loadMore?: string;
    loading?: string;
  };
  status?: {
    lobby?: string;
    in_progress?: string;
    inProgress?: string;
    completed?: string;
    waiting?: string;
    active?: string;
    abandoned?: string;
  };
  actions?: {
    viewDetails?: string;
    refresh?: string;
    retry?: string;
  };
  detail?: {
    backToList?: string;
    loading?: string;
    lastActivity?: string;
    rematchTitle?: string;
    rematchDescription?: string;
    rematchAction?: string;
    rematchCreating?: string;
    participantsTitle?: string;
    hostLabel?: string;
    removeTitle?: string;
    removeDescription?: string;
    removeAction?: string;
    removeConfirm?: string;
    removeRemoving?: string;
    removeCancel?: string;
    logsTitle?: string;
    noLogs?: string;
    scopePlayers?: string;
    scopeAll?: string;
    sender?: string;
  };
  errors?: {
    authRequired?: string;
    detailRemoved?: string;
    detailFailed?: string;
    rematchMinimum?: string;
    removeFailed?: string;
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
  legal?: {
    nav?: {
      terms?: string;
      privacy?: string;
      contact?: string;
    };
    terms?: import("./messages/legal/types").TermsMessages;
    privacy?: import("./messages/legal/types").PrivacyMessages;
    contact?: import("./messages/legal/types").ContactMessages;
  };
};
