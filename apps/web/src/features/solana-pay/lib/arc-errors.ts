/** Backend error codes (`gems.rpcUnavailable`, `arc.notConfigured`, ...). */
const KNOWN = [
  'rpcUnavailable',
  'transactionNotConfirmed',
  'paymentTooLow',
  'invalidTransaction',
  'arcPaymentDisabled',
  'arcPriceUnavailable',
  'signatureAlreadyUsed',
  'notConfigured',
] as const;

export type ArcErrorKey = (typeof KNOWN)[number];

/** Maps an API error to a translation key under `wallet.arcCheckout.errors`. */
export function arcErrorKey(err: unknown): ArcErrorKey | null {
  const message =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const code = message.split('.').pop() ?? '';
  return (KNOWN as readonly string[]).includes(code)
    ? (code as ArcErrorKey)
    : null;
}

/** Errors worth a retry of the same signature without paying again. */
export function isRetryableArcError(key: ArcErrorKey | null): boolean {
  return key === 'rpcUnavailable' || key === 'transactionNotConfirmed';
}
