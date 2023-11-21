import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers';
import { UserService } from './services';
import { UserSchema } from './schemas';
import { UserSchemaName } from '.';
import { JwtModule } from '@nestjs/jwt';
import { EmailsModule } from '@email';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserSchemaName, schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.JWT_KEY,
            signOptions: { expiresIn: 3600 * 60 * 60 * 24 },
        }),
        EmailsModule,
    ],

    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UsersModule {}
