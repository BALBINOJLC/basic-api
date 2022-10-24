import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressControllerBase } from '@modules';

import { AddressService } from '../services';

@ApiTags('Address')
@Controller({ path: 'address', version: '1' })
export class AddressController extends AddressControllerBase {
    constructor(private readonly _addressService: AddressService) {
        super(_addressService);
    }
}
