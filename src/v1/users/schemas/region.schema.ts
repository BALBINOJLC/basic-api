import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RegionBase } from '@modules';

@Schema({ collection: 'regions', timestamps: true })
export class Region extends RegionBase {}

export type RegionDocument = Region & Document;
export const RegionSchema = SchemaFactory.createForClass(Region);
