import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export type QuickplayMode = 'ai' | 'human';
export const QUICKPLAY_MODES: QuickplayMode[] = ['ai', 'human'];

/**
 * Quickplay: one-tap entry into a game from SEO landing pages.
 * - mode='ai' (default) → 1v1 vs an AI bot, lobby pre-seeded.
 * - mode='human' → joins the oldest open public lobby for this game,
 *   or creates a fresh one if none exists.
 */
export class QuickplayGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  gameId!: string;

  @IsOptional()
  @IsIn(QUICKPLAY_MODES)
  mode?: QuickplayMode;
}
