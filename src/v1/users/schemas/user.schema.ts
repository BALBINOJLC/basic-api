import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserBase } from '@modules';

@Schema({ collection: 'users', timestamps: true })
export class User extends UserBase {}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
