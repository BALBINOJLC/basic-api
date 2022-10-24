import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AddressBase } from '@modules';

@Schema({ collection: 'addresses', timestamps: true })
export class Address extends AddressBase {}

export type AddressDocument = Address & Document;
export const AddressSchema = SchemaFactory.createForClass(Address);
