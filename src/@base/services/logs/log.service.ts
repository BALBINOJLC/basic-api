import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogDocument, LogSchemaName } from './log.schema';

@Injectable()
export class LogService {
    constructor(
        @InjectModel(LogSchemaName) // Inyecta el modelo de Log basado en el esquema que definimos
        private readonly logModel: Model<LogDocument> // Modelo para interactuar con los logs
    ) {}

    // Método para guardar un log
    async saveLog(createLogDto: {
        user_id: string;
        document_id: string;
        action: string;
        details?: string;
        ip_address: string;
    }): Promise<LogDocument> {
        const newLog = new this.logModel({
            user_id: createLogDto.user_id,
            document_id: createLogDto.document_id,
            action: createLogDto.action,
            details: createLogDto.details,
            ip_address: createLogDto.ip_address,
        });
        return newLog.save();
    }

    // Método para listar todos los logs
    async listLogs(): Promise<LogDocument[]> {
        try {
            return await this.logModel.find().exec();
        } catch (error) {
            throw error;
        }
    }
}
