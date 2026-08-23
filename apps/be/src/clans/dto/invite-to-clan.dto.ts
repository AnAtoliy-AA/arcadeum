import { IsString, IsNotEmpty } from 'class-validator';

export class InviteToClanDto {
  @IsString()
  @IsNotEmpty()
  username!: string;
}
