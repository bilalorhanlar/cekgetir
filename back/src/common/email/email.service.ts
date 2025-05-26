import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Increased timeout values
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      // TLS ayarları
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      this.logger.debug('Verifying SMTP connection...');
      await this.transporter.verify();
      this.logger.log('SMTP server is ready to take our messages');
    } catch (error) {
      this.logger.error('SMTP connection verification failed:', error);
      // If verification fails, try to reinitialize after a delay
      setTimeout(() => this.initializeTransporter(), 5000);
    }
  }

  private async sendWithRetry(mailOptions: nodemailer.SendMailOptions): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${this.maxRetries} to send email`);
        
        // E-posta başlıklarına özel alanlar ekle
        const enhancedMailOptions = {
          ...mailOptions,
          headers: {
            ...mailOptions.headers,
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'X-Mailer': 'Çekgetir Mail System',
            'List-Unsubscribe': `<mailto:${process.env.SMTP_FROM}?subject=unsubscribe>`,
            'Precedence': 'bulk',
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
          },
          // E-posta içeriğini optimize et
          text: mailOptions.text || this.convertHtmlToText(mailOptions.html as string),
          priority: 'high' as const,
        };

        const info = await this.transporter.sendMail(enhancedMailOptions);
        this.logger.log(`Email sent successfully on attempt ${attempt}`);
        return info;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          this.logger.debug(`Waiting ${this.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          
          // If it's a connection error, try to reinitialize the transporter
          if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            this.logger.debug('Connection error detected, reinitializing transporter...');
            this.initializeTransporter();
          }
        }
      }
    }
    
    throw lastError;
  }

  // HTML içeriğini düz metne çevir
  private convertHtmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
      .replace(/&nbsp;/g, ' ') // HTML boşlukları düzelt
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  async sendPaymentStatusEmail(
    to: string,
    orderId: string,
    pnrNo: string,
    status: 'ODEME_BEKLIYOR' | 'ODENDI' | 'IPTAL_EDILDI' | 'IADE_EDILDI',
    amount: number,
  ) {
    const statusText = {
      ODEME_BEKLIYOR: 'Ödeme Bekleniyor',
      ODENDI: 'Ödendi',
      IPTAL_EDILDI: 'İptal Edildi',
      IADE_EDILDI: 'İade Edildi',
    }[status];

    const subject = `Sipariş Ödeme Durumu Güncellendi - ${pnrNo}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Ödeme Durumu</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Sipariş Ödeme Durumu Güncellendi</h2>
          <p>Sayın Müşterimiz,</p>
          <p>${pnrNo} numaralı siparişinizin ödeme durumu güncellenmiştir.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
            <p style="margin: 10px 0;"><strong>Sipariş Numarası:</strong> ${pnrNo}</p>
            <p style="margin: 10px 0;"><strong>Yeni Durum:</strong> ${statusText}</p>
            <p style="margin: 10px 0;"><strong>Tutar:</strong> ${amount.toLocaleString('tr-TR')} TL</p>
          </div>
          <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 14px;">Saygılarımızla,<br>Çekgetir Ekibi</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Bu e-posta ${process.env.SMTP_FROM} adresinden gönderilmiştir.<br>
              E-posta almak istemiyorsanız <a href="mailto:${process.env.SMTP_FROM}?subject=unsubscribe" style="color: #666;">buraya tıklayın</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      this.logger.debug(`Attempting to send payment status email to ${to}`);
      const info = await this.sendWithRetry({
        from: `"Çekgetir" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
        replyTo: process.env.SMTP_REPLY_TO,
      });
      return info;
    } catch (error) {
      this.logger.error('Email gönderimi sırasında hata:', error);
      throw error;
    }
  }

  async sendOrderStatusEmail(
    to: string,
    orderId: string,
    pnrNo: string,
    status: 'ONAY_BEKLIYOR' | 'ONAYLANDI' | 'CEKICI_YONLENDIRILIYOR' | 'TRANSFER_SURECINDE' | 'TAMAMLANDI' | 'IPTAL_EDILDI',
    serviceType: string,
  ) {
    const statusText = {
      ONAY_BEKLIYOR: 'Onay Bekleniyor',
      ONAYLANDI: 'Onaylandı',
      CEKICI_YONLENDIRILIYOR: 'Çekici Yönlendiriliyor',
      TRANSFER_SURECINDE: 'Transfer Sürecinde',
      TAMAMLANDI: 'Tamamlandı',
      IPTAL_EDILDI: 'İptal Edildi',
    }[status];

    const serviceTypeText = {
      YOL_YARDIM: 'Yol Yardım',
      OZEL_CEKICI: 'Özel Çekici',
      TOPLU_CEKICI: 'Toplu Çekici',
    }[serviceType] || serviceType;

    const subject = `Sipariş Durumu Güncellendi - ${pnrNo}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sipariş Durumu</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Sipariş Durumu Güncellendi</h2>
          <p>Sayın Müşterimiz,</p>
          <p>${pnrNo} numaralı siparişinizin durumu güncellenmiştir.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
            <p style="margin: 10px 0;"><strong>Sipariş Numarası:</strong> ${pnrNo}</p>
            <p style="margin: 10px 0;"><strong>Hizmet Türü:</strong> ${serviceTypeText}</p>
            <p style="margin: 10px 0;"><strong>Yeni Durum:</strong> ${statusText}</p>
          </div>
          <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 14px;">Saygılarımızla,<br>Çekgetir Ekibi</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Bu e-posta ${process.env.SMTP_FROM} adresinden gönderilmiştir.<br>
              E-posta almak istemiyorsanız <a href="mailto:${process.env.SMTP_FROM}?subject=unsubscribe" style="color: #666;">buraya tıklayın</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      this.logger.debug(`Attempting to send order status email to ${to}`);
      const info = await this.sendWithRetry({
        from: `"Çekgetir" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
        replyTo: process.env.SMTP_REPLY_TO,
      });
      return info;
    } catch (error) {
      this.logger.error('Email gönderimi sırasında hata:', error);
      throw error;
    }
  }
} 