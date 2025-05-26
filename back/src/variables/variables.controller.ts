import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, NotFoundException } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarSegment, CarStatus, YolYardim, TopluCekiciSehir } from './variables.entity';
import { CarStatusType } from './car-status-type';
import { Query } from '@nestjs/common';

@Controller('variables')
export class VariablesController {
  constructor(
    private readonly variablesService: VariablesService,
  ) {}

  // Car Segment Operations
  @Get('car-segments')
  async findAllCarSegments(@Query('type') type: CarStatusType) {
    return await this.variablesService.findAllCarSegments(type);
  }

  @Post('car-segments')
  @UseGuards(JwtAuthGuard)
  async createCarSegment(@Body() createDto: { name: string; price: number; type: CarStatusType }) {
    return await this.variablesService.createCarSegment(createDto.name, createDto.price, createDto.type);
  }

  @Patch('car-segments/:id')
  @UseGuards(JwtAuthGuard)
  async updateCarSegment(
    @Param('id') id: string,
    @Body() updateDto: { name: string; price: number }
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new Error(`Geçersiz segment ID: ${id}`);
    }
    return await this.variablesService.updateCarSegment(parsedId, updateDto.name, updateDto.price);
  }

  @Delete('car-segments/:id')
  @UseGuards(JwtAuthGuard)
  async removeCarSegment(@Param('id') id: string) {
    return await this.variablesService.deleteCarSegment(+id);
  }

  @Patch('car-segments/bulk/:type')
  @UseGuards(JwtAuthGuard)
  async updateCarSegments(
    @Param('type') type: CarStatusType,
    @Body() segments: { id: number; name: string; price: number }[]
  ): Promise<CarSegment[]> {
    try {
      if (!segments || !Array.isArray(segments)) {
        throw new Error('Geçersiz segment verisi');
      }

      const processedSegments = segments.map(segment => {
        const parsedId = parseInt(String(segment.id), 10);
        if (isNaN(parsedId)) {
          throw new Error(`Geçersiz segment ID: ${segment.id}`);
        }
        return {
          id: parsedId,
          name: String(segment.name),
          price: Number(segment.price)
        };
      });
      
      return await this.variablesService.updateCarSegments(type, processedSegments);
    } catch (error) {
      console.error('Controller - Segment güncelleme hatası:', error);
      throw error;
    }
  }

  // Car Status Operations
  @Get('car-statuses')
  async findAllCarStatuses(@Query('type') type: CarStatusType) {
    return await this.variablesService.findAllCarStatuses(type);
  }

  @Post('car-statuses')
  @UseGuards(JwtAuthGuard)
  async createCarStatus(
    @Body() createDto: { name: string; price: number; type: string }
  ) {
    return await this.variablesService.createCarStatus(
      createDto.name,
      createDto.price,
      createDto.type as any
    );
  }

  @Patch('car-statuses/:id')
  @UseGuards(JwtAuthGuard)
  async updateCarStatus(
    @Param('id') id: string,
    @Body() updateDto: { name: string; price: number; type: string }
  ) {
    return await this.variablesService.updateCarStatus(
      +id,
      updateDto.name,
      updateDto.price,
      updateDto.type as any
    );
  }

  @Delete('car-statuses/:id')
  @UseGuards(JwtAuthGuard)
  async removeCarStatus(@Param('id') id: string) {
    return await this.variablesService.deleteCarStatus(+id);
  }

  @Patch('car-statuses/bulk/:type')
  @UseGuards(JwtAuthGuard)
  async updateCarStatuses(
    @Param('type') type: CarStatusType,
    @Body() statuses: { id: number; name: string; price: number }[]
  ): Promise<CarStatus[]> {
    try {
      if (!statuses || !Array.isArray(statuses)) {
        throw new Error('Geçersiz status verisi');
      }

      const processedStatuses = statuses.map(status => {
        const parsedId = parseInt(String(status.id), 10);
        if (isNaN(parsedId)) {
          throw new Error(`Geçersiz status ID: ${status.id}`);
        }
        return {
          id: parsedId,
          name: String(status.name),
          price: Number(status.price)
        };
      });
      
      return await this.variablesService.updateCarStatuses(type, processedStatuses);
    } catch (error) {
      console.error('Controller - Status güncelleme hatası:', error);
      throw error;
    }
  }

  // YolYardim Operations
  @Get('yol-yardim')
  async getYolYardim() {
    return this.variablesService.findYolYardim();
  }

  @Post('yol-yardim')
  @UseGuards(JwtAuthGuard)
  async createYolYardim(
    @Body() createDto: {
      basePrice: number;
      baseLng: number;
      baseLat: number;
      basePricePerKm: number;
      nightPrice: number;
      baseAddress?: string;
    }
  ) {
    return await this.variablesService.createYolYardim(
      createDto.basePrice,
      createDto.baseLng,
      createDto.baseLat,
      createDto.basePricePerKm,
      createDto.nightPrice
    );
  }

  @Patch('yol-yardim')
  @UseGuards(JwtAuthGuard)
  async updateYolYardim(
    @Body() updateDto: {
      basePrice: number;
      baseLng: number;
      baseLat: number;
      basePricePerKm: number;
      nightPrice: number;
      baseAddress?: string;
    }
  ) {
    return await this.variablesService.updateYolYardim(
      updateDto.basePrice,
      updateDto.baseLng,
      updateDto.baseLat,
      updateDto.basePricePerKm,
      updateDto.nightPrice
    );
  }

  // OzelCekici Operations
  @Get('ozel-cekici')
  async getOzelCekici() {
    return await this.variablesService.findOzelCekici();
  }

  @Post('ozel-cekici')
  @UseGuards(JwtAuthGuard)
  async createOzelCekici(
    @Body() createDto: {
      nightPrice: number;
    }
  ) {
    return await this.variablesService.createOzelCekici(
      createDto.nightPrice  
    );
  }

  @Patch('ozel-cekici')
  @UseGuards(JwtAuthGuard)
  async updateOzelCekici(
    @Body() updateDto: {
      nightPrice: number;
    }
  ) {
    return await this.variablesService.updateOzelCekici(
      updateDto.nightPrice
    );
  }

  // OzelCekiciSehir Operations
  @Get('ozel-cekici/sehirler')
  async getAllOzelCekiciSehirler() {
    return await this.variablesService.findAllOzelCekiciSehirler();
  }

  @Get('ozel-cekici/sehirler/:sehirAdi')
  async getOzelCekiciSehirBySehirAdi(@Param('sehirAdi') sehirAdi: string) {
    return await this.variablesService.findOzelCekiciSehirBySehirAdi(sehirAdi);
  }

  @Post('ozel-cekici/sehirler')
  @UseGuards(JwtAuthGuard)
  async createOzelCekiciSehir(
    @Body() createDto: {
      sehirAdi: string;
      basePrice: number;
      basePricePerKm: number;
    }
  ) {
    return await this.variablesService.createOzelCekiciSehir(
      createDto.sehirAdi,
      createDto.basePrice,
      createDto.basePricePerKm
    );
  }

  @Patch('ozel-cekici/sehirler/:sehirAdi')
  @UseGuards(JwtAuthGuard)
  async updateOzelCekiciSehir(
    @Param('sehirAdi') sehirAdi: string,
    @Body() updateDto: {
      basePrice: number;
      basePricePerKm: number;
    }
  ) {
    return await this.variablesService.updateOzelCekiciSehir(
      sehirAdi,
      updateDto.basePrice,
      updateDto.basePricePerKm
    );
  }

  @Delete('ozel-cekici/sehirler/:sehirAdi')
  @UseGuards(JwtAuthGuard)
  async deleteOzelCekiciSehir(@Param('sehirAdi') sehirAdi: string) {
    return await this.variablesService.deleteOzelCekiciSehir(sehirAdi);
  }

  // TopluCekici Operations
  @Get('toplu-cekici/cities')
  async getTopluCekiciCities() {
    return this.variablesService.getTopluCekiciCities();
  }

  @Get('toplu-cekici/km-prices')
  async getTopluCekiciKmPrices() {
    return this.variablesService.getTopluCekiciKmPrices();
  }

  @Get('toplu-cekici/sehirler')
  async getAllTopluCekiciSehirler() {
    return await this.variablesService.findAllTopluCekiciSehirler();
  }

  @Get('toplu-cekici/all')
  async getTopluCekiciAll() {
    try {
      const [topluCekici, sehirler, kmFiyatlar] = await Promise.all([
        this.variablesService.findTopluCekici(),
        this.variablesService.findAllTopluCekiciSehirler(),
        this.variablesService.findAllTopluCekiciKmFiyatlar()
      ]);

      return {
        topluCekici,
        sehirler,
        kmFiyatlar
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        const newTopluCekici = await this.variablesService.createTopluCekici(2000);
        return {
          topluCekici: newTopluCekici,
          sehirler: [],
          kmFiyatlar: []
        };
      }
      throw error;
    }
  }

  @Get('toplu-cekici')
  async getTopluCekici() {
    try {
      return await this.variablesService.findTopluCekici();
    } catch (error) {
      if (error instanceof NotFoundException) {
        return await this.variablesService.createTopluCekici(2000);
      }
      throw error;
    }
  }

  @Patch('toplu-cekici')
  @UseGuards(JwtAuthGuard)
  async updateTopluCekici(@Body() updateDto: { basePrice: number }) {
    return await this.variablesService.updateTopluCekici(updateDto.basePrice);
  }

  @Get('toplu-cekici/sehirler/:sehirAdi')
  async getTopluCekiciSehirBySehirAdi(@Param('sehirAdi') sehirAdi: string) {
    return await this.variablesService.findTopluCekiciSehirBySehirAdi(sehirAdi);
  }

  @Post('toplu-cekici/sehirler')
  @UseGuards(JwtAuthGuard)
  async createTopluCekiciSehir(
    @Body() createDto: {
      sehirAdi: string;
      basePrice: number;
      basePricePerKm: number;
      otoparkLat?: number;
      otoparkLng?: number;
      otoparkAdres?: string;
    }
  ) {
    return await this.variablesService.createTopluCekiciSehir(
      createDto.sehirAdi,
      createDto.basePrice,
      createDto.basePricePerKm,
      createDto.otoparkLat,
      createDto.otoparkLng,
      createDto.otoparkAdres
    );
  }

  @Patch('toplu-cekici/sehirler/:sehirAdi')
  @UseGuards(JwtAuthGuard)
  async updateTopluCekiciSehir(
    @Param('sehirAdi') sehirAdi: string,
    @Body() updateDto: {
      basePrice: number;
      basePricePerKm: number;
      otoparkAdres: string;
      otoparkLat: number;
      otoparkLng: number;
    }
  ) {
    return await this.variablesService.updateTopluCekiciSehir(
      sehirAdi,
      updateDto.basePrice,
      updateDto.basePricePerKm,
      updateDto.otoparkAdres,
      updateDto.otoparkLat,
      updateDto.otoparkLng
    );
  }

  @Delete('toplu-cekici/sehirler/:sehirAdi')
  @UseGuards(JwtAuthGuard)
  async deleteTopluCekiciSehir(@Param('sehirAdi') sehirAdi: string) {
    return await this.variablesService.deleteTopluCekiciSehir(sehirAdi);
  }

  // TopluCekiciKmFiyat Operations
  @Get('toplu-cekici/km-fiyatlar')
  async getAllTopluCekiciKmFiyatlar() {
    return await this.variablesService.findAllTopluCekiciKmFiyatlar();
  }

  @Post('toplu-cekici/km-fiyatlar')
  @UseGuards(JwtAuthGuard)
  async createTopluCekiciKmFiyat(
    @Body() createDto: {
      minKm: number;
      maxKm: number;
      kmBasiUcret: number;
    }
  ) {
    return await this.variablesService.createTopluCekiciKmFiyat(
      createDto.minKm,
      createDto.maxKm,
      createDto.kmBasiUcret
    );
  }

  @Patch('toplu-cekici/km-fiyatlar/:id')
  @UseGuards(JwtAuthGuard)
  async updateTopluCekiciKmFiyat(
    @Param('id') id: string,
    @Body() updateDto: {
      minKm: number;
      maxKm: number;
      kmBasiUcret: number;
    }
  ) {
    return await this.variablesService.updateTopluCekiciKmFiyat(
      +id,
      updateDto.minKm,
      updateDto.maxKm,
      updateDto.kmBasiUcret
    );
  }

} 