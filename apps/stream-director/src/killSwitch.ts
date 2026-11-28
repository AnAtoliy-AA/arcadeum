import * as fs from 'fs';

/** True when the kill flag file exists or STREAM_KILL_SWITCH is truthy. */
export function isKilled(
  { killFile, killEnv }: { killFile: string; killEnv: boolean },
  exists: (p: string) => boolean = fs.existsSync,
): boolean {
  if (killEnv) return true;
  if (!killFile) return false;
  try {
    return exists(killFile);
  } catch {
    return false;
  }
}
