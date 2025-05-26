import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { BulkVehicle } from './bulk-vehicle.entity';
import { v4 as uuidv4 } from 'uuid';
import { SmsService } from '../common/sms/services/sms.service';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(BulkVehicle)
    private bulkVehicleRepository: Repository<BulkVehicle>,
    private smsService: SmsService,
    private emailService: EmailService,
  ) {}

  private generatePNR(): string {
    // 6 karakterli benzersiz PNR oluştur (harf ve rakam kombinasyonu)
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('Generated Talep No:', pnr);
    return pnr;
  }

  async create(orderData: any): Promise<Order> {
    const pnr = this.generatePNR();
    console.log('Creating order with Talep No:', pnr);
    console.log('Order data received:', JSON.stringify(orderData, null, 2));
    console.log('Vehicle condition:', orderData.vehicles);
    // Ana sipariş verilerini oluştur
    const order = this.orderRepository.create({
      pnrNo: pnr,
      customerName: orderData.customerInfo?.ad || '',
      customerSurname: orderData.customerInfo?.soyad || '',
      customerTc: orderData.customerInfo?.tcKimlik || '11111111',
      customerPhone: orderData.customerInfo?.telefon || '',
      customerEmail: orderData.customerInfo?.email || '',
      companyName: orderData.customerInfo?.firmaAdi || '',
      taxNumber: orderData.customerInfo?.vergiNo || '',
      taxOffice: orderData.customerInfo?.vergiDairesi || '',
      serviceType: orderData.serviceType || 'YOL_YARDIM',
      // Yol Yardım için konum bilgileri
      breakdownLocation: orderData.serviceType === 'YOL_YARDIM' ? orderData.breakdownLocation : null,
      breakdownDescription: orderData.serviceType === 'YOL_YARDIM' ? orderData.breakdownDescription : null,
      destinationLocation: orderData.serviceType === 'YOL_YARDIM' ? orderData.destinationLocation : null,
      // Özel ve Toplu Çekici için konum bilgileri
      pickupLocation: orderData.serviceType !== 'YOL_YARDIM' ? orderData.pickupLocation : null,
      dropoffLocation: orderData.serviceType !== 'YOL_YARDIM' ? orderData.dropoffLocation : null,
      isPickupFromParking: orderData.isPickupFromParking || false,
      isDeliveryToParking: orderData.isDeliveryToParking || false,
      vehicleSegment: orderData.vehicles?.[0]?.tip || '',
      vehicleBrand: orderData.vehicles?.[0]?.marka || '',
      vehicleModel: orderData.vehicles?.[0]?.model || '',
      vehicleYear: orderData.vehicles?.[0]?.yil || '',
      vehiclePlate: orderData.vehicles?.[0]?.plaka || '',
      price: orderData.price || 0,
      vehicleCondition: orderData.vehicles?.[0]?.condition || '',
      status: 'ONAY_BEKLIYOR',
      paymentStatus: 'ODEME_BEKLIYOR'
    });

    console.log('Created order object:', order);

    try {
      // Siparişi kaydet
      const savedOrder = await this.orderRepository.save(order);
      console.log('Saved order:', savedOrder);

      // Eğer toplu çekici ise araçları kaydet
      if (orderData.serviceType === 'TOPLU_CEKICI' && orderData.vehicles?.length > 0) {
        const bulkVehicles = orderData.vehicles.map(vehicle => 
          this.bulkVehicleRepository.create({
            tip: vehicle.tip,
            marka: vehicle.marka,
            model: vehicle.model,
            yil: vehicle.yil,
            plaka: vehicle.plaka,
            condition: vehicle.condition,
            orderId: savedOrder.id
          })
        );
        console.log('Creating bulk vehicles:', bulkVehicles);
        await this.bulkVehicleRepository.save(bulkVehicles);
        console.log('Bulk vehicles saved successfully');
      }

      // SMS gönder
      try {
        console.log('Attempting to send SMS for order:', savedOrder);
        await this.smsService.sendOrderConfirmationSms(savedOrder);
        console.log('SMS sent successfully');
      } catch (smsError) {
        console.error('SMS gönderme hatası:', smsError);
        // SMS hatası sipariş oluşturmayı etkilemesi
      }

      return savedOrder;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['bulkVehicles']
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['bulkVehicles']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async findByPnr(pnr: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { pnrNo: pnr },
      relations: ['bulkVehicles']
    });
    
    if (!order) {
      throw new NotFoundException(`Order with PNR ${pnr} not found`);
    }
    
    return order;
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    const order = await this.findOne(id);
    
    // If payment status is being updated, send email
    if (orderData.paymentStatus && orderData.paymentStatus !== order.paymentStatus) {
      try {
        await this.emailService.sendPaymentStatusEmail(
          order.customerEmail,
          order.id,
          order.pnrNo,
          orderData.paymentStatus,
          order.price,
        );
      } catch (error) {
        console.error('Email gönderimi sırasında hata:', error);
        // Continue with the update even if email fails
      }
    }

    // If order status is being updated, send email
    if (orderData.status && orderData.status !== order.status) {
      try {
        await this.emailService.sendOrderStatusEmail(
          order.customerEmail,
          order.id,
          order.pnrNo,
          orderData.status,
          order.serviceType,
        );
      } catch (error) {
        console.error('Email gönderimi sırasında hata:', error);
        // Continue with the update even if email fails
      }
    }

    await this.orderRepository.update(id, orderData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.delete(id);
  }

  async findByStatus(status: Order['status']): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { status },
      relations: ['bulkVehicles']
    });
  }

  async findByCustomerPhone(phone: string): Promise<Order[]> {
    return this.orderRepository.find({ 
      where: { customerPhone: phone },
      relations: ['bulkVehicles']
    });
  }
} 