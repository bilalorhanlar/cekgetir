import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() orderData: any): Promise<{ pnr: string }> {
    try {
      this.logger.debug('Gelen sipariş verisi:', JSON.stringify(orderData, null, 2));
      
      const order = await this.orderService.create(orderData);
      this.logger.debug('Oluşturulan sipariş:', JSON.stringify(order, null, 2));
      
      if (!order || !order.pnrNo) {
        this.logger.error('Talep numarası oluşturulamadı:', order);
        throw new Error('Talep numarası oluşturulamadı');
      }

      return { pnr: order.pnrNo };
    } catch (error) {
      this.logger.error('Sipariş oluşturma hatası:', error);
      throw error;
    }
  }

  @Get()
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Get('pnr/:pnr')
  async findByPnr(@Param('pnr') pnr: string): Promise<Order> {
    const order = await this.orderService.findByPnr(pnr);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() orderData: Partial<Order>) {
    return this.orderService.update(id, orderData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.orderService.remove(id);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: Order['status']) {
    return this.orderService.findByStatus(status);
  }

  @Get('customer/:phone')
  findByCustomerPhone(@Param('phone') phone: string) {
    return this.orderService.findByCustomerPhone(phone);
  }
} 