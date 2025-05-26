import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarSegment, CarStatus, YolYardim, OzelCekici, OzelCekiciSehir, TopluCekiciSehir, TopluCekiciKmFiyat, TopluCekici } from './variables.entity';
import { CarStatusType } from './car-status-type';

// Şehir adını normalize eden fonksiyon
function normalizeSehirAdi(sehir: string): string {
    return sehir
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/İ/g, 'i');
}

@Injectable()
export class VariablesService {
    constructor(
        @InjectRepository(CarSegment)
        private carSegmentRepository: Repository<CarSegment>,
        @InjectRepository(CarStatus)
        private carStatusRepository: Repository<CarStatus>,
        @InjectRepository(YolYardim)
        private yolYardimRepository: Repository<YolYardim>,
        @InjectRepository(OzelCekici)
        private ozelCekiciRepository: Repository<OzelCekici>,
        @InjectRepository(OzelCekiciSehir)
        private ozelCekiciSehirRepository: Repository<OzelCekiciSehir>,
        @InjectRepository(TopluCekiciSehir)
        private topluCekiciSehirRepository: Repository<TopluCekiciSehir>,
        @InjectRepository(TopluCekiciKmFiyat)
        private topluCekiciKmFiyatRepository: Repository<TopluCekiciKmFiyat>,
        @InjectRepository(TopluCekici)
        private topluCekiciRepository: Repository<TopluCekici>
    ) {}

    // CarSegment Operations
    async createCarSegment(name: string, price: number, type: CarStatusType): Promise<CarSegment> {
        const carSegment = this.carSegmentRepository.create({ name, price, type });
        return await this.carSegmentRepository.save(carSegment);
    }

    async findAllCarSegments(type: CarStatusType): Promise<CarSegment[]> {
        return await this.carSegmentRepository.find({ 
            where: { type: type },
            order: { id: 'ASC' }
        });
    }

    async findCarSegmentById(id: number): Promise<CarSegment> {
        if (!id || isNaN(Number(id))) {
            throw new Error(`Geçersiz segment ID: ${id}`);
        }
        const carSegment = await this.carSegmentRepository.findOne({ where: { id: Number(id) } });
        if (!carSegment) {
            throw new NotFoundException(`CarSegment with ID ${id} not found`);
        }
        return carSegment;
    }

    async updateCarSegment(id: number, name: string, price: number): Promise<CarSegment> {
        if (!id || isNaN(Number(id))) {
            throw new Error(`Geçersiz segment ID: ${id}`);
        }
        const segment = await this.findCarSegmentById(Number(id));
        segment.name = name;
        segment.price = Number(price);
        return await this.carSegmentRepository.save(segment);
    }

    async updateCarSegments(type: CarStatusType, segments: { id: number; name: string; price: number }[]): Promise<CarSegment[]> {
        try {
            if (!segments || !Array.isArray(segments) || segments.length === 0) {
                throw new Error('Geçerli segment verisi bulunamadı');
            }

            const updatedSegments: CarSegment[] = [];
            
            for (const segment of segments) {
                try {
                    // ID kontrolü
                    const segmentId = Number(segment.id);
                    if (isNaN(segmentId)) {
                        console.error('Service - Geçersiz segment ID:', segment.id);
                        continue;
                    }

                    // Önce segmenti bul
                    const existingSegment = await this.carSegmentRepository.findOne({
                        where: { id: segmentId }
                    });

                    if (!existingSegment) {
                        console.error('Service - Segment bulunamadı:', segmentId);
                        continue;
                    }

                    // Değerleri güncelle
                    existingSegment.name = String(segment.name);
                    existingSegment.price = Number(segment.price);
                    existingSegment.type = type;

                    // Kaydet
                    const savedSegment = await this.carSegmentRepository.save(existingSegment);
                    updatedSegments.push(savedSegment);
                } catch (segmentError) {
                    console.error('Service - Segment güncelleme hatası:', segmentError);
                    continue;
                }
            }
            
            if (updatedSegments.length === 0) {
                throw new Error('Hiçbir segment güncellenemedi');
            }
            
            return updatedSegments;
        } catch (error) {
            console.error('Service - Segment güncelleme hatası:', error);
            throw error;
        }
    }

    async deleteCarSegment(id: number): Promise<void> {
        await this.carSegmentRepository.delete(id);
    }

