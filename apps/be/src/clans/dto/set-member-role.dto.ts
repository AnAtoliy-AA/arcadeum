import { IsIn } from 'class-validator';
import { CLAN_ROLES, type ClanRole } from '../schemas/clan.schema';

export class SetMemberRoleDto {
  @IsIn(CLAN_ROLES)
  readonly role!: ClanRole;
}
