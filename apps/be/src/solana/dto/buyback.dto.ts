import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class BuybackDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  @Max(1000)
  solAmount!: number;
}
