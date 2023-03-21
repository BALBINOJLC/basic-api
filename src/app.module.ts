import { Module } from '@nestjs/common';
import { AppImports } from './app.import';
import { CaslModule } from './casl/casl.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [...AppImports, HealthModule, CaslModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
