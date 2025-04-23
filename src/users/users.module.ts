import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserFollow } from './models/user-follow.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserFollow]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService, ProfilesService],
  exports: [UsersService, ProfilesService],
})
export class UsersModule {}
