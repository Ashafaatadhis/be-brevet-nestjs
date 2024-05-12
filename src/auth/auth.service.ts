import { HttpCode, HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ValidationService } from 'src/common/validation/validation.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import {
  LoginUserRequest,
  LogoutResponse,
  RefreshResponse,
  RegisterUserRequest,
  UserResponse,
} from 'src/model/auth.model';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`Register with request : ${request}`);
    const registerData: RegisterUserRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    const hashing = await bcrypt.hash(registerData.password, 10);
    const userExist = await this.prismaService.user.findFirst({
      where: {
        email: registerData.email,
        provider: 'LOCAL',
        deletedAt: {
          isSet: false,
        },
      },
    });

    if (userExist) {
      throw new HttpException('User already registered', 409);
    }

    const result = await this.prismaService.user.create({
      data: {
        email: registerData.email,
        fullname: registerData.fullname,
        password: hashing,
        username: registerData.username,
      },
    });

    return {
      id: result.id,
      fullname: result.fullname,
      username: result.username,
      email: result.email,
      golongan: result.golongan,
      image: result.image,
      NPM: result.NPM,
      phoneNumber: result.phoneNumber,
      provider: result.provider,
      role: result.role,
      createdAt: result.createdAt,
    };
  }

  async login(
    request: LoginUserRequest,
    response: Response,
  ): Promise<{ accessToken: string; data: UserResponse }> {
    this.logger.debug(`Login with request : ${request}`);

    const loginData: LoginUserRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    const isExistUser = await this.prismaService.user.findFirst({
      where: {
        username: loginData.username,
        deletedAt: {
          isSet: false,
        },
      },
      include: {
        userCourses: true,
      },
    });

    if (!isExistUser) {
      throw new HttpException('User or password wrong', 401);
    }

    if (!(await bcrypt.compare(loginData.password, isExistUser.password))) {
      throw new HttpException('user or password wrong', 401);
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: isExistUser.id,
        username: isExistUser.username,
        role: isExistUser.role,
        email: isExistUser.email,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1h',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        id: isExistUser.id,
        username: isExistUser.username,
        role: isExistUser.role,
        email: isExistUser.email,
      },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '1d',
      },
    );
    response.cookie('refreshToken', refreshToken, {
      sameSite:
        this.configService.get<string>('NODE_ENV') !== 'development'
          ? 'none'
          : 'lax',
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') !== 'development',
      maxAge: 60 * 60 * 24 * 1000, // 1 day
    });

    return {
      accessToken,
      data: {
        id: isExistUser.id,
        fullname: isExistUser.fullname,
        username: isExistUser.username,
        email: isExistUser.email,
        golongan: isExistUser.golongan,
        image: isExistUser.image,
        NPM: isExistUser.NPM,
        phoneNumber: isExistUser.phoneNumber,
        provider: isExistUser.provider,
        role: isExistUser.role,
        createdAt: isExistUser.createdAt,
      },
    };
  }

  async refreshToken(
    token: string,
    response: Response,
  ): Promise<RefreshResponse> {
    if (!token) {
      throw new HttpException('Token not valid', 401);
    }

    const user: any = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });

    const isExistUser = await this.prismaService.user.findFirst({
      where: {
        username: user.username,
        deletedAt: {
          isSet: false,
        },
      },
    });

    if (!isExistUser) {
      response.clearCookie('resfreshToken');
      throw new HttpException('Token not valid', 401);
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: isExistUser.id,
        username: isExistUser.username,
        role: isExistUser.role,
        email: isExistUser.email,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1h',
      },
    );

    return {
      accessToken,
    };
  }

  async logout(response: Response): Promise<LogoutResponse> {
    response.clearCookie('refreshToken');
    return {
      success: true,
    };
  }
}
