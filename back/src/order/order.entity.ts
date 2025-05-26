import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BulkVehicle } from './bulk-vehicle.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Müşteri Bilgileri
  @Column()
  customerName: string;

  @Column()
  customerSurname: string;

  @Column({ nullable: true, default: '11111111' })
  customerTc: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerEmail: string;

  // Kurum Bilgileri
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  taxNumber: string;

  @Column({ nullable: true })
  taxOffice: string;

  @Column({ nullable: true })
  companyPhone: string;

  @Column({ nullable: true })
  companyEmail: string;

  // Sipariş Bilgileri
  @Column()
  pnrNo: string;

  @Column({ type: 'enum', enum: ['YOL_YARDIM', 'OZEL_CEKICI', 'TOPLU_CEKICI'], default: 'YOL_YARDIM' })
  serviceType: 'YOL_YARDIM' | 'OZEL_CEKICI' | 'TOPLU_CEKICI';

  // Yol Yardım için konum bilgileri
  @Column({ nullable: true })
  breakdownLocation: string;

  @Column({ nullable: true })
  breakdownDescription: string;

  @Column({ nullable: true })
  destinationLocation: string;

  // Özel ve Toplu Çekici için konum bilgileri
  @Column({ nullable: true })
  pickupLocation: string;

  @Column({ nullable: true })
  dropoffLocation: string;

  @Column({ type: 'boolean', default: false })
  isPickupFromParking: boolean;

  @Column({ type: 'boolean', default: false })
  isDeliveryToParking: boolean;

  // Araç Bilgileri
  @Column({ nullable: true })
  vehicleSegment: string;

  @Column({ nullable: true })
  vehicleBrand: string;

  @Column({ nullable: true })
  vehicleModel: string;

  @Column({ nullable: true })
  vehicleYear: string;

  @Column({ nullable: true })
  vehiclePlate: string;

  @Column({ nullable: true })
  vehicleCondition: string;

  @OneToMany(() => BulkVehicle, bulkVehicle => bulkVehicle.order)
  bulkVehicles: BulkVehicle[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ['ONAY_BEKLIYOR', 'ONAYLANDI', 'CEKICI_YONLENDIRILIYOR', 'TRANSFER_SURECINDE', 'TAMAMLANDI', 'IPTAL_EDILDI'], default: 'ONAY_BEKLIYOR' })
  status: 'ONAY_BEKLIYOR' | 'ONAYLANDI' | 'CEKICI_YONLENDIRILIYOR' | 'TRANSFER_SURECINDE' | 'TAMAMLANDI' | 'IPTAL_EDILDI';

  @Column({ type: 'enum', enum: ['ODEME_BEKLIYOR', 'ODENDI', 'IPTAL_EDILDI', 'IADE_EDILDI'], default: 'ODEME_BEKLIYOR' })
  paymentStatus: 'ODEME_BEKLIYOR' | 'ODENDI' | 'IPTAL_EDILDI' | 'IADE_EDILDI';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 