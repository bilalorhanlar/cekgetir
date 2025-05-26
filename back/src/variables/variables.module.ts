import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';

import { 
  CarSegment,
  CarStatus,
  YolYardim,
  OzelCekici,
  OzelCekiciSehir,
  TopluCekiciSehir,
  TopluCekiciKmFiyat,
  TopluCekici
} from './variables.entity';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarSegment,
      CarStatus,
      YolYardim,
      OzelCekici,
      OzelCekiciSehir,
      TopluCekiciSehir,
      TopluCekiciKmFiyat,
      TopluCekici
    ]),
    JwtAuthModule
  ],
  controllers: [VariablesController],
  providers: [VariablesService],
  exports: [VariablesService]
})
export class VariablesModule {} 