import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('bulk_vehicles')
export class BulkVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tip: string;

  @Column()
  marka: string;

  @Column()
  model: string;

  @Column()
  yil: string;

  @Column()
  plaka: string;

  @Column()
  condition: string;

  @ManyToOne(() => Order, order => order.bulkVehicles)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;
} 