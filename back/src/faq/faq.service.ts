import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: Partial<Faq>): Promise<Faq> {
    const faq = this.faqRepository.create(createFaqDto);
    return await this.faqRepository.save(faq);
  }

  async findAll(): Promise<Faq[]> {
    return await this.faqRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: number): Promise<Faq | null> {
    return await this.faqRepository.findOne({ where: { id } });
  }

  async update(id: number, updateFaqDto: Partial<Faq>): Promise<Faq | null> {
    await this.faqRepository.update(id, updateFaqDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.faqRepository.update(id, { isActive: false });
  }
} 