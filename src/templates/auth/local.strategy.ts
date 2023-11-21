/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services';
import { UserDocument } from '@users';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(userName: string, password: string): Promise<UserDocument> {
        const user = await this.authService.validateUser(userName, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
