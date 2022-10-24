import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController, AddressController, CityController, RegionController, CountryController } from './controllers';
import { AddressService, CountryService, RegionService, UserService } from './services';
import { AddressSchema, CitySchema, CountrySchema, RegionSchema, UserSchema } from './schemas';
import { CityService } from './services/city.service';
import { AddressSchemaName, CitySchemaName, CountrySchemaName, RegionSchemaName, UserSchemaName } from '@modules';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserSchemaName, schema: UserSchema },
            { name: CitySchemaName, schema: CitySchema },
            { name: CountrySchemaName, schema: CountrySchema },
            { name: RegionSchemaName, schema: RegionSchema },
            { name: AddressSchemaName, schema: AddressSchema },
        ]),
    ],

    providers: [UserService, AddressService, CityService, RegionService, CountryService],
    controllers: [UserController, AddressController, CityController, RegionController, CountryController],
    exports: [UserService, AddressService, CityService, RegionService, CountryService],
})
export class UsersModule {}
