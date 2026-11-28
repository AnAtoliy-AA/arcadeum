import type {
  AudioInputs,
  CaptureConfig,
  FfmpegOutput,
  Profile,
} from './types';

/**
 * Pure ffmpeg argument builder: Xvfb screen + PulseAudio (+ music bed) to
 * libx264/AAC, either RTMP (FLV), a local mp4 (dry run) or the null muxer.
 */
export interface FfmpegSpec {
  profile: Profile;
  capture: CaptureConfig;
  audio?: AudioInputs;
  output: FfmpegOutput;
}

export function buildFfmpegArgs({
  profile,
  capture,
  audio = {},
  output,
}: FfmpegSpec): string[] {
  const { width, height, fps, videoKbps, preset } = profile;
  const gop = fps * 2; // keyframe every 2 seconds
  const args = ['-hide_banner', '-loglevel', 'warning', '-nostdin'];
  let idx = 0;

  // Input 0: video.
  if (capture.mode === 'x11grab') {
    args.push(
      '-f',
      'x11grab',
      '-framerate',
      String(fps),
      '-video_size',
      `${width}x${height}`,
      '-i',
      `${capture.display}.0+0,0`,
    );
  } else {
    // Local test source for machines without X (e.g. a laptop). -re keeps it
    // real time so dry runs last as long as configured.
    args.push(
      '-re',
      '-f',
      'lavfi',
      '-i',
      `testsrc2=size=${width}x${height}:rate=${fps}`,
    );
  }
  idx += 1;

  const filters: string[] = [];
  const mixInputs: string[] = [];

  // Game audio from the PulseAudio sink monitor.
  if (audio.pulseSource) {
    args.push('-f', 'pulse', '-i', audio.pulseSource);
    filters.push(
      `[${idx}:a]aresample=44100,volume=${audio.gameVolume ?? 0.6}[game]`,
    );
    mixInputs.push('[game]');
    idx += 1;
  }

  // Looping music bed from the concat playlist.
  if (audio.musicList) {
    args.push(
      '-stream_loop',
      '-1',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      audio.musicList,
    );
    filters.push(
      `[${idx}:a]aresample=44100,volume=${audio.musicVolume ?? 0.25}[music]`,
    );
    mixInputs.push('[music]');
    idx += 1;
  }

  if (mixInputs.length === 0) {
    // Platforms expect an audio track; send silence.
    args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
    filters.push(`[${idx}:a]anull[aout]`);
  } else if (mixInputs.length === 1) {
    filters.push(`${mixInputs[0]}anull[aout]`);
  } else {
    filters.push(
      `${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=0:normalize=0[aout]`,
    );
  }

  args.push('-filter_complex', filters.join(';'));
  args.push('-map', '0:v', '-map', '[aout]');

  args.push(
    '-c:v',
    'libx264',
    '-preset',
    preset,
    '-tune',
    'zerolatency',
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(fps),
    '-b:v',
    `${videoKbps}k`,
    '-maxrate',
    `${videoKbps}k`,
    '-bufsize',
    `${videoKbps * 2}k`,
    '-g',
    String(gop),
    '-keyint_min',
    String(gop),
    '-sc_threshold',
    '0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
  );

  if (output.durationSec) args.push('-t', String(output.durationSec));

  // Machine readable progress on stdout for the stall watchdog.
  args.push('-progress', 'pipe:1', '-nostats');

  if (output.kind === 'rtmp') {
    args.push('-f', 'flv', output.target);
  } else if (output.kind === 'file') {
    args.push('-movflags', '+faststart', '-y', output.path);
  } else {
    args.push('-f', 'null', '-');
  }
  return args;
}

/** Copy of args that is safe to log: the RTMP target (holds the key) is masked. */
export function redactArgs(args: string[]): string[] {
  return args.map((a) =>
    /^rtmps?:\/\//i.test(a) ? '[rtmp-target-redacted]' : a,
  );
}

/** Wrap with `nice` when a niceness is configured (CPU cap for shared hosts). */
export function withNice(
  bin: string,
  args: string[],
  niceness: number,
): { cmd: string; args: string[] } {
  if (niceness && process.platform !== 'win32') {
    return { cmd: 'nice', args: ['-n', String(niceness), bin, ...args] };
  }
  return { cmd: bin, args };
}

/** Parse one `key=value` line of -progress output. */
export function parseProgressLine(
  line: string,
): { key: 'frame' | 'fps'; value: number } | null {
  const m = /^(frame|fps)=\s*([\d.]+)/.exec(line.trim());
  return m ? { key: m[1] as 'frame' | 'fps', value: Number(m[2]) } : null;
}
