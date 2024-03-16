import { Module } from '@nestjs/common';
import { UserService } from './services';
import { UserController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserSchemaName } from './schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSchemaName, schema: UserSchema }])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UsersModule {}
