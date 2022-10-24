import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategyBase } from '@modules';
import { UserService } from '../users';

@Injectable()
export class JwtStrategy extends JwtStrategyBase {
    constructor(private readonly userService: UserService, private readonly configService: ConfigService) {
        super(userService, configService);
    }
}
