import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';

import { Role } from 'src/enums/role.enum';
import { UserResponse } from 'src/model/auth.model';
import { WebResponse } from 'src/model/web.model';
import { RoleGuard } from 'src/role/role.guard';
import { UserService } from './user.service';
import { SearchUserRequest } from 'src/model/user.model';
import { User as UserPrisma } from '@prisma/client';
import { User } from 'src/decorator/user.decorator';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @Roles(Role.TEACHER)
  @UseGuards(AuthGuard, RoleGuard)
  async getAll(
    @User() user: UserPrisma,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('count', new ParseIntPipe({ optional: true })) count?: number,
    @Query('search') search?: string,
  ): Promise<WebResponse<UserResponse[]>> {
    const request: SearchUserRequest = {
      search,
      page: page || 1,
      count: count || 10,
    };
    const result = await this.userService.getAll(request, user);
    return {
      success: true,
      data: result,
    };
  }
}
