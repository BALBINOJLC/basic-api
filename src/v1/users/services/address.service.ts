import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from '../schemas';
import { AddressSchemaName, AddressServiceBase } from '@modules';
import { UserService } from './user.service';

@Injectable()
export class AddressService extends AddressServiceBase {
    constructor(@InjectModel(AddressSchemaName) private readonly model: Model<Address>, private _userService: UserService) {
        super(model, _userService);
    }
}
