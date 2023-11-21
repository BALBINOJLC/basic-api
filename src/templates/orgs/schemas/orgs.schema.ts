/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from '@users';
import { PhotoDto } from '@utils';
import { Document, Types } from 'mongoose';

export const OrgSchemaName = 'Orgs';

@Schema({ collection: 'orgs', timestamps: true })
export class Org {
    @Prop()
    name: string;

    @Prop({ type: PhotoDto })
    logo: PhotoDto;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    slug: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ default: 'USD' })
    currency: string;

    @Prop()
    description: string;

    @Prop({ default: 0 })
    workingProgress: number;

    @Prop({ default: [] })
    schedule: any[];

    @Prop()
    hoursByDay: number;

    @Prop({ default: 6 })
    hourInitWork: number;

    @Prop()
    userQuantity: number;

    @Prop({ default: false })
    ownerInWIP: boolean;

    @Prop({ default: 'ES' })
    language: string;

    @Prop()
    timeZone: string;

    @Prop({
        type: Types.ObjectId,
        required: true,
        ref: 'UserSchema',
    })
    owner: UserDocument;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    deletedAt: Date;
}

export type OrgDocument = Org & Document;
export const OrgSchema = SchemaFactory.createForClass(Org);
