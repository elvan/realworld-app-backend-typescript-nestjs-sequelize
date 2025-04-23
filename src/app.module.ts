import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SharedModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
  ],
})
export class AppModule {}
