import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const MongooseConfig = (config: ConfigService): MongooseModuleOptions => ({
    uri: config.get('MONGO_URL'),
});
