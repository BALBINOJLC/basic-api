/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { HealthDto } from './health.dto';

@Injectable()
export class HealthService {
    constructor(private configService: ConfigService, private logger: Logger) {}

    getHealthCheck(): HealthDto {
        this.logger.log('getHealthCheck in version %o', `${HealthService.name}:${this.getHealthCheck.name}`, process.version);

        return {
            nodeVersion: process.version,
            uptime: process.uptime(),
            environment: this.configService.get('NODE_ENV'),
            service: this.configService.get('npm_package_name'),
            appVersionPackage: this.configService.get('npm_package_version'),
        };
    }

    getOk(): string {
        return 'Ok!';
    }

    getWhoami(user: any): string {
        this.logger.log({ user }, `${HealthService.name}:${this.getWhoami.name}`);
        return `Hi ${user.userName}`;
    }
}
