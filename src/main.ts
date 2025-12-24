import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { MyLogger } from 'src/logger/my.logger';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useLogger(new MyLogger());
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '../uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
