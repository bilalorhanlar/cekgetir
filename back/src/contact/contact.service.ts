import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: Partial<Contact>): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: number): Promise<Contact | null> {
    return await this.contactRepository.findOne({ where: { id } });
  }

  async markAsRead(id: number): Promise<Contact | null> {
    await this.contactRepository.update(id, { isRead: true });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
} 