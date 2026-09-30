import { IsBoolean } from 'class-validator';

export class ToggleBlitzCupDto {
  @IsBoolean()
  enabled!: boolean;
}
