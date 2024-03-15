import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRolesEnum, UserTypesEnum } from '../../../domain';
import { PhotoDto } from '@utils';

export const UserSchemaName = 'UserSchema';
@Schema({ collection: 'users', timestamps: true })
export class User {
    @Prop({
        type: String,
        required: true,
    })
    first_name: string;

    @Prop({
        type: String,
        required: true,
    })
    last_name: string;

    @Prop({
        type: String,
    })
    phone: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    email: string;

    @Prop({
        type: String,
    })
    birthday_date?: string;

    @Prop({
        type: String,
    })
    dni?: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    user_name: string;

    @Prop({
        type: String,
        required: true,
    })
    display_name: string;

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
    email_verify: boolean;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    is_active: boolean;

    @Prop({
        type: Boolean,
        required: true,
        default: false,
    })
    two_auth: boolean;

    @Prop({
        type: String,
    })
    phone_area: string;

    @Prop({
        type: Date,
    })
    last_login: Date;

    @Prop({ type: PhotoDto })
    photo_url: PhotoDto;

    @Prop({
        type: String,
    })
    access_token: string;

    @Prop({ type: String })
    about: string;

    @Prop({ type: Boolean, default: false })
    is_deleted: boolean;

    @Prop({ type: Date })
    deleted_at: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
