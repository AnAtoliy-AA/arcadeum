import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export const EMOTE_IDS = [
  'good_move',
  'lol',
  'thinking',
  'nice',
  'unlucky',
  'rip',
  'fire',
  'clap',
  'cry',
  'angry',
  'rocket',
  'heart',
  'brain',
  'skull',
  'sweat',
  'clown',
] as const;

export type EmoteId = (typeof EMOTE_IDS)[number];

export class SendEmoteDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsIn(EMOTE_IDS)
  emoteId!: EmoteId;
}
