import type { ApiMessageDescriptor } from '../types';

export const gamesWsDescriptors: ApiMessageDescriptor[] = [
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
];
