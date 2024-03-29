import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CounterDocument, CounterSchemaName } from './counter.schema';
import { Model } from 'mongoose';

@Injectable()
export class CounterService {
    constructor(
        @InjectModel(CounterSchemaName)
        private readonly modelC: Model<CounterDocument>
    ) {}

    async setCounter(name: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const counter = await this.modelC.findByIdAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
                resolve(counter.seq);
            } catch (error) {
                reject(error);
            }
        });
    }
}
