import { MongooseModule } from '@nestjs/mongoose';
import { LogSchema, LogSchemaName } from './log.schema';
import { Module } from '@nestjs/common';
import { LogService } from './log.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: LogSchemaName, schema: LogSchema }])],
    providers: [LogService],
    controllers: [],
    exports: [LogService],
})
export class LogsModule {}
