import { Module } from '@nestjs/common';
import { OrganizationsService } from './services';
import { OrganizationsController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { OrgSchema, OrgSchemaName, PivotUserOrgSchema, PivotUserOrgSchemaName } from './schemas';
import { UsersModule } from '@users';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OrgSchemaName, schema: OrgSchema },
            { name: PivotUserOrgSchemaName, schema: PivotUserOrgSchema },
        ]),
        UsersModule,
    ],
    providers: [OrganizationsService],
    controllers: [OrganizationsController],
    exports: [OrganizationsService],
})
export class OrganizationsModule {}
