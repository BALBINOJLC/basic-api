import { EmailAuthService } from '@email';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceBase } from '@modules';

import { UserService } from '../../users';

@Injectable()
export class AuthService extends AuthServiceBase {
    constructor(private _userService: UserService, private jwtService: JwtService, private _emailService: EmailAuthService) {
        super(_userService, jwtService, _emailService);
    }
}
