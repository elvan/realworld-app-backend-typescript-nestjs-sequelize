import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Token'),
      secretOrKey: configService.get('jwt.secret') || 'fallback-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.id);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return user;
  }
}
