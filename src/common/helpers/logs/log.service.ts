import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogDocument, LogSchemaName } from './log.schema';
import { LogDto } from './log.dto';

@Injectable()
export class LogService {
    constructor(
        @InjectModel(LogSchemaName)
        private readonly logModel: Model<LogDocument>
    ) {}

    // Método para guardar un log
    async saveLog(createLogDto: LogDto): Promise<LogDocument> {
        const newLog = new this.logModel(createLogDto);
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
