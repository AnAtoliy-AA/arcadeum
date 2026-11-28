import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export const STREAM_COMMANDS = [
  'start',
  'stop',
  'skip',
  'restart_browser',
] as const;
export type StreamCommandType = (typeof STREAM_COMMANDS)[number];

export class StreamCommandDto {
  @IsIn(STREAM_COMMANDS)
  type!: StreamCommandType;

  /** Only meaningful for `stop`: finish the running game first. */
  @IsOptional()
  @IsBoolean()
  graceful?: boolean;
}
