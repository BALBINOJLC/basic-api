/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import configE from './config';
//TODO sacar gitignore
export const AppImports = [
    ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: Joi.object({
            API_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
            APP_PORT: Joi.number().default(3000),
            API_PREFIX: Joi.string().required(),

            LOGGER_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'log', 'silent').default('info'),
            LOGGER_PRETTY_PRINT: Joi.boolean().default(false),

            JWT_KEY: Joi.string().required(),
            CLIENT_URI: Joi.string(),

            // Set Optional if not Use this Module
            SG_API_KEY: Joi.string().required(),
            SG_TP_VERIFY_ACCOUNT: Joi.string().required(),
            SG_TP_RESET_PASSWORD: Joi.string().required(),
        }),
        load: [configE],
    }),

    LoggerModule.forRoot(),
];
