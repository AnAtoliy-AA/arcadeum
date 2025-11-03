import type { TranslationKey } from '@/lib/i18n/messages';

export interface ApiMessageDescriptor {
  code: number;
  translationKey: TranslationKey;
  fallbackMessage: string;
  aliases?: string[];
}

const DESCRIPTORS: ApiMessageDescriptor[] = [
  {
    code: 1000,
    translationKey: 'api.generic.unknownError',
    fallbackMessage: 'Something went wrong. Please try again.',
    aliases: ['Unknown error'],
  },
  {
    code: 1001,
    translationKey: 'api.generic.validationError',
    fallbackMessage: 'Some fields are invalid. Check and try again.',
    aliases: ['Validation failed'],
  },
  {
    code: 2000,
    translationKey: 'api.payments.invalidAmount',
    fallbackMessage: 'Payment amount is invalid.',
    aliases: ['payments.invalidAmount'],
  },
  {
    code: 2001,
    translationKey: 'api.payments.missingRedirects',
    fallbackMessage: 'Payment redirects are not configured.',
    aliases: ['payments.missingRedirects'],
  },
  {
    code: 2002,
    translationKey: 'api.payments.missingCallback',
    fallbackMessage: 'Payment callback URL is missing.',
    aliases: ['payments.missingCallback'],
  },
  {
    code: 2003,
    translationKey: 'api.payments.sessionFailed',
    fallbackMessage: 'Unable to create payment session.',
    aliases: ['payments.sessionFailed'],
  },
  {
    code: 2004,
    translationKey: 'api.payments.missingConfig',
    fallbackMessage: 'Payment configuration is incomplete.',
    aliases: ['payments.missingConfig'],
  },
  {
    code: 3000,
    translationKey: 'api.games.userIdRequired',
    fallbackMessage: 'User ID is required.',
    aliases: ['games.userIdRequired', 'User ID is required.'],
  },
  {
    code: 3001,
    translationKey: 'api.games.roomIdRequired',
    fallbackMessage: 'Room ID is required.',
    aliases: ['games.roomIdRequired', 'Room ID is required.'],
  },
  {
    code: 3002,
    translationKey: 'api.games.messageRequired',
    fallbackMessage: 'Message must not be empty.',
    aliases: ['games.messageRequired', 'Message must not be empty.'],
  },
  {
    code: 3003,
    translationKey: 'api.games.roomNotInProgress',
    fallbackMessage: 'The game has not started for this room.',
    aliases: ['games.roomNotInProgress', 'The game has not started for this room.'],
  },
  {
    code: 3004,
    translationKey: 'api.games.hostIdRequired',
    fallbackMessage: 'Host ID is required.',
    aliases: ['games.hostIdRequired', 'Host ID is required.', 'Host identifier is required.'],
  },
  {
    code: 3005,
    translationKey: 'api.games.gameIdRequired',
    fallbackMessage: 'Game ID is required.',
    aliases: ['games.gameIdRequired', 'Game ID is required.'],
  },
  {
    code: 3006,
    translationKey: 'api.games.rematchGameIdRequired',
    fallbackMessage: 'Game ID is required for rematch.',
    aliases: ['games.rematchGameIdRequired', 'Game ID is required for rematch.'],
  },
  {
    code: 3007,
    translationKey: 'api.games.roomNameRequired',
    fallbackMessage: 'Room name is required.',
    aliases: ['games.roomNameRequired', 'Room name is required.'],
  },
  {
    code: 3008,
    translationKey: 'api.games.maxPlayersMinimum',
    fallbackMessage: 'Max players must be at least 2.',
    aliases: ['games.maxPlayersMinimum', 'Max players must be at least 2.'],
  },
  {
    code: 3009,
    translationKey: 'api.games.roomOrInviteRequired',
    fallbackMessage: 'Provide either roomId or inviteCode.',
    aliases: ['games.roomOrInviteRequired', 'Provide either roomId or inviteCode.'],
  },
  {
    code: 3010,
    translationKey: 'api.games.roomClosed',
    fallbackMessage: 'Room is no longer accepting players.',
    aliases: ['games.roomClosed', 'Room is no longer accepting players.'],
  },
  {
    code: 3011,
    translationKey: 'api.games.roomFull',
    fallbackMessage: 'Room is full.',
    aliases: ['games.roomFull', 'Room is full.'],
  },
  {
    code: 3012,
    translationKey: 'api.games.roomAccessForbidden',
    fallbackMessage: 'Access to this room is not permitted.',
    aliases: ['games.roomAccessForbidden', 'Access to this room is not permitted.'],
  },
  {
    code: 3013,
    translationKey: 'api.games.inviteCodeRequired',
    fallbackMessage: 'Invite code required to join this room.',
    aliases: ['games.inviteCodeRequired', 'Invite code required to join this room.'],
  },
  {
    code: 3014,
    translationKey: 'api.games.roomNotFound',
    fallbackMessage: 'Game room not found.',
    aliases: ['games.roomNotFound', 'Game room not found.'],
  },
  {
    code: 3015,
    translationKey: 'api.games.sessionNotFound',
    fallbackMessage: 'Game session not found for this room.',
    aliases: ['games.sessionNotFound', 'Game session not found for room.', 'Game session not found for this room.'],
  },
  {
    code: 3016,
    translationKey: 'api.games.engineRequired',
    fallbackMessage: 'Engine identifier is required.',
    aliases: ['games.engineRequired', 'Engine identifier is required.'],
  },
  {
    code: 3017,
    translationKey: 'api.games.targetRequired',
    fallbackMessage: 'Target player is required.',
    aliases: ['games.targetRequired', 'Target player is required.'],
  },
  {
    code: 3018,
    translationKey: 'api.games.targetUnavailable',
    fallbackMessage: 'Target player is not available.',
    aliases: ['games.targetUnavailable', 'Target player is not available.'],
  },
  {
    code: 3019,
    translationKey: 'api.games.comboUnavailable',
    fallbackMessage: 'Card combo is not available.',
    aliases: ['games.comboUnavailable', 'Card combo is not available.'],
  },
  {
    code: 3020,
    translationKey: 'api.games.cardNotInHand',
    fallbackMessage: 'Card is not available in hand.',
    aliases: ['games.cardNotInHand', 'Card is not available in hand.'],
  },
  {
    code: 3021,
    translationKey: 'api.games.actionCardUnsupported',
    fallbackMessage: 'Unsupported action card.',
    aliases: ['games.actionCardUnsupported', 'Unsupported action card.'],
  },
  {
    code: 3022,
    translationKey: 'api.games.catUnsupported',
    fallbackMessage: 'Unsupported cat card.',
    aliases: ['games.catUnsupported', 'Unsupported cat card.'],
  },
  {
    code: 3023,
    translationKey: 'api.games.comboModeUnsupported',
    fallbackMessage: 'Unsupported combo mode.',
    aliases: ['games.comboModeUnsupported', 'Unsupported combo mode.'],
  },
  {
    code: 3024,
    translationKey: 'api.games.comboRemovalFailed',
    fallbackMessage: 'Unable to remove combo cards from hand.',
    aliases: ['games.comboRemovalFailed', 'Unable to remove combo cards from hand.'],
  },
  {
    code: 3025,
    translationKey: 'api.games.deckEmpty',
    fallbackMessage: 'The deck has no cards remaining.',
    aliases: ['games.deckEmpty', 'The deck has no cards remaining.', 'Deck is empty.'],
  },
  {
    code: 3026,
    translationKey: 'api.games.hostOnlyStart',
    fallbackMessage: 'Only the host can start this game.',
    aliases: ['games.hostOnlyStart', 'Only the host can start this game.'],
  },
  {
    code: 3027,
    translationKey: 'api.games.hostOnlyDelete',
    fallbackMessage: 'Only the host can delete this room.',
    aliases: ['games.hostOnlyDelete', 'Only the host can delete this room.'],
  },
  {
    code: 3028,
    translationKey: 'api.games.playerNotParticipant',
    fallbackMessage: 'Player is not part of this session.',
    aliases: ['games.playerNotParticipant', 'Player is not part of this session.'],
  },
  {
    code: 3029,
    translationKey: 'api.games.playerEliminated',
    fallbackMessage: 'Player has already been eliminated.',
    aliases: ['games.playerEliminated', 'Player has already been eliminated.'],
  },
  {
    code: 3030,
    translationKey: 'api.games.notYourTurnDraw',
    fallbackMessage: 'It is not your turn to draw.',
    aliases: ['games.notYourTurnDraw', 'It is not your turn to draw.'],
  },
  {
    code: 3031,
    translationKey: 'api.games.notYourTurnPlay',
    fallbackMessage: 'It is not your turn to play.',
    aliases: ['games.notYourTurnPlay', 'It is not your turn to play.'],
  },
  {
    code: 3032,
    translationKey: 'api.games.notParticipant',
    fallbackMessage: 'You are not a participant of this room.',
    aliases: ['games.notParticipant', 'You are not a participant of this room.'],
  },
  {
    code: 3033,
    translationKey: 'api.games.snapshotUnavailable',
    fallbackMessage: 'Exploding Cats snapshot is unavailable.',
    aliases: ['games.snapshotUnavailable', 'Exploding Cats snapshot is unavailable.'],
  },
  {
    code: 3034,
    translationKey: 'api.games.roomInactive',
    fallbackMessage: 'Room is no longer active.',
    aliases: ['games.roomInactive', 'Room is no longer active.'],
  },
  {
    code: 3035,
    translationKey: 'api.games.comboNotAllowed',
    fallbackMessage: 'Combo not allowed.',
    aliases: ['games.comboNotAllowed', 'Combo not allowed.'],
  },
  {
    code: 3036,
    translationKey: 'api.games.cannotPlayCardNow',
    fallbackMessage: 'Cannot play this card right now.',
    aliases: ['games.cannotPlayCardNow', 'Cannot play this card right now.'],
  },
  {
    code: 3037,
    translationKey: 'api.games.joinBeforeSession',
    fallbackMessage: 'Join the room before requesting the session.',
    aliases: ['games.joinBeforeSession', 'Join the room before requesting the session.'],
  },
  {
    code: 3038,
    translationKey: 'api.games.historyAccessForbidden',
    fallbackMessage: 'Access to this history entry is not permitted.',
    aliases: ['games.historyAccessForbidden', 'Access to this history entry is not permitted.'],
  },
  {
    code: 3039,
    translationKey: 'api.games.rematchParticipantRequired',
    fallbackMessage: 'At least one consenting participant is required for a rematch.',
    aliases: ['games.rematchParticipantRequired', 'At least one consenting participant is required for a rematch.'],
  },
  {
    code: 3040,
    translationKey: 'api.games.startRequiresTwoPlayers',
    fallbackMessage: 'At least two players are required to start.',
    aliases: ['games.startRequiresTwoPlayers', 'At least two players are required to start.'],
  },
  {
    code: 3041,
    translationKey: 'api.games.catCombosExplodingOnly',
    fallbackMessage: 'Cat combos are only supported for Exploding Cats sessions.',
    aliases: ['games.catCombosExplodingOnly', 'Cat combos are only supported for Exploding Cats sessions.'],
  },
  {
    code: 3042,
    translationKey: 'api.games.desiredCardRequired',
    fallbackMessage: 'Desired card is required for trio combo.',
    aliases: ['games.desiredCardRequired', 'Desired card is required for trio combo.'],
  },
  {
    code: 3043,
    translationKey: 'api.games.drawActionExplodingOnly',
    fallbackMessage: 'Draw action is only supported for Exploding Cats sessions.',
    aliases: ['games.drawActionExplodingOnly', 'Draw action is only supported for Exploding Cats sessions.'],
  },
  {
    code: 3044,
    translationKey: 'api.games.explodingCatsDisabled',
    fallbackMessage: 'Exploding Cats is not enabled for this room.',
    aliases: ['games.explodingCatsDisabled', 'Exploding Cats is not enabled for this room.'],
  },
  {
    code: 3045,
    translationKey: 'api.games.historyNotesExplodingOnly',
    fallbackMessage: 'History notes are only supported for Exploding Cats sessions.',
    aliases: ['games.historyNotesExplodingOnly', 'History notes are only supported for Exploding Cats sessions.'],
  },
  {
    code: 3046,
    translationKey: 'api.games.originalHostOnlyRematch',
    fallbackMessage: 'Only the original host may initiate a rematch.',
    aliases: ['games.originalHostOnlyRematch', 'Only the original host may initiate a rematch.'],
  },
  {
    code: 3047,
    translationKey: 'api.games.playActionExplodingOnly',
    fallbackMessage: 'Play action is only supported for Exploding Cats sessions.',
    aliases: ['games.playActionExplodingOnly', 'Play action is only supported for Exploding Cats sessions.'],
  },
  {
    code: 3048,
    translationKey: 'api.games.targetMustDiffer',
    fallbackMessage: 'Target player must be different from actor.',
    aliases: ['games.targetMustDiffer', 'Target player must be different from actor.'],
  },
  {
    code: 3049,
    translationKey: 'api.games.noActivePlayers',
    fallbackMessage: 'There are no active players in this session.',
    aliases: ['games.noActivePlayers', 'There are no active players in this session.'],
  },
  {
    code: 3050,
    translationKey: 'api.games.notInLobbyPhase',
    fallbackMessage: 'This room is no longer in the lobby phase.',
    aliases: ['games.notInLobbyPhase', 'This room is no longer in the lobby phase.'],
  },
  {
    code: 3051,
    translationKey: 'api.games.sessionAlreadyActive',
    fallbackMessage: 'An active session already exists for this room.',
    aliases: ['games.sessionAlreadyActive', 'An active session already exists for this room.'],
  },
  {
    code: 3100,
    translationKey: 'api.games.ws.roomIdRequired',
    fallbackMessage: 'roomId is required.',
    aliases: ['roomId is required.'],
  },
  {
    code: 3101,
    translationKey: 'api.games.ws.userIdRequired',
    fallbackMessage: 'userId is required.',
    aliases: ['userId is required.'],
  },
  {
    code: 3102,
    translationKey: 'api.games.ws.messageRequired',
    fallbackMessage: 'message is required.',
    aliases: ['message is required.'],
  },
  {
    code: 3103,
    translationKey: 'api.games.ws.cardNotSupported',
    fallbackMessage: 'card is not supported.',
    aliases: ['card is not supported.'],
  },
  {
    code: 3104,
    translationKey: 'api.games.ws.catRequired',
    fallbackMessage: 'cat is required.',
    aliases: ['cat is required.'],
  },
  {
    code: 3105,
    translationKey: 'api.games.ws.catNotSupported',
    fallbackMessage: 'cat is not supported.',
    aliases: ['cat is not supported.'],
  },
  {
    code: 3106,
    translationKey: 'api.games.ws.modeRequired',
    fallbackMessage: 'mode is required.',
    aliases: ['mode is required.'],
  },
  {
    code: 3107,
    translationKey: 'api.games.ws.desiredCardRequired',
    fallbackMessage: 'desiredCard is required for trio combos.',
    aliases: ['desiredCard is required for trio combos.'],
  },
  {
    code: 3108,
    translationKey: 'api.games.ws.targetPlayerIdRequired',
    fallbackMessage: 'targetPlayerId is required.',
    aliases: ['targetPlayerId is required.'],
  },
  {
    code: 4000,
    translationKey: 'api.auth.missingOauthIssuer',
    fallbackMessage: 'Missing OAUTH_ISSUER',
    aliases: ['Missing OAUTH_ISSUER'],
  },
  {
    code: 4001,
    translationKey: 'api.auth.oidcDiscoveryFailed',
    fallbackMessage: 'OIDC discovery failed',
    aliases: ['OIDC discovery failed'],
  },
  {
    code: 4002,
    translationKey: 'api.auth.missingWebClientId',
    fallbackMessage: 'Missing OAUTH_WEB_CLIENT_ID',
    aliases: ['Missing OAUTH_WEB_CLIENT_ID'],
  },
  {
    code: 4003,
    translationKey: 'api.auth.missingWebClientSecret',
    fallbackMessage: 'Missing OAUTH_WEB_CLIENT_SECRET',
    aliases: ['Missing OAUTH_WEB_CLIENT_SECRET'],
  },
  {
    code: 4004,
    translationKey: 'api.auth.missingRedirectUri',
    fallbackMessage: 'Missing redirect URI',
    aliases: ['Missing redirect URI'],
  },
  {
    code: 4005,
    translationKey: 'api.auth.noTokenEndpoint',
    fallbackMessage: 'No token endpoint',
    aliases: ['No token endpoint'],
  },
  {
    code: 4006,
    translationKey: 'api.auth.failedToParseTokenResponse',
    fallbackMessage: 'Failed to parse token response',
    aliases: ['Failed to parse token response'],
  },
  {
    code: 4007,
    translationKey: 'api.auth.emailAlreadyRegistered',
    fallbackMessage: 'Email already registered',
    aliases: ['Email already registered'],
  },
  {
    code: 4008,
    translationKey: 'api.auth.usernameTaken',
    fallbackMessage: 'Username already taken',
    aliases: ['Username already taken'],
  },
  {
    code: 4009,
    translationKey: 'api.auth.invalidCredentials',
    fallbackMessage: 'Invalid credentials',
    aliases: ['Invalid credentials'],
  },
  {
    code: 4010,
    translationKey: 'api.auth.unsupportedOauthProvider',
    fallbackMessage: 'Unsupported OAuth provider',
    aliases: ['Unsupported OAuth provider'],
  },
  {
    code: 4011,
    translationKey: 'api.auth.missingOauthCredentials',
    fallbackMessage: 'Missing OAuth credentials',
    aliases: ['Missing OAuth credentials'],
  },
  {
    code: 4012,
    translationKey: 'api.auth.googleEmailNotVerified',
    fallbackMessage: 'Google account email not verified',
    aliases: ['Google account email not verified'],
  },
  {
    code: 4013,
    translationKey: 'api.auth.missingRefreshToken',
    fallbackMessage: 'Missing refresh token',
    aliases: ['Missing refresh token'],
  },
  {
    code: 4014,
    translationKey: 'api.auth.invalidRefreshToken',
    fallbackMessage: 'Invalid refresh token',
    aliases: ['Invalid refresh token'],
  },
  {
    code: 4015,
    translationKey: 'api.auth.refreshTokenRevoked',
    fallbackMessage: 'Refresh token revoked',
    aliases: ['Refresh token revoked'],
  },
  {
    code: 4016,
    translationKey: 'api.auth.refreshTokenExpired',
    fallbackMessage: 'Refresh token expired',
    aliases: ['Refresh token expired'],
  },
  {
    code: 4017,
    translationKey: 'api.auth.userNotFoundForRefreshToken',
    fallbackMessage: 'User not found for refresh token',
    aliases: ['User not found for refresh token'],
  },
  {
    code: 4018,
    translationKey: 'api.auth.oauthClientMismatch',
    fallbackMessage: 'OAuth client mismatch',
    aliases: ['OAuth client mismatch'],
  },
  {
    code: 4019,
    translationKey: 'api.auth.unableToValidateOauthTokens',
    fallbackMessage: 'Unable to validate OAuth tokens',
    aliases: ['Unable to validate OAuth tokens'],
  },
  {
    code: 4020,
    translationKey: 'api.auth.tokenExchangeMissingAccessToken',
    fallbackMessage: 'Token exchange missing access_token',
    aliases: ['Token exchange missing access_token'],
  },
  {
    code: 5000,
    translationKey: 'api.chat.userContextMissing',
    fallbackMessage: 'User context missing',
    aliases: ['User context missing'],
  },
  {
    code: 5001,
    translationKey: 'api.chat.ws.chatIdRequired',
    fallbackMessage: 'chatId is required.',
    aliases: ['chatId is required.'],
  },
  {
    code: 5002,
    translationKey: 'api.chat.ws.currentUserIdRequired',
    fallbackMessage: 'currentUserId is required.',
    aliases: ['currentUserId is required.'],
  },
  {
    code: 5003,
    translationKey: 'api.chat.additionalParticipantRequired',
    fallbackMessage: 'Provide at least one additional participant',
    aliases: ['Provide at least one additional participant'],
  },
];

const CODE_LOOKUP: Record<number, ApiMessageDescriptor> = {};
const ALIAS_LOOKUP: Record<string, ApiMessageDescriptor> = {};

for (const descriptor of DESCRIPTORS) {
  CODE_LOOKUP[descriptor.code] = descriptor;
  descriptor.aliases?.forEach((alias) => {
    ALIAS_LOOKUP[alias] = descriptor;
  });
}

export function findApiMessageDescriptor(params: {
  code?: unknown;
  messageKey?: unknown;
  message?: unknown;
}): ApiMessageDescriptor | undefined {
  if (typeof params.code === 'number') {
    const found = CODE_LOOKUP[params.code];
    if (found) {
      return found;
    }
  }

  if (typeof params.messageKey === 'string') {
    const found = ALIAS_LOOKUP[params.messageKey];
    if (found) {
      return found;
    }
  }

  if (typeof params.message === 'string') {
    const found = ALIAS_LOOKUP[params.message];
    if (found) {
      return found;
    }
  }

  return undefined;
}

export function getApiMessageDescriptorByCode(code?: number | null): ApiMessageDescriptor | undefined {
  if (typeof code !== 'number') {
    return undefined;
  }
  return CODE_LOOKUP[code];
}
