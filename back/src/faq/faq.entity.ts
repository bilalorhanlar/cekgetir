import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column('text')
  answer: string;

  @Column({ default: true })
  isActive: boolean;

} 