import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TokenDto } from 'src/role/role.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload: TokenDto = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
    });

    const user = this.prismaService.user.findFirst({
      select: {
        id: true,
        email: true,
        fullname: true,
        username: true,
        provider: true,
        image: true,
        NPM: true,
        golongan: true,
        role: true,
        createdAt: true,
      },
      where: {
        username: payload.username,
        deletedAt: {
          isSet: false,
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    request['token'] = payload;
    request['user'] = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type == 'Bearer' ? token : undefined;
  }
}
