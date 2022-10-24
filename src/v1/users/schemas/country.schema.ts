import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CountryBase } from '@modules';

@Schema({ collection: 'countries', timestamps: true })
export class Country extends CountryBase {}

export type CountryDocument = Country & Document;
export const CountrySchema = SchemaFactory.createForClass(Country);
