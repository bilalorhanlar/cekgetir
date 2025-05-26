import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import { Order } from '../../../order/order.entity';

@Injectable()
export class SmsService {
    private readonly apiId: string;
    private readonly apiKey: string;
    private readonly sender: string;
    private readonly logger = new Logger(SmsService.name);

    constructor() {
        const apiId = process.env.VATAN_SMS_API_ID;
        const apiKey = process.env.VATAN_SMS_API_KEY;
        const sender = process.env.VATAN_SMS_SENDER;

        if (!apiId || !apiKey || !sender) {
            this.logger.error('Vatan SMS API bilgileri eksik');
            throw new Error('Vatan SMS API bilgileri eksik');
        }

        this.apiId = apiId;
        this.apiKey = apiKey;
        this.sender = sender;
        this.logger.log('SMS Service initialized successfully');
    }

    async sendSms(phone: string, message: string) {
        try {
            this.logger.debug(`Sending SMS to ${phone} with message: ${message}`);

            // Telefon numarası kontrolü
            if (!phone || phone.length < 10) {
                throw new Error('Geçersiz telefon numarası');
            }

            // Telefon numarasını formatla (başında 0 varsa kaldır)
            const formattedPhone = phone.startsWith('0') ? phone.substring(1) : phone;

            const params = {
                api_id: this.apiId,
                api_key: this.apiKey,
                sender: this.sender,
                message_type: "normal",
                message: message,
                phones: [formattedPhone]
            };

            this.logger.debug('SMS request params:', JSON.stringify(params, null, 2));

            const response = await fetch('https://api.vatansms.net/api/v1/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();
            this.logger.debug('SMS API response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(`SMS API error: ${data.message || 'Unknown error'}`);
            }

            return data;
        } catch (error) {
            this.logger.error('SMS gönderme hatası:', error);
            throw error;
        }
    }

    async sendOrderConfirmationSms(order: Order) {
        try {
            if (!order.customerPhone) {
                throw new Error('Müşteri telefon numarası bulunamadı');
            }

            if (!order.pnrNo) {
                throw new Error('Talep numarası bulunamadı');
            }

            this.logger.log(`Sending order confirmation SMS for order ${order.pnrNo} to ${order.customerPhone}`);
            
            const message = `Siparişiniz başarıyla oluşturuldu. Sipariş numaranız: ${order.pnrNo}`;
            const result = await this.sendSms(order.customerPhone, message);
            
            this.logger.log(`Order confirmation SMS sent successfully for order ${order.pnrNo}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to send order confirmation SMS for order ${order.pnrNo}:`, error);
            throw error;
        }
    }
} 