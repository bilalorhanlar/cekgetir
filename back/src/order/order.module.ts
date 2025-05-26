import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { BulkVehicle } from './bulk-vehicle.entity';
import { SmsService } from '../common/sms/services/sms.service';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, BulkVehicle]),
    EmailModule
  ],
  controllers: [OrderController],
  providers: [OrderService, SmsService],
  exports: [OrderService],
})
export class OrderModule {} 