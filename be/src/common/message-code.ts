export enum MessageCode {
  GenericSuccess = 0,
  UnknownError = 1000,
  ValidationError = 1001,
  PaymentsInvalidAmount = 2000,
  PaymentsMissingRedirects = 2001,
  PaymentsMissingCallback = 2002,
  PaymentsSessionFailed = 2003,
  PaymentsMissingConfig = 2004,
  GamesUserIdRequired = 3000,
  GamesRoomIdRequired = 3001,
  GamesMessageRequired = 3002,
  GamesRoomNotInProgress = 3003,
  GamesHostIdRequired = 3004,
  GamesGameIdRequired = 3005,
  GamesRematchGameIdRequired = 3006,
  GamesRoomNameRequired = 3007,
  GamesMaxPlayersMinimum = 3008,
  GamesRoomOrInviteRequired = 3009,
  GamesRoomClosed = 3010,
  GamesRoomFull = 3011,
  GamesRoomAccessForbidden = 3012,
  GamesInviteCodeRequired = 3013,
  GamesRoomNotFound = 3014,
  GamesSessionNotFound = 3015,
  GamesEngineRequired = 3016,
  GamesTargetRequired = 3017,
  GamesTargetUnavailable = 3018,
  GamesComboUnavailable = 3019,
  GamesCardNotInHand = 3020,
  GamesActionCardUnsupported = 3021,
  GamesCatUnsupported = 3022,
  GamesComboModeUnsupported = 3023,
  GamesComboRemovalFailed = 3024,
  GamesDeckEmpty = 3025,
  GamesHostOnlyStart = 3026,
  GamesHostOnlyDelete = 3027,
  GamesPlayerNotParticipant = 3028,
  GamesPlayerEliminated = 3029,
  GamesNotYourTurnDraw = 3030,
  GamesNotYourTurnPlay = 3031,
  GamesNotParticipant = 3032,
  GamesSnapshotUnavailable = 3033,
  GamesRoomInactive = 3034,
  GamesComboNotAllowed = 3035,
  GamesCannotPlayCardNow = 3036,
  GamesJoinBeforeSession = 3037,
  GamesHistoryAccessForbidden = 3038,
  GamesRematchParticipantRequired = 3039,
  GamesStartRequiresTwoPlayers = 3040,
  GamesCatCombosExplodingOnly = 3041,
  GamesDesiredCardRequired = 3042,
  GamesDrawActionExplodingOnly = 3043,
  GamesExplodingCatsDisabled = 3044,
  GamesHistoryNotesExplodingOnly = 3045,
  GamesOriginalHostOnlyRematch = 3046,
  GamesPlayActionExplodingOnly = 3047,
  GamesTargetMustDiffer = 3048,
  GamesNoActivePlayers = 3049,
  GamesNotInLobbyPhase = 3050,
  GamesSessionAlreadyActive = 3051,
  GamesWsRoomIdRequired = 3100,
  GamesWsUserIdRequired = 3101,
  GamesWsMessageRequired = 3102,
  GamesWsCardNotSupported = 3103,
  GamesWsCatRequired = 3104,
  GamesWsCatNotSupported = 3105,
  GamesWsModeRequired = 3106,
  GamesWsDesiredCardRequired = 3107,
  GamesWsTargetPlayerIdRequired = 3108,
  AuthMissingOauthIssuer = 4000,
  AuthOidcDiscoveryFailed = 4001,
  AuthMissingWebClientId = 4002,
  AuthMissingWebClientSecret = 4003,
  AuthMissingRedirectUri = 4004,
  AuthNoTokenEndpoint = 4005,
  AuthFailedToParseTokenResponse = 4006,
  AuthEmailAlreadyRegistered = 4007,
  AuthUsernameTaken = 4008,
  AuthInvalidCredentials = 4009,
  AuthUnsupportedOauthProvider = 4010,
  AuthMissingOauthCredentials = 4011,
  AuthGoogleEmailNotVerified = 4012,
  AuthMissingRefreshToken = 4013,
  AuthInvalidRefreshToken = 4014,
  AuthRefreshTokenRevoked = 4015,
  AuthRefreshTokenExpired = 4016,
  AuthUserNotFoundForRefreshToken = 4017,
  AuthOauthClientMismatch = 4018,
  AuthUnableToValidateOauthTokens = 4019,
  AuthTokenExchangeMissingAccessToken = 4020,
  ChatUserContextMissing = 5000,
  ChatWsChatIdRequired = 5001,
  ChatWsCurrentUserIdRequired = 5002,
  ChatAdditionalParticipantRequired = 5003,
}

