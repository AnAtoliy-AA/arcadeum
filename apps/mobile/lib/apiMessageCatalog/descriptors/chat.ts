import type { ApiMessageDescriptor } from '../types';

export const chatDescriptors: ApiMessageDescriptor[] = [
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
