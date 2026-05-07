'use server';

const NAME_MAX = 120;
const SUBJECT_MAX = 200;
const MESSAGE_MAX = 1200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFieldErrors = Partial<
  Record<'name' | 'email' | 'subject' | 'message', string>
>;

export type ContactActionState =
  | { status: 'idle' }
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: ContactFieldErrors }
  | { status: 'error'; message: string };

export const initialContactActionState: ContactActionState = { status: 'idle' };

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitContactAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = readField(formData, 'name');
  const email = readField(formData, 'email');
  const subject = readField(formData, 'subject');
  const message = readField(formData, 'message');

  const fieldErrors: ContactFieldErrors = {};
  if (!name) fieldErrors.name = 'required';
  else if (name.length > NAME_MAX) fieldErrors.name = `max ${NAME_MAX}`;

  if (!email) fieldErrors.email = 'required';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'invalid';

  if (!subject) fieldErrors.subject = 'required';
  else if (subject.length > SUBJECT_MAX)
    fieldErrors.subject = `max ${SUBJECT_MAX}`;

  if (!message) fieldErrors.message = 'required';
  else if (message.length > MESSAGE_MAX)
    fieldErrors.message = `max ${MESSAGE_MAX}`;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    // BE module not yet wired (ARC-575 follow-up). Until then we treat a
    // valid submission as a no-op success. When apps/be exposes
    // POST /support/contact, replace this block with the fetch call and
    // surface upstream failures as { status: 'error', message }.
    return { status: 'ok' };
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'unknown',
    };
  }
}
