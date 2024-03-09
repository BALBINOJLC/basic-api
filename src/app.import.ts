/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from 'nestjs-pino';

export const AppImports = [
    ConfigModule.forRoot({
        isGlobal: true,
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
