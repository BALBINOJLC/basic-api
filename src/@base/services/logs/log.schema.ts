import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const LogSchemaName = 'Log';

@Schema({ collection: 'log', timestamps: true })
export class Log {
    @Prop({ required: true })
    user_id: string; // Usando snake_case directamente para el nombre de la propiedad

    @Prop({ required: true })
    document_id: string; // Usando snake_case directamente para el nombre de la propiedad

    @Prop({ required: true, enum: ['create', 'update', 'delete', 'read'] })
    action: string; // La propiedad 'action' no necesita cambio, ya está en formato adecuado

    @Prop()
    details: string; // La propiedad 'details' no necesita cambio, ya está en formato adecuado

    @Prop({ required: true })
    ip_address: string; // Usando snake_case directamente para el nombre de la propiedad
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
