/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import configE from './config';

export const AppImports = [
    ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: Joi.object({
            API_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
            API_PORT: Joi.number().required(),
            API_PREFIX: Joi.string().required(),
            API_URI: Joi.string().required(),
            CLIENT_URI: Joi.string().required(),

            LOGGER_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'log', 'silent').default('silent'),
            LOGGER_PRETTY_PRINT: Joi.boolean().default(true),

            JWT_KEY: Joi.string().required(),
        }),
        load: [configE],
    }),

    // Activar si usa Mongo DB
    /* MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],

        useFactory: (config: ConfigService) => ({
            uri: config.get('DB_URL'),
            dbName: config.get('DB_NAME'),
            connectionFactory: (connection) => {
                connection.plugin(require('mongoose-autopopulate'));
                return connection;
            },
        }),
    }), */

    LoggerModule.forRoot({
        pinoHttp: {
            level: process.env.LOGGER_LEVEL,
        },
    }),
];
