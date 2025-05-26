import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { CarStatusType } from './car-status-type';

@Entity()
export class CarSegment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
    price: number;

    @Column({type: 'enum', enum: CarStatusType})
    type: CarStatusType;
}

@Entity()
export class CarStatus {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;

    @Column()
    price: number;

    @Column({type: 'enum', enum: CarStatusType})
    type: CarStatusType;
}

@Entity()
export class YolYardim {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    basePrice: number;

    @Column('decimal', { precision: 10, scale: 8 })
    baseLng: number;

    @Column('decimal', { precision: 10, scale: 8 })
    baseLat: number;

    @Column()
    basePricePerKm: number;

    @Column('decimal', { precision: 3, scale: 2, default: 0.0 })
    nightPrice: number;
}

@Entity()
export class OzelCekici {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 3, scale: 2, default: 0.0 })
    nightPrice: number;
}

@Entity()
export class OzelCekiciSehir {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sehirAdi: string;

    @Column('decimal', { precision: 10, scale: 2, default: 1000.0 })
    basePrice: number;

    @Column('decimal', { precision: 10, scale: 2, default: 15.0 })
    basePricePerKm: number;
}

@Entity()
export class TopluCekiciSehir {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sehirAdi: string;

    @Column('decimal', { precision: 10, scale: 2, default: 1000.0 })
    basePrice: number;

    @Column('decimal', { precision: 10, scale: 2, default: 15.0 })
    basePricePerKm: number;

    @Column('decimal', { precision: 10, scale: 2, default: 1000.0 })
    ozelCekiciBasePrice: number;

    @Column('decimal', { precision: 10, scale: 2, default: 15.0 })
    ozelCekiciBasePricePerKm: number;

    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    otoparkLat: number | null;

    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    otoparkLng: number | null;

    @Column({ nullable: true, type: 'text' })
    otoparkAdres: string | null;
}

@Entity()
export class TopluCekiciKmFiyat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    minKm: number;

    @Column()
    maxKm: number;

    @Column('decimal', { precision: 10, scale: 2 })
    kmBasiUcret: number;
}

@Entity()
export class TopluCekici {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    basePrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 