type LookupEntry = {
  match: string | RegExp;
  code: MessageCode;
};
const STRING_CODE_MAP: Record<string, MessageCode> = {
  // Payments
  'payments.invalidAmount': MessageCode.PaymentsInvalidAmount,
  'payments.missingRedirects': MessageCode.PaymentsMissingRedirects,
  'payments.missingCallback': MessageCode.PaymentsMissingCallback,
  'payments.sessionFailed': MessageCode.PaymentsSessionFailed,

  // Games (HTTP)
  'games.userIdRequired': MessageCode.GamesUserIdRequired,
  'User ID is required.': MessageCode.GamesUserIdRequired,
  'games.roomIdRequired': MessageCode.GamesRoomIdRequired,
  'Room ID is required.': MessageCode.GamesRoomIdRequired,
  'games.messageRequired': MessageCode.GamesMessageRequired,
  'Message must not be empty.': MessageCode.GamesMessageRequired,
  'games.roomNotInProgress': MessageCode.GamesRoomNotInProgress,
  'The game has not started for this room.': MessageCode.GamesRoomNotInProgress,
  'games.hostIdRequired': MessageCode.GamesHostIdRequired,
  'Host ID is required.': MessageCode.GamesHostIdRequired,
  'Host identifier is required.': MessageCode.GamesHostIdRequired,
  'games.gameIdRequired': MessageCode.GamesGameIdRequired,
  'Game ID is required.': MessageCode.GamesGameIdRequired,
  'games.rematchGameIdRequired': MessageCode.GamesRematchGameIdRequired,
  'Game ID is required for rematch.': MessageCode.GamesRematchGameIdRequired,
  'games.roomNameRequired': MessageCode.GamesRoomNameRequired,
  'Room name is required.': MessageCode.GamesRoomNameRequired,
  'games.maxPlayersMinimum': MessageCode.GamesMaxPlayersMinimum,
  'Max players must be at least 2.': MessageCode.GamesMaxPlayersMinimum,
  'games.roomOrInviteRequired': MessageCode.GamesRoomOrInviteRequired,
  'Provide either roomId or inviteCode.': MessageCode.GamesRoomOrInviteRequired,
  'games.roomClosed': MessageCode.GamesRoomClosed,
  'Room is no longer accepting players.': MessageCode.GamesRoomClosed,
  'games.roomFull': MessageCode.GamesRoomFull,
  'Room is full.': MessageCode.GamesRoomFull,
  'games.roomAccessForbidden': MessageCode.GamesRoomAccessForbidden,
  'Access to this room is not permitted.': MessageCode.GamesRoomAccessForbidden,
  'games.inviteCodeRequired': MessageCode.GamesInviteCodeRequired,
  'Invite code required to join this room.':
    MessageCode.GamesInviteCodeRequired,
  'games.roomNotFound': MessageCode.GamesRoomNotFound,
  'Game room not found.': MessageCode.GamesRoomNotFound,
  'games.sessionNotFound': MessageCode.GamesSessionNotFound,
  'Game session not found for room.': MessageCode.GamesSessionNotFound,
  'Game session not found for this room.': MessageCode.GamesSessionNotFound,
  'games.engineRequired': MessageCode.GamesEngineRequired,
  'Engine identifier is required.': MessageCode.GamesEngineRequired,
  'games.targetRequired': MessageCode.GamesTargetRequired,
  'Target player is required.': MessageCode.GamesTargetRequired,
  'games.targetUnavailable': MessageCode.GamesTargetUnavailable,
  'Target player is not available.': MessageCode.GamesTargetUnavailable,
  'games.comboUnavailable': MessageCode.GamesComboUnavailable,
  'Card combo is not available.': MessageCode.GamesComboUnavailable,
  'games.cardNotInHand': MessageCode.GamesCardNotInHand,
  'Card is not available in hand.': MessageCode.GamesCardNotInHand,
  'games.actionCardUnsupported': MessageCode.GamesActionCardUnsupported,
  'Unsupported action card.': MessageCode.GamesActionCardUnsupported,
  'games.catUnsupported': MessageCode.GamesCatUnsupported,
  'Unsupported cat card.': MessageCode.GamesCatUnsupported,
  'games.comboModeUnsupported': MessageCode.GamesComboModeUnsupported,
  'Unsupported combo mode.': MessageCode.GamesComboModeUnsupported,
  'games.comboRemovalFailed': MessageCode.GamesComboRemovalFailed,
  'Unable to remove combo cards from hand.':
    MessageCode.GamesComboRemovalFailed,
  'games.deckEmpty': MessageCode.GamesDeckEmpty,
  'The deck has no cards remaining.': MessageCode.GamesDeckEmpty,
  'Deck is empty.': MessageCode.GamesDeckEmpty,
  'games.hostOnlyStart': MessageCode.GamesHostOnlyStart,
  'Only the host can start this game.': MessageCode.GamesHostOnlyStart,
  'games.hostOnlyDelete': MessageCode.GamesHostOnlyDelete,
  'Only the host can delete this room.': MessageCode.GamesHostOnlyDelete,
  'games.playerNotParticipant': MessageCode.GamesPlayerNotParticipant,
  'Player is not part of this session.': MessageCode.GamesPlayerNotParticipant,
  'games.playerEliminated': MessageCode.GamesPlayerEliminated,
  'Player has already been eliminated.': MessageCode.GamesPlayerEliminated,
  'games.notYourTurnDraw': MessageCode.GamesNotYourTurnDraw,
  'It is not your turn to draw.': MessageCode.GamesNotYourTurnDraw,
  'games.notYourTurnPlay': MessageCode.GamesNotYourTurnPlay,
  'It is not your turn to play.': MessageCode.GamesNotYourTurnPlay,
  'games.notParticipant': MessageCode.GamesNotParticipant,
  'You are not a participant of this room.': MessageCode.GamesNotParticipant,
  'games.snapshotUnavailable': MessageCode.GamesSnapshotUnavailable,
  'Exploding Cats snapshot is unavailable.':
    MessageCode.GamesSnapshotUnavailable,
  'games.roomInactive': MessageCode.GamesRoomInactive,
  'Room is no longer active.': MessageCode.GamesRoomInactive,
  'games.comboNotAllowed': MessageCode.GamesComboNotAllowed,
  'Combo not allowed.': MessageCode.GamesComboNotAllowed,
  'games.cannotPlayCardNow': MessageCode.GamesCannotPlayCardNow,
  'Cannot play this card right now.': MessageCode.GamesCannotPlayCardNow,
  'games.joinBeforeSession': MessageCode.GamesJoinBeforeSession,
  'Join the room before requesting the session.':
    MessageCode.GamesJoinBeforeSession,
  'games.historyAccessForbidden': MessageCode.GamesHistoryAccessForbidden,
  'Access to this history entry is not permitted.':
    MessageCode.GamesHistoryAccessForbidden,
  'games.rematchParticipantRequired':
    MessageCode.GamesRematchParticipantRequired,
  'At least one consenting participant is required for a rematch.':
    MessageCode.GamesRematchParticipantRequired,
  'games.startRequiresTwoPlayers': MessageCode.GamesStartRequiresTwoPlayers,
  'At least two players are required to start.':
    MessageCode.GamesStartRequiresTwoPlayers,
  'games.catCombosExplodingOnly': MessageCode.GamesCatCombosExplodingOnly,
  'Cat combos are only supported for Exploding Cats sessions.':
    MessageCode.GamesCatCombosExplodingOnly,
  'games.desiredCardRequired': MessageCode.GamesDesiredCardRequired,
  'Desired card is required for trio combo.':
    MessageCode.GamesDesiredCardRequired,
  'games.drawActionExplodingOnly': MessageCode.GamesDrawActionExplodingOnly,
  'Draw action is only supported for Exploding Cats sessions.':
    MessageCode.GamesDrawActionExplodingOnly,
  'games.explodingCatsDisabled': MessageCode.GamesExplodingCatsDisabled,
  'Exploding Cats is not enabled for this room.':
    MessageCode.GamesExplodingCatsDisabled,
  'games.historyNotesExplodingOnly': MessageCode.GamesHistoryNotesExplodingOnly,
  'History notes are only supported for Exploding Cats sessions.':
    MessageCode.GamesHistoryNotesExplodingOnly,
  'games.originalHostOnlyRematch': MessageCode.GamesOriginalHostOnlyRematch,
  'Only the original host may initiate a rematch.':
    MessageCode.GamesOriginalHostOnlyRematch,
  'games.playActionExplodingOnly': MessageCode.GamesPlayActionExplodingOnly,
  'Play action is only supported for Exploding Cats sessions.':
    MessageCode.GamesPlayActionExplodingOnly,
  'games.targetMustDiffer': MessageCode.GamesTargetMustDiffer,
  'Target player must be different from actor.':
    MessageCode.GamesTargetMustDiffer,
  'games.noActivePlayers': MessageCode.GamesNoActivePlayers,
  'There are no active players in this session.':
    MessageCode.GamesNoActivePlayers,
  'games.notInLobbyPhase': MessageCode.GamesNotInLobbyPhase,
  'This room is no longer in the lobby phase.':
    MessageCode.GamesNotInLobbyPhase,
  'games.sessionAlreadyActive': MessageCode.GamesSessionAlreadyActive,
  'An active session already exists for this room.':
    MessageCode.GamesSessionAlreadyActive,

  // Games (WebSocket)
  'roomId is required.': MessageCode.GamesWsRoomIdRequired,
  'userId is required.': MessageCode.GamesWsUserIdRequired,
  'message is required.': MessageCode.GamesWsMessageRequired,
  'card is not supported.': MessageCode.GamesWsCardNotSupported,
  'cat is required.': MessageCode.GamesWsCatRequired,
  'cat is not supported.': MessageCode.GamesWsCatNotSupported,
  'mode is required.': MessageCode.GamesWsModeRequired,
  'desiredCard is required for trio combos.':
    MessageCode.GamesWsDesiredCardRequired,
  'targetPlayerId is required.': MessageCode.GamesWsTargetPlayerIdRequired,

  // Auth
  'Missing OAUTH_ISSUER': MessageCode.AuthMissingOauthIssuer,
  'OIDC discovery failed': MessageCode.AuthOidcDiscoveryFailed,
  'Missing OAUTH_WEB_CLIENT_ID': MessageCode.AuthMissingWebClientId,
  'Missing OAUTH_WEB_CLIENT_SECRET': MessageCode.AuthMissingWebClientSecret,
  'Missing redirect URI': MessageCode.AuthMissingRedirectUri,
  'No token endpoint': MessageCode.AuthNoTokenEndpoint,
  'Failed to parse token response': MessageCode.AuthFailedToParseTokenResponse,
  'Email already registered': MessageCode.AuthEmailAlreadyRegistered,
  'Username already taken': MessageCode.AuthUsernameTaken,
  'Invalid credentials': MessageCode.AuthInvalidCredentials,
  'Unsupported OAuth provider': MessageCode.AuthUnsupportedOauthProvider,
  'Missing OAuth credentials': MessageCode.AuthMissingOauthCredentials,
  'Google account email not verified': MessageCode.AuthGoogleEmailNotVerified,
  'Missing refresh token': MessageCode.AuthMissingRefreshToken,
  'Invalid refresh token': MessageCode.AuthInvalidRefreshToken,
  'Refresh token revoked': MessageCode.AuthRefreshTokenRevoked,
  'Refresh token expired': MessageCode.AuthRefreshTokenExpired,
  'User not found for refresh token':
    MessageCode.AuthUserNotFoundForRefreshToken,
  'OAuth client mismatch': MessageCode.AuthOauthClientMismatch,
  'Unable to validate OAuth tokens':
    MessageCode.AuthUnableToValidateOauthTokens,
  'Token exchange missing access_token':
    MessageCode.AuthTokenExchangeMissingAccessToken,

  // Chat
  'User context missing': MessageCode.ChatUserContextMissing,
  'Provide at least one additional participant':
    MessageCode.ChatAdditionalParticipantRequired,
  'chatId is required.': MessageCode.ChatWsChatIdRequired,
  'currentUserId is required.': MessageCode.ChatWsCurrentUserIdRequired,
};

