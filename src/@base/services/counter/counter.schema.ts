import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CounterSchemaName = 'Counter';

@Schema({ collection: 'counter', timestamps: true })
export class Counter {
    @Prop({ required: true })
    _id: string;

    @Prop({ default: 0 })
    seq: number;
}

export type CounterDocument = Counter & Document;
export const CounterSchema = SchemaFactory.createForClass(Counter);
