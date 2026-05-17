import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Quickplay creates a single-player room against a single AI bot,
 * ready to be started immediately from the lobby. Used by SEO landing
 * pages to remove the "configure a room" friction for visitors arriving
 * from search.
 */
export class QuickplayGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  gameId!: string;
}
