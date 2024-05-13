import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Action } from 'src/enums/action.enum';
import { SearchUserRequest } from 'src/model/user.model';
import { User as UserAction } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async getAll(request: SearchUserRequest, user: User) {
    try {
      const ability = this.caslAbilityFactory.createForUser(user);
      console.log(ability.can(Action.Read, UserAction));
    } catch (err) {
      console.log(err);
    }
    const data = await this.prismaService.user.findMany({
      take: request.count,
      skip: request.count * (request.page - 1),
      select: {
        id: true,
        email: true,
        fullname: true,
        username: true,
        provider: true,
        image: true,
        phoneNumber: true,
        role: true,
        golongan: true,
        NPM: true,
        userCourses: true,
        createdAt: true,
      },
      where: {
        role: {
          not: {
            equals: 'SUPERADMIN',
          },
        },
        fullname: {
          contains: request.search,
        },
        deletedAt: {
          isSet: false,
        },
      },
    }); // if role admin
    return await this.prismaService.user.findMany();
  }
}
