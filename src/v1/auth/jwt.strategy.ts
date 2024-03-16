import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users';
import { IJwtUser } from './interfaces';
import { envs } from 'src/config/envs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly _userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envs.jwt,
        });
    }

    async validate(payload: IJwtUser): Promise<IJwtUser> {
        let user;
        if (payload.user_name) {
            user = await this._userService.findOne({
                user_name: payload.user_name,
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            SetMetadata('user', user);
        }

        return payload;
    }
}
