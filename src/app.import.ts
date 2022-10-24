/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import configE from './config';
import { environmetns } from './environments';
//TODO sacar gitignore
export const AppImports = [
    ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: Joi.object({
            NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
            APP_PORT: Joi.number().default(3000),
            APP_PREFIX: Joi.string().required(),
            MS_ACCESS_KEY: Joi.string().required(),

            LOGGER_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'log', 'silent').default('info'),
            LOGGER_PRETTY_PRINT: Joi.boolean().default(false),

            MONGO_URL: Joi.string().required(),

            JWT_KEY: Joi.string().required(),
            URI_FRONT: Joi.string(),
            // Set Optional if not Use this Module
            API_KEY_ONE_CLICK: Joi.string().required(),
            ECOMMERCE_CODE_ONECLICK_MALL: Joi.number().required(),
            ECOMMERCE_CODE_ONECLICK_SHOP: Joi.number().required(),
            // Set Optional if not Use this Module
            SENDGRID_API_KEY: Joi.string().required(),
            TEMPLATE_VERIFY_ACCOUNT: Joi.string().required(),
            TEMPLATE_RESET_PASSWORD: Joi.string().required(),
        }),
        load: [configE],
        envFilePath: environmetns[process.env.NODE_ENV] || '.env',
    }),
    MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],

        useFactory: (config: ConfigService) => ({
            uri: config.get('MONGO_URL'),
            dbName: config.get('DB_NAME'),
            connectionFactory: (connection) => {
                connection.plugin(require('mongoose-autopopulate'));
                return connection;
            },
        }),
    }),
    LoggerModule.forRoot(),
];
