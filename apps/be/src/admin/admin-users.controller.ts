import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AdminUsersService } from './admin-users.service';
import { ListAdminUsersDto } from './dto/list-admin-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type {
  AdminUserItem,
  AdminUsersResponse,
} from './interfaces/admin-user.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(@Query() query: ListAdminUsersDto): Promise<AdminUsersResponse> {
    return this.service.list(query);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
    @Req() req: RequestWithUser,
  ): Promise<AdminUserItem> {
    const requesterUserId = req.user?.userId ?? '';
    return this.service.updateRole(id, body.role, requesterUserId);
  }
}
