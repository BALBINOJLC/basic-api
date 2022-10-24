import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from '../schemas';
import { CitySchemaName, CityServiceBase } from '@modules';
import { RegionService } from './region.service';

@Injectable()
export class CityService extends CityServiceBase {
    constructor(@InjectModel(CitySchemaName) private readonly model: Model<City>, private _regionService: RegionService) {
        super(model, _regionService);
    }
}
