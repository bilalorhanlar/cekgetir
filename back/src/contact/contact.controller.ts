import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: Partial<Contact>) {
    return await this.contactService.create(createContactDto);
  }

  @Get()
  async findAll() {
    return await this.contactService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contactService.findOne(+id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.contactService.markAsRead(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.contactService.remove(+id);
  }
} 