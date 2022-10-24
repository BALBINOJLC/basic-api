import { Controller, Inject } from '@nestjs/common';

import { AuthService } from '../services';
import { ApiTags } from '@nestjs/swagger';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';
import { AuthControllerBase } from '@modules';

@ApiTags('AUTH')
@Controller({
    version: '1',
    path: 'auth',
})
export class AuthController extends AuthControllerBase {
    constructor(private _authService: AuthService, @Inject(config.KEY) private _configService: ConfigType<typeof config>) {
        super(_authService, _configService);
    }
}
