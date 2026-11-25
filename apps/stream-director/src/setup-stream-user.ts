/**
 * Stream user setup: registers (if needed) and verifies login for the
 * dedicated live account, e.g. "arcadeum_live". The director logs in with the
 * same credentials at runtime, so NOTHING is written to disk by this script.
 *
 * Env (never commit values):
 *   STREAM_BOT_PASSWORD  required, choose a strong unique password
 *   STREAM_BOT_EMAIL     default arcadeum-live@test.com
 *   STREAM_BOT_USERNAME  default arcadeum_live
 *   STREAM_BE_URL        default http://localhost:4000
 *
 * Usage: STREAM_BOT_PASSWORD=... node dist/setup-stream-user.js
 */
import { z } from 'zod';

const envSchema = z.object({
  STREAM_BE_URL: z.string().min(1).optional(),
  BE_URL: z.string().min(1).optional(),
  STREAM_BOT_EMAIL: z.string().min(1).default('arcadeum-live@test.com'),
  STREAM_BOT_USERNAME: z.string().min(1).default('arcadeum_live'),
  STREAM_BOT_PASSWORD: z.string().min(1, 'STREAM_BOT_PASSWORD is not set'),
});

interface ApiResult {
  status: number;
  ok: boolean;
  data: { accessToken?: string; message?: string } | null;
}

async function post(
  be: string,
  path: string,
  body: Record<string, string>,
): Promise<ApiResult> {
  const res = await fetch(`${be}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data: ApiResult['data'] = null;
  try {
    data = (await res.json()) as ApiResult['data'];
  } catch {
    /* no body */
  }
  return { status: res.status, ok: res.ok, data };
}

async function main(): Promise<void> {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('\n'),
    );
    console.error('Export the password (do not commit it) and retry.');
    process.exit(1);
  }
  const env = parsed.data;
  const be = (
    env.STREAM_BE_URL ??
    env.BE_URL ??
    'http://localhost:4000'
  ).replace(/\/+$/, '');
  const email = env.STREAM_BOT_EMAIL;
  const username = env.STREAM_BOT_USERNAME;
  const password = env.STREAM_BOT_PASSWORD;

  const reg = await post(be, '/auth/register', { email, password, username });
  if (reg.ok) console.log(`registered ${username} <${email}>`);
  else if (reg.status === 409)
    console.log('user already exists, verifying login');
  else {
    console.error(
      `registration failed: HTTP ${reg.status} ${reg.data?.message ?? ''}`,
    );
    process.exit(1);
  }
  const login = await post(be, '/auth/login', { email, password });
  if (!login.ok || !login.data?.accessToken) {
    console.error(
      `login failed: HTTP ${login.status} ${login.data?.message ?? ''}`,
    );
    console.error(
      'If the account needs email verification, verify it in the BE/admin first.',
    );
    process.exit(1);
  }
  console.log(
    'login OK. Put STREAM_BOT_EMAIL / STREAM_BOT_PASSWORD in the runner env file.',
  );
}

main().catch((err: Error) => {
  console.error('unexpected error:', err.message);
  process.exit(1);
});
