const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Decode(str: string): Uint8Array {
  let result = BigInt(0);
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base58 character: ${char}`);
    result = result * BigInt(58) + BigInt(index);
  }

  const hex = result.toString(16);
  const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
  const bytes = new Uint8Array(paddedHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(paddedHex.slice(i * 2, i * 2 + 2), 16);
  }
  // Leading '1' characters encode leading zero bytes.
  let zeros = 0;
  while (zeros < str.length && str[zeros] === '1') zeros++;
  if (result === BigInt(0)) return new Uint8Array(zeros);
  const out = new Uint8Array(zeros + bytes.length);
  out.set(bytes, zeros);
  return out;
}

/** True iff `value` is a base58 string that decodes to exactly 32 bytes. */
export function isValidSolanaAddress(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 32 || value.length > 44) {
    return false;
  }
  try {
    return base58Decode(value).length === 32;
  } catch {
    return false;
  }
}
