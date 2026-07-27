'use client';

export function encryptSensitiveValue(value: string): string {
  if (typeof window === 'undefined') {
    return value;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  let binary = '';
  for (let i = 0; i < data.byteLength; i += 1) {
    binary += String.fromCharCode(data[i]);
  }
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
