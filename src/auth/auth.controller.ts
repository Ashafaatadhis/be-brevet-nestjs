import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { Request, Response } from 'express';
import { Cookies } from 'src/decorator/cookies.decorator';
import { WebResponse } from 'src/model/web.model';
import {
  RefreshResponse,
  RegisterUserRequest,
  UserResponse,
} from 'src/model/auth.model';

@Controller('/api')
export class AuthController {
  constructor(private userService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);

    return {
      success: true,
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request, response);
    return {
      success: true,
      accessToken: result.accessToken,
      data: result.data,
    };
  }

  @Post('/refreshToken')
  @HttpCode(200)
  async refreshToken(
    @Cookies('refreshToken') token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponse> {
    const result = await this.userService.refreshToken(token, response);
    return {
      success: true,
      accessToken: result.accessToken,
    };
  }

  @Delete('/logout')
  @HttpCode(200)
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<boolean>> {
    const result = await this.userService.logout(response);
    return {
      success: result.success,
      data: true,
    };
  }
}
