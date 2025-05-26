import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FaqModule } from './faq/faq.module';
import { ContactModule } from './contact/contact.module';
import { VariablesModule } from './variables/variables.module';
import { JwtAuthModule } from './auth/jwt.module';
import { OrderModule } from './order/order.module';
import { SmsService } from './common/sms/services/sms.service';
import { EmailModule } from './common/email/email.module';
import 'dotenv/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Sadece geliştirme ortamında true olmal
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    FaqModule,
    ContactModule,
    VariablesModule,
    JwtAuthModule,
    OrderModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, SmsService],
})
export class AppModule {}
