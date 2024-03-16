import { Module } from '@nestjs/common';
import { AppImports } from './app.import';
import { CaslModule } from './casl/casl.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from '@auth';
import { UsersModule } from '@users';

@Module({
    imports: [...AppImports, HealthModule, CaslModule, AuthModule, UsersModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