const EXACT_MATCHES: LookupEntry[] = Object.entries(STRING_CODE_MAP).map(
  ([match, code]) => ({ match, code }),
);

const REGEX_MATCHES: LookupEntry[] = [
  {
    match: /^payments\.missingConfig\./,
    code: MessageCode.PaymentsMissingConfig,
  },
];

function lookupMessageCode(raw?: unknown): MessageCode | undefined {
  if (typeof raw === 'undefined' || raw === null) {
    return undefined;
  }

  if (Array.isArray(raw)) {
    const firstMessage = raw.find((item) => typeof item === 'string');
    if (typeof firstMessage === 'string') {
      return lookupMessageCode(firstMessage) ?? MessageCode.ValidationError;
    }
    return MessageCode.ValidationError;
  }

  const message = raw;

  if (typeof message !== 'string') {
    return undefined;
  }

  for (const entry of EXACT_MATCHES) {
    if (typeof entry.match === 'string' && entry.match === message) {
      return entry.code;
    }
  }

  for (const entry of REGEX_MATCHES) {
    if (entry.match instanceof RegExp && entry.match.test(message)) {
      return entry.code;
    }
  }

  return undefined;
}

export function resolveErrorMessageCode(message?: unknown): MessageCode {
  return lookupMessageCode(message) ?? MessageCode.UnknownError;
}

export function resolveSuccessMessageCode(message?: unknown): MessageCode {
  return lookupMessageCode(message) ?? MessageCode.GenericSuccess;
}
