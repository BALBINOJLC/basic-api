/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const PivotUserOrgSchemaName = 'PivotUserOrg';

@Schema({ collection: 'pivot-user-org', timestamps: true })
export class PivotUserOrg {
    @Prop({
        type: String,
        required: true,
    })
    org: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    user: string;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    deletedAt: Date;
}

export type PivotUserOrgDocument = PivotUserOrg & Document;
export const PivotUserOrgSchema = SchemaFactory.createForClass(PivotUserOrg);
