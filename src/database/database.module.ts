import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('database.dialect'),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadModels: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: configService.get('database.logging'),
        define: configService.get('database.define'),
        pool: configService.get('database.pool'),
      }),
    }),
  ],
})
export class DatabaseModule {}
