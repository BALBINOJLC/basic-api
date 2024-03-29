import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LogTypeEnum } from './log.enum';

export const LogSchemaName = 'Log';

@Schema({ collection: 'log', timestamps: true })
export class Log {
    @Prop({
        type: String,
        required: true,
    })
    user_name: string;

    @Prop({
        enum: LogTypeEnum,
        required: true,
    })
    type: LogTypeEnum;

    @Prop({
        type: String,
        required: true,
    })
    module: string;

    @Prop({
        type: String,
        required: true,
    })
    actionDescription: string;

    @Prop({
        type: Object,
        required: true,
    })
    error: object;

    @Prop({
        type: String,
        required: false,
    })
    ip_address: string;
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
