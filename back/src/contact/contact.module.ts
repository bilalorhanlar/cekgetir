import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    JwtAuthModule
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {} 