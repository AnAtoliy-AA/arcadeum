'use server';

import { resolveApiUrl } from '@/shared/lib/api-base';

const NAME_MAX = 120;
const SUBJECT_MAX = 200;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1200;
const MESSAGE_MAX_URLS = 2;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /\bhttps?:\/\/\S+/gi;
const FALLBACK_SUPPORT_EMAIL = 'arcadeum.care@gmail.com';

export type ContactFieldErrors = Partial<
  Record<'name' | 'email' | 'subject' | 'message', string>
>;

export type ContactActionState =
  | { status: 'idle' }
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: ContactFieldErrors }
  | { status: 'error'; message: string; fallbackMailto: string };

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function buildFallbackMailto(
  name: string,
  email: string,
  subject: string,
  message: string,
): string {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? FALLBACK_SUPPORT_EMAIL;
  const body = `From: ${name} <${email}>\n\n${message}`;
  return `mailto:${supportEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export async function submitContactAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = readField(formData, 'name');
  const email = readField(formData, 'email');
  const subject = readField(formData, 'subject');
  const message = readField(formData, 'message');
  const website = readField(formData, 'website'); // honeypot
  const submittedAt = Number(readField(formData, 'formMountedAt'));

  const fieldErrors: ContactFieldErrors = {};
  if (!name) fieldErrors.name = 'required';
  else if (name.length > NAME_MAX) fieldErrors.name = `max ${NAME_MAX}`;

  if (!email) fieldErrors.email = 'required';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'invalid';

  if (!subject) fieldErrors.subject = 'required';
  else if (subject.length > SUBJECT_MAX)
    fieldErrors.subject = `max ${SUBJECT_MAX}`;

  if (!message) fieldErrors.message = 'required';
  else if (message.length < MESSAGE_MIN)
    fieldErrors.message = `min ${MESSAGE_MIN}`;
  else if (message.length > MESSAGE_MAX)
    fieldErrors.message = `max ${MESSAGE_MAX}`;
  else if ((message.match(URL_RE)?.length ?? 0) > MESSAGE_MAX_URLS)
    fieldErrors.message = `max ${MESSAGE_MAX_URLS} links`;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'invalid', fieldErrors };
  }

  // Honeypot trip — pretend it succeeded so bots don't learn the rule.
  if (website) {
    return { status: 'ok' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    // Shared secret with the BE: lets OriginGuard accept this fetch even
    // though Next.js server actions are server-to-server (no Origin
    // header). Empty in local dev when no token is set — BE then falls
    // back to origin check, which still permits localhost.
    const token = process.env.SUPPORT_INTERNAL_TOKEN;
    if (token) headers['X-Internal-Token'] = token;

    const res = await fetch(resolveApiUrl('/support/contact'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, email, subject, message, submittedAt }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        status: 'error',
        message: res.status === 429 ? 'throttled' : 'upstream',
        fallbackMailto: buildFallbackMailto(name, email, subject, message),
      };
    }

    return { status: 'ok' };
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'unknown',
      fallbackMailto: buildFallbackMailto(name, email, subject, message),
    };
  }
}
