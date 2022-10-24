import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './controllers';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users';
import { EmailAuthService } from '@email';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_KEY,
            signOptions: { expiresIn: 3600 * 60 * 60 * 24 },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, EmailAuthService],
    exports: [AuthService],
})
export class AuthModule {}