    // CarStatus Operations
    async createCarStatus(name: string, price: number, type: CarStatusType): Promise<CarStatus> {
        const carStatus = this.carStatusRepository.create({ name, price, type });
        return await this.carStatusRepository.save(carStatus);
    }

    async findAllCarStatuses(type: CarStatusType): Promise<CarStatus[]> {
        return await this.carStatusRepository.find({ where: { type: type } });
    }

    async findCarStatusById(id: number): Promise<CarStatus> {
        const carStatus = await this.carStatusRepository.findOne({ where: { id } });
        if (!carStatus) {
            throw new NotFoundException(`CarStatus with ID ${id} not found`);
        }
        return carStatus;
    }

    async updateCarStatus(id: number, name: string, price: number, type: CarStatusType): Promise<CarStatus> {
        await this.carStatusRepository.update(id, { name, price, type });
        return await this.findCarStatusById(id);
    }

    async updateCarStatuses(type: CarStatusType, statuses: { id: number; name: string; price: number }[]): Promise<CarStatus[]> {
        try {
            if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
                throw new Error('Geçerli status verisi bulunamadı');
            }

            const updatedStatuses: CarStatus[] = [];
            
            for (const status of statuses) {
                try {
                    // ID kontrolü
                    const statusId = Number(status.id);
                    if (isNaN(statusId)) {
                        console.error('Service - Geçersiz status ID:', status.id);
                        continue;
                    }

                    // Önce statusu bul
                    const existingStatus = await this.carStatusRepository.findOne({
                        where: { id: statusId }
                    });

                    if (!existingStatus) {
                        console.error('Service - Status bulunamadı:', statusId);
                        continue;
                    }

                    // Değerleri güncelle
                    existingStatus.name = String(status.name);
                    existingStatus.price = Number(status.price);
                    existingStatus.type = type;

                    // Kaydet
                    const savedStatus = await this.carStatusRepository.save(existingStatus);
                    updatedStatuses.push(savedStatus);
                } catch (statusError) {
                    console.error('Service - Status güncelleme hatası:', statusError);
                    continue;
                }
            }
            
            if (updatedStatuses.length === 0) {
                throw new Error('Hiçbir status güncellenemedi');
            }
            
            return updatedStatuses;
        } catch (error) {
            console.error('Service - Status güncelleme hatası:', error);
            throw error;
        }
    }

    async deleteCarStatus(id: number): Promise<void> {
        await this.carStatusRepository.delete(id);
    }

    // YolYardim Operations
    async createYolYardim(
        basePrice: number,
        baseLng: number,
        baseLat: number,
        basePricePerKm: number,
        nightPrice: number
    ): Promise<YolYardim> {
        const yolYardim = this.yolYardimRepository.create({
            basePrice,
            baseLng,
            baseLat,
            basePricePerKm,
            nightPrice
        });
        return await this.yolYardimRepository.save(yolYardim);
    }

    async findYolYardim(): Promise<YolYardim> {
        const yolYardim = await this.yolYardimRepository.findOne({ where: { id: 1 } });
        if (!yolYardim) {
            throw new NotFoundException('YolYardim configuration not found');
        }
        return yolYardim;
    }

    async updateYolYardim(
        basePrice: number,
        baseLng: number,
        baseLat: number,
        basePricePerKm: number,
        nightPrice: number
    ): Promise<YolYardim> {
        const yolYardim = await this.yolYardimRepository.findOne({ where: { id: 1 } });
        if (!yolYardim) {
            throw new NotFoundException('YolYardim configuration not found');
        }

        yolYardim.basePrice = basePrice;
        yolYardim.baseLng = baseLng;
        yolYardim.baseLat = baseLat;
        yolYardim.basePricePerKm = basePricePerKm;
        yolYardim.nightPrice = nightPrice;

        return await this.yolYardimRepository.save(yolYardim);
    }

    // OzelCekici Operations
    async createOzelCekici(
        nightPrice: number
    ): Promise<OzelCekici> {
        const ozelCekici = this.ozelCekiciRepository.create({
            nightPrice
        });
        return await this.ozelCekiciRepository.save(ozelCekici);
    }

    async findOzelCekici(): Promise<OzelCekici> {
        const ozelCekici = await this.ozelCekiciRepository.findOne({ where: { id: 1 } });
        if (!ozelCekici) {
            throw new NotFoundException('OzelCekici configuration not found');
        }
        return ozelCekici;
    }

    async updateOzelCekici(
        nightPrice: number
    ): Promise<OzelCekici> {
        const ozelCekici = await this.ozelCekiciRepository.findOne({ where: { id: 1 } });
        if (!ozelCekici) {
            throw new NotFoundException('OzelCekici configuration not found');
        }

        ozelCekici.nightPrice = nightPrice;

        return await this.ozelCekiciRepository.save(ozelCekici);
    }

    // OzelCekiciSehir Operations
    async createOzelCekiciSehir(
        sehirAdi: string,
        basePrice: number,
        basePricePerKm: number
    ): Promise<OzelCekiciSehir> {
        const ozelCekiciSehir = this.ozelCekiciSehirRepository.create({
            sehirAdi,
            basePrice,
            basePricePerKm
        });
        return await this.ozelCekiciSehirRepository.save(ozelCekiciSehir);
    }

    async findOzelCekiciSehirBySehirAdi(sehirAdi: string): Promise<OzelCekiciSehir> {
        const normalizedSehirAdi = normalizeSehirAdi(sehirAdi);
        const allSehirler = await this.ozelCekiciSehirRepository.find();
        const ozelCekiciSehir = allSehirler.find(
            s => normalizeSehirAdi(s.sehirAdi) === normalizedSehirAdi
        );
        if (!ozelCekiciSehir) {
            throw new NotFoundException(`${sehirAdi} için özel çekici fiyatlandırması bulunamadı`);
        }
        return ozelCekiciSehir;
    }

    async findAllOzelCekiciSehirler(): Promise<OzelCekiciSehir[]> {
        return await this.ozelCekiciSehirRepository.find({
            order: { sehirAdi: 'ASC' }
        });
    }

    async updateOzelCekiciSehir(
        sehirAdi: string,
        basePrice: number,
        basePricePerKm: number
    ): Promise<OzelCekiciSehir> {
        const ozelCekiciSehir = await this.findOzelCekiciSehirBySehirAdi(sehirAdi);
        
        ozelCekiciSehir.basePrice = basePrice;
        ozelCekiciSehir.basePricePerKm = basePricePerKm;

        return await this.ozelCekiciSehirRepository.save(ozelCekiciSehir);
    }

    async deleteOzelCekiciSehir(sehirAdi: string): Promise<void> {
        const ozelCekiciSehir = await this.findOzelCekiciSehirBySehirAdi(sehirAdi);
        await this.ozelCekiciSehirRepository.remove(ozelCekiciSehir);
    }

    // TopluCekiciSehir Operations
    async createTopluCekiciSehir(
        sehirAdi: string,
        basePrice: number,
        basePricePerKm: number,
        otoparkLat?: number,
        otoparkLng?: number,
        otoparkAdres?: string
    ): Promise<TopluCekiciSehir> {
        const topluCekiciSehir = this.topluCekiciSehirRepository.create({
            sehirAdi,
            basePrice,
            basePricePerKm,
            otoparkLat: otoparkLat || null,
            otoparkLng: otoparkLng || null,
            otoparkAdres: otoparkAdres || null
        });
        return await this.topluCekiciSehirRepository.save(topluCekiciSehir);
    }

    async findTopluCekiciSehirBySehirAdi(sehirAdi: string): Promise<TopluCekiciSehir> {
        const normalizedSehirAdi = normalizeSehirAdi(sehirAdi);
        const allSehirler = await this.topluCekiciSehirRepository.find();
        const topluCekiciSehir = allSehirler.find(
            s => normalizeSehirAdi(s.sehirAdi) === normalizedSehirAdi
        );
        if (!topluCekiciSehir) {
            throw new NotFoundException(`${sehirAdi} için toplu çekici fiyatlandırması bulunamadı`);
        }
        return topluCekiciSehir;
    }

    async findAllTopluCekiciSehirler(): Promise<TopluCekiciSehir[]> {
        return await this.topluCekiciSehirRepository.find();
    }

    async updateTopluCekiciSehir(
        sehirAdi: string,
        basePrice: number,
        basePricePerKm: number,
        otoparkAdres: string,
        otoparkLat: number,
        otoparkLng: number
    ): Promise<TopluCekiciSehir> {
        const topluCekiciSehir = await this.findTopluCekiciSehirBySehirAdi(sehirAdi);
        topluCekiciSehir.basePrice = basePrice;
        topluCekiciSehir.basePricePerKm = basePricePerKm;
        topluCekiciSehir.otoparkLat = otoparkLat !== undefined ? otoparkLat : null;
        topluCekiciSehir.otoparkLng = otoparkLng !== undefined ? otoparkLng : null;
        topluCekiciSehir.otoparkAdres = otoparkAdres !== undefined ? otoparkAdres : null;
        return await this.topluCekiciSehirRepository.save(topluCekiciSehir);
    }

    async deleteTopluCekiciSehir(sehirAdi: string): Promise<void> {
        const topluCekiciSehir = await this.findTopluCekiciSehirBySehirAdi(sehirAdi);
        await this.topluCekiciSehirRepository.remove(topluCekiciSehir);
    }

    // TopluCekiciKmFiyat Operations
    async createTopluCekiciKmFiyat(minKm: number, maxKm: number, kmBasiUcret: number): Promise<TopluCekiciKmFiyat> {
        const kmFiyat = this.topluCekiciKmFiyatRepository.create({
            minKm,
            maxKm,
            kmBasiUcret
        });
        return await this.topluCekiciKmFiyatRepository.save(kmFiyat);
    }

    async findAllTopluCekiciKmFiyatlar(): Promise<TopluCekiciKmFiyat[]> {
        return await this.topluCekiciKmFiyatRepository.find();
    }

    async updateTopluCekiciKmFiyat(id: number, minKm: number, maxKm: number, kmBasiUcret: number): Promise<TopluCekiciKmFiyat> {
        const kmFiyat = await this.topluCekiciKmFiyatRepository.findOne({ where: { id } });
        if (!kmFiyat) {
            throw new NotFoundException(`KM fiyat aralığı bulunamadı`);
        }

        kmFiyat.minKm = minKm;
        kmFiyat.maxKm = maxKm;
        kmFiyat.kmBasiUcret = kmBasiUcret;

        return await this.topluCekiciKmFiyatRepository.save(kmFiyat);
    }

    async deleteTopluCekiciKmFiyat(id: number): Promise<void> {
        await this.topluCekiciKmFiyatRepository.delete(id);
    }

    async updateTopluCekiciKmFiyatlar(kmFiyatlar: { id: number; minKm: number; maxKm: number; kmBasiUcret: number }[]): Promise<TopluCekiciKmFiyat[]> {
        const updatedFiyatlar: TopluCekiciKmFiyat[] = [];
        
        for (const fiyat of kmFiyatlar) {
            const existingFiyat = await this.topluCekiciKmFiyatRepository.findOne({ where: { id: fiyat.id } });
            if (existingFiyat) {
                existingFiyat.minKm = fiyat.minKm;
                existingFiyat.maxKm = fiyat.maxKm;
                existingFiyat.kmBasiUcret = fiyat.kmBasiUcret;
                const savedFiyat = await this.topluCekiciKmFiyatRepository.save(existingFiyat);
                updatedFiyatlar.push(savedFiyat);
            }
        }
        
        return updatedFiyatlar;
    }

    // TopluCekici Operations
    async findTopluCekici(): Promise<TopluCekici> {
        const topluCekici = await this.topluCekiciRepository.findOne({ where: { id: 1 } });
        if (!topluCekici) {
            throw new NotFoundException('Toplu çekici ayarları bulunamadı');
        }
        return topluCekici;
    }

    async updateTopluCekici(basePrice: number): Promise<TopluCekici> {
        const topluCekici = await this.topluCekiciRepository.findOne({ where: { id: 1 } });
        if (!topluCekici) {
            throw new NotFoundException('Toplu çekici ayarları bulunamadı');
        }
        topluCekici.basePrice = basePrice;
        return await this.topluCekiciRepository.save(topluCekici);
    }

    async createTopluCekici(basePrice: number): Promise<TopluCekici> {
        const topluCekici = this.topluCekiciRepository.create({
            basePrice
        });
        return this.topluCekiciRepository.save(topluCekici);
    }

    async getYolYardim() {
        return this.yolYardimRepository.findOne({ where: { id: 1 } });
    }

    async getCarSegments(type: string) {
        return this.carSegmentRepository.find({
            where: { type: type as CarStatusType }
        });
    }

    async getCarStatuses(type: string) {
        return this.carStatusRepository.find({
            where: { type: type as CarStatusType }
        });
    }

    async getTopluCekiciAll() {
        return this.topluCekiciRepository.find();
    }

    async getTopluCekiciCities() {
        return this.topluCekiciSehirRepository.find();
    }

    async getTopluCekiciKmPrices() {
        return this.topluCekiciKmFiyatRepository.find();
    }
}
