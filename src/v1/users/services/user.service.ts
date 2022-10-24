import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchemaName, UserServiceBase } from '@modules';
import { UserDocument } from '../schemas';

@Injectable()
export class UserService extends UserServiceBase {
    constructor(
        @InjectModel(UserSchemaName)
        private readonly model: Model<UserDocument>
    ) {
        super(model);
    }
}
