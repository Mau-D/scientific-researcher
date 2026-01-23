/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  //TODO: Voir la pertinence du GlobalExceptionFilter
  // Applique le filtre à TOUTE l'application
  app.useGlobalFilters(new GlobalExceptionFilter());
  // TODO: Gestion des CORS en production
  // Active CORS pour autoriser les requêtes venant du port de l'app Reasearch-app
  app.enableCors({
    origin: 'http://localhost:61952'
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
