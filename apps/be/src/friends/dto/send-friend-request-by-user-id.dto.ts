import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SendFriendRequestByUserIdDto {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;
}
