import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityControllerBase } from '@modules';

import { CityService } from '../services/city.service';

@ApiTags('Cities')
@Controller({ path: 'cities', version: '1' })
export class CityController extends CityControllerBase {
    constructor(private readonly _cityService: CityService) {
        super(_cityService);
    }
}
