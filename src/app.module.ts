import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [CommonModule, AuthModule, UserModule, SharedModule, CaslModule],
})
export class AppModule {}
