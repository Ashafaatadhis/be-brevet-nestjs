import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {
    super();
  }
  async onModuleInit() {
    this.logger.info('Prisma connected');

    await this.$connect();
  }
}
