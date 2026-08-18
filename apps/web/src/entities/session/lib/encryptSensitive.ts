'use client';

export function encryptSensitiveValue(value: string): string {
  if (typeof window === 'undefined') {
    return value;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  // Use Uint8Array.reduce instead of byte-by-byte string concatenation
  const binary = Array.from(data, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

export function decryptSensitiveValue(encoded: string): string {
  if (typeof window === 'undefined') {
    return encoded;
  }
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return encoded;
  }
}
