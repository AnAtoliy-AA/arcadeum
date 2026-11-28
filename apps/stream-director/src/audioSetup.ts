import { execFileSync } from 'child_process';

type Run = (cmd: string, args: string[]) => string | Buffer;

/**
 * Create the virtual PulseAudio sink Chromium plays into (idempotent).
 * Returns false when pactl is missing (e.g. a laptop dry run).
 */
export function ensureVirtualSink(
  name = 'arcadeum_live',
  run: Run = (c, a) => execFileSync(c, a),
): boolean {
  try {
    const sinks = String(run('pactl', ['list', 'short', 'sinks']));
    if (!sinks.split('\n').some((l) => l.split('\t')[1] === name)) {
      run('pactl', [
        'load-module',
        'module-null-sink',
        `sink_name=${name}`,
        `sink_properties=device.description=${name}`,
      ]);
    }
    return true;
  } catch {
    return false;
  }
}
