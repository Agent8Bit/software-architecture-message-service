import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.get(MikroORM).migrator.up();

  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('Messaging API')
    .setDescription('API documentation for the Messaging application')
    .setVersion('1.0')
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: '/api-docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
