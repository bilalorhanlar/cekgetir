import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix ekle
  app.setGlobalPrefix('api');
  
  // CORS ayarları
  app.enableCors({
    origin: [
      'http://172.20.10.2:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true
  });

  await app.listen(4000);
}
bootstrap();
