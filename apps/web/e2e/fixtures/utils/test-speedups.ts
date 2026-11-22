import type { Page } from '@playwright/test';

const BLOCKED_HOSTS =
  /^https?:\/\/([^/]*\.)?(youtube-nocookie\.com|youtube\.com|ytimg\.com|googletagmanager\.com|google-analytics\.com)\//;

const MEDIA_FILE = /\.(?:mp3|ogg|wav|m4a|mp4|webm)(?:\?|$)/;

// A valid 16-bit mono PCM WAV with 0.1s of silence. Zero-length WAVs decode in
// Chromium and WebKit but Firefox rejects them with a console warning, so give
// it real (silent) samples.
function silentWav(): Buffer {
  const sampleRate = 8000;
  const samples = 800;
  const dataBytes = samples * 2;
  const wav = Buffer.alloc(44 + dataBytes);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataBytes, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataBytes, 40);
  return wav;
}

/**
 * Cuts per-test cost without changing what the specs assert: audio/video and
 * third-party tracking/embed requests never affect app logic but cost CPU and
 * memory (notably on software-rendered Linux WebKit), so they get a stub
 * response instead of a real fetch.
 *
 * Registered before any spec-level `page.route`, so specs that mock the same
 * URLs still win (Playwright runs the most recently added route first).
 */
export async function applyTestSpeedups(page: Page): Promise<void> {
  const wav = silentWav();
  await page.route(
    (url) =>
      BLOCKED_HOSTS.test(url.toString()) || MEDIA_FILE.test(url.pathname),
    (route) => {
      const url = route.request().url();
      if (MEDIA_FILE.test(new URL(url).pathname)) {
        return route.fulfill({
          status: 200,
          contentType: 'audio/wav',
          body: wav,
        });
      }
      return route.fulfill({ status: 204 });
    },
  );
}
