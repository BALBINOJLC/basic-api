import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import config from 'src/config';
import { EmailAuthServiceBase } from '@modules';

@Injectable()
export class EmailAuthService extends EmailAuthServiceBase {
    constructor(@Inject(config.KEY) private configService: ConfigType<typeof config>) {
        super(configService);
    }
}
