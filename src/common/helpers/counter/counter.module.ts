import { MongooseModule } from '@nestjs/mongoose';
import { CounterSchema, CounterSchemaName } from './counter.schema';
import { Module } from '@nestjs/common';
import { CounterService } from './counter.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: CounterSchemaName, schema: CounterSchema }])],
    providers: [CounterService],
    controllers: [],
    exports: [CounterService],
})
export class CountersModule {}
