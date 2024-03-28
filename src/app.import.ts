/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const AppImports = [
    ConfigModule.forRoot({
        isGlobal: true,
    }),

    MongooseModule.forRootAsync({
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
    }),
];
