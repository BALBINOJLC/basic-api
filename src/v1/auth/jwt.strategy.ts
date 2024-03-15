import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users';
import { IJwtUser } from './interfaces';
import { OrganizationsService } from '@org';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly _userService: UserService,
        private readonly configService: ConfigService,
        private readonly _organizationsService: OrganizationsService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_KEY'),
        });
    }

    async validate(payload: IJwtUser): Promise<IJwtUser> {
        let user;
        let org;
        if (payload.user_name) {
            user = await this._userService.findOne({
                user_name: payload.user_name,
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            SetMetadata('user', user);
        } else if (payload.org) {
            org = await this._organizationsService.findOne({
                _id: payload.org._id,
            });

            if (!org) {
                throw new UnauthorizedException();
            }

            SetMetadata('org', org);
        }

        return payload;
    }
}
