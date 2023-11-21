import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PhotoDto } from '@utils';
import { Document, Types } from 'mongoose';
import { UserRolesEnum, UserTypesEnum } from '../enums';

export const UserSchemaName = 'UserSchema';
@Schema({ collection: 'users', timestamps: true })
export class User {
    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    email: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    userName: string;

    @Prop({
        type: String,
        required: true,
    })
    firstName: string;

    @Prop({
        type: String,
        required: true,
    })
    lastName: string;

    @Prop({
        type: String,
    })
    phone: string;

    @Prop({
        type: String,
    })
    phone_area: string;

    @Prop({
        type: Date,
    })
    lastLogin: Date;

    @Prop({
        type: String,
        required: true,
    })
    displayName: string;

    @Prop({ enum: UserTypesEnum, required: true })
    type: UserTypesEnum;

    @Prop({ enum: UserRolesEnum, required: true })
    role: UserRolesEnum;

    @Prop({
        type: String,
        required: true,
    })
    password: string;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    emailVerify: boolean;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    isActive: boolean;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    twoAuth: boolean;

    @Prop({ type: PhotoDto })
    photoUrl: PhotoDto;

    @Prop({
        type: String,
    })
    dni: string;

    @Prop({
        type: String,
    })
    country: string;

    @Prop({
        type: String,
    })
    accessToken: string;

    @Prop({
        type: Types.ObjectId,
        default: null,
        ref: 'Orgs',
        autopopulate: {
            select: 'name',
        },
    })
    org: any;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date })
    deletedAt: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
