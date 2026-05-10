import { IsMongoId } from 'class-validator';

export class CreateGemOrderDto {
  @IsMongoId()
  packageId!: string;
}
