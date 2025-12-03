import type { ApiMessageDescriptor } from '../types';

export const paymentsDescriptors: ApiMessageDescriptor[] = [
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
];
