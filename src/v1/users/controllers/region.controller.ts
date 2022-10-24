import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegionControllerBase } from '@modules';
import { RegionService } from '../services';

@ApiTags('Regions')
@Controller({ path: 'regions', version: '1' })
export class RegionController extends RegionControllerBase {
    constructor(private readonly _regionService: RegionService) {
        super(_regionService);
    }
}
