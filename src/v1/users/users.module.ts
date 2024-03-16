import { Module } from '@nestjs/common';
import { UserService } from './services';
import { UserController } from './controllers';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserSchemaName } from './schemas';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserSchemaName, schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.JWT_KEY,
            signOptions: { expiresIn: 3600 * 60 * 60 * 24 },
        }),
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UsersModule {}
