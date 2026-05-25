import { IsString, IsUrl, MaxLength } from 'class-validator';

export class DeleteSubscriptionDto {
  @IsString()
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(2048)
  endpoint!: string;
}
