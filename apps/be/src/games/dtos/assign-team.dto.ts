import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class AssignTeamDto {
  @IsString()
  roomId!: string;

  @IsString()
  userId!: string;

  // Allow `null` to indicate unassign; require string otherwise.
  @ValidateIf((_o, v) => v !== null)
  @IsOptional()
  @IsString()
  teamId!: string | null;
}
