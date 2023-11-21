import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users';
import { IJwtUser } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly _userService: UserService,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_KEY'),
        });
    }

    async validate(payload: IJwtUser): Promise<IJwtUser> {
        let user;

        if (payload.userName) {
            user = await this._userService.findOne({
                userName: payload.userName,
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            SetMetadata('user', user);
        }

        return payload;
    }
}
