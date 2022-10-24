import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CountryControllerBase } from '@modules';

import { CountryService } from '../services';

@ApiTags('Countries')
@Controller({
    version: '1',
    path: 'countries',
})
export class CountryController extends CountryControllerBase {
    constructor(private readonly _countryService: CountryService) {
        super(_countryService);
    }
}
