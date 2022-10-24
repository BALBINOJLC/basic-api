import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Region } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { RegionSchemaName, RegionServiceBase } from '@modules';
import { CountryService } from './country.service';
@Injectable()
export class RegionService extends RegionServiceBase {
    constructor(@InjectModel(RegionSchemaName) private readonly model: Model<Region>, private _countryService: CountryService) {
        super(model, _countryService);
    }
}
