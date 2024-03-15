import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services';
import { JwtStrategy } from './jwt.strategy';
import { AuthController, MessagesController } from './controllers';
import { UsersModule } from '../users';
import { LocalStrategy } from './local.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { CodesSchema, CodesSchemaName } from './schemas';
import { EmailsModule } from '@email';
import { OrganizationsModule } from '../orgs/orgs.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: CodesSchemaName, schema: CodesSchema }]),
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_KEY,
            signOptions: { expiresIn: 3600 * 60 * 60 * 24 },
        }),
        EmailsModule,
        OrganizationsModule,
    ],
    controllers: [AuthController, MessagesController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
