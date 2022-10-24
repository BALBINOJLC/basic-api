import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CityBase } from '@modules';

@Schema({ collection: 'cities', timestamps: true })
export class City extends CityBase {}

export type CityDocument = City & Document;
export const CitySchema = SchemaFactory.createForClass(City);
