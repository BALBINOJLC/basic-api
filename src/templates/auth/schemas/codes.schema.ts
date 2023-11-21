import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CodesSchemaName = 'Codes';

@Schema({ collection: 'codes', timestamps: true })
export class Codes {
    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    code: string;

    @Prop({
        type: String,
        required: true,
    })
    email: string;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    deletedAt: Date;
}

export type CodesDocument = Codes & Document;

export const CodesSchema = SchemaFactory.createForClass(Codes);
