import type { ApiMessageDescriptor } from '../types';

export const genericDescriptors: ApiMessageDescriptor[] = [
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
];
