import * as helmet from 'helmet';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
    });
    const config = app.get<ConfigService>(ConfigService);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            //forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        })
    );
    app.setGlobalPrefix(config.get('APP_PREFIX'));
    app.enableCors();
    app.enableVersioning({
        type: VersioningType.URI,
    });
    app.use(helmet.contentSecurityPolicy());
    app.use(helmet.crossOriginEmbedderPolicy());
    app.use(helmet.crossOriginOpenerPolicy());
    app.use(helmet.crossOriginResourcePolicy());
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    const configSw = new DocumentBuilder()
        .setTitle('Base API Nestjs Startups Cell')
        .setDescription('This is the documentation of the base api from Statups Cell')
        .setVersion('1.0')
        .addTag('Startups Cell')
        .addBasicAuth()
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, configSw);
    SwaggerModule.setup('docs', app, document);

    await app.listen(config.get('PORT'));
}
bootstrap();
