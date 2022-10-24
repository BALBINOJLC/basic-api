import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Country } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { CountrySchemaName, CountryServiceBase } from 'src/@modules';

@Injectable()
export class CountryService extends CountryServiceBase {
    constructor(@InjectModel(CountrySchemaName) private readonly model: Model<Country>) {
        super(model);
    }
}
