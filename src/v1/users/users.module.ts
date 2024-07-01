import { Module } from '@nestjs/common';
import { UserService } from './services';
import { PrismaModule } from '@prisma';
import { UserController } from './controllers';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
