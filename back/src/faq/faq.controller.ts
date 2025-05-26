import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { Faq } from './faq.entity';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() createFaqDto: Partial<Faq>) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFaqDto: Partial<Faq>) {
    return this.faqService.update(+id, updateFaqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(+id);
  }
} 