import { Injectable, NotFoundException } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { CarStatusType } from './car-status-type';

@Injectable()
export class VariablesSeedService {
    constructor(private readonly variablesService: VariablesService) {}

    private async seedCarSegments() {
        const defaultSegments = [
            { name: 'Sedan', price: 1.0 },
            { name: 'SUV', price: 1.2 },
            { name: 'Hatchback', price: 1.0 },
            { name: 'Station Wagon', price: 1.1 },
            { name: 'Coupe', price: 1.1 },
            { name: 'Cabrio', price: 1.2 },
            { name: 'Panelvan', price: 1.3 },
            { name: 'Pickup', price: 1.4 },
            { name: 'Motorsiklet', price: 1.0 },
            { name: 'Limuzin', price: 1.5 },
            { name: 'Minivan', price: 1.3 },
            { name: 'Other', price: 1.0 },
        ];

        const carStatusTypes = Object.values(CarStatusType);
        
        for (const type of carStatusTypes) {
            console.log(`Seeding car segments for ${type}...`);
            const existingSegments = await this.variablesService.findAllCarSegments(type);
            
            // Eğer bu tip için hiç segment yoksa ekle
            if (existingSegments.length === 0) {
                for (const segment of defaultSegments) {
                    await this.variablesService.createCarSegment(segment.name, segment.price, type);
                }
                console.log(`Car segments seeded successfully for ${type}`);
            } else {
                console.log(`Car segments already exist for ${type}, skipping...`);
            }
        }
    }

    private async seedCarStatuses() {
        const defaultStatuses = {
            'yol-yardim': [
                { name: 'Yakıt', price: 250 },
                { name: 'Akü', price: 250 },
                { name: 'Lastik', price: 500 },
                { name: 'Motor Arızası', price: 1000 },
                { name: 'Diğer', price: 100 }
            ],
            'ozel-cekici': [
                { name: 'Vites P Konumunda', price: 500 },
                { name: 'Kazalı', price: 500 },
                { name: 'Çalışıyor', price: 0 },
                { name: 'Motor Arızası', price: 200 },
                { name: 'Diğer', price: 300 }
            ],
            'toplu-cekici': [
                { name: 'Vites P Konumunda', price: 500 },
                { name: 'Kazalı', price: 500 },
                { name: 'Çalışıyor', price: 0 },
                { name: 'Motor Arızası', price: 200 },
                { name: 'Sıfır', price: 0 },
                { name: 'Diğer', price: 300 }
            ]
        };

        for (const [type, statuses] of Object.entries(defaultStatuses)) {
            console.log(`Seeding car statuses for ${type}...`);
            const existingStatuses = await this.variablesService.findAllCarStatuses(type as CarStatusType);
            
            // Eğer bu tip için hiç status yoksa ekle
            if (existingStatuses.length === 0) {
                for (const status of statuses) {
                    await this.variablesService.createCarStatus(status.name, status.price, type as CarStatusType);
                }
                console.log(`Car statuses seeded successfully for ${type}`);
            } else {
                console.log(`Car statuses already exist for ${type}, skipping...`);
            }
        }
    }

    private async seedYolYardim() {
        try {
            await this.variablesService.findYolYardim();
            console.log('YolYardim configuration already exists, skipping...');
        } catch (error) {
            console.log('Seeding YolYardim configuration...');
            // Default values for Istanbul coordinates
            await this.variablesService.createYolYardim(
                100, // basePrice
                28.9784, // baseLng (Istanbul)
                41.0082, // baseLat (Istanbul)
                2, // basePricePerKm
                1.5  // nightPrice
            );
            console.log('YolYardim configuration seeded successfully');
        }
    }

    private async seedOzelCekici() {
        try {
            await this.variablesService.findOzelCekici();
            console.log('OzelCekici configuration already exists, skipping...');
        } catch (error) {
            console.log('Seeding OzelCekici configuration...');
            await this.variablesService.createOzelCekici(
                1.5  // nightPrice
            );
            console.log('OzelCekici configuration seeded successfully');
        }
    }

    private async seedOzelCekiciSehirler() {
        const sehirler = [
            'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
            'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
            'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
            'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
            'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
            'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
            'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
            'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
        ];

        for (const sehir of sehirler) {
            try {
                await this.variablesService.findOzelCekiciSehirBySehirAdi(sehir);
            } catch (error) {
                await this.variablesService.createOzelCekiciSehir(
                    sehir, 
                    1000, // basePrice
                    15    // basePricePerKm
                );
            }
        }
    }

    private async seedTopluCekiciSehirler() {
        const sehirler = [
            'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
            'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
            'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
            'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
            'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
            'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
            'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
            'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
        ];

        for (const sehir of sehirler) {
            try {
                await this.variablesService.findTopluCekiciSehirBySehirAdi(sehir);

            } catch (error) {
                await this.variablesService.createTopluCekiciSehir(
                    sehir, 
                    1000, // basePrice
                    15,   // basePricePerKm
                    undefined, // otoparkLat
                    undefined, // otoparkLng
                    undefined  // otoparkAdres
                );
            }
        }
    }

    private async seedTopluCekiciKmFiyatlar() {
        const defaultKmFiyatlar = [
            { minKm: 0, maxKm: 100, kmBasiUcret: 25 },
            { minKm: 100, maxKm: 200, kmBasiUcret: 20 },
            { minKm: 200, maxKm: 300, kmBasiUcret: 18 },
            { minKm: 300, maxKm: 400, kmBasiUcret: 16 },
            { minKm: 400, maxKm: 500, kmBasiUcret: 14 },
            { minKm: 500, maxKm: 600, kmBasiUcret: 13 },
            { minKm: 600, maxKm: 700, kmBasiUcret: 12 },
            { minKm: 700, maxKm: 800, kmBasiUcret: 11 },
            { minKm: 800, maxKm: 900, kmBasiUcret: 11 },
            { minKm: 900, maxKm: 1000, kmBasiUcret: 10 },
            { minKm: 1000, maxKm: 999999, kmBasiUcret: 9 }
        ];

        try {
            const existingFiyatlar = await this.variablesService.findAllTopluCekiciKmFiyatlar();
            if (existingFiyatlar.length === 0) {
                for (const fiyat of defaultKmFiyatlar) {
                    await this.variablesService.createTopluCekiciKmFiyat(
                        fiyat.minKm,
                        fiyat.maxKm,
                        fiyat.kmBasiUcret
                    );
                }
                console.log('Toplu çekici KM fiyatları başarıyla oluşturuldu');
            } else {
                console.log('Toplu çekici KM fiyatları zaten mevcut, atlanıyor...');
            }
        } catch (error) {
            console.error('Toplu çekici KM fiyatları oluşturulurken hata:', error);
        }
    }

    async seedTopluCekici() {
        try {
            const existingTopluCekici = await this.variablesService.findTopluCekici();
            console.log('Toplu çekici ayarları zaten mevcut');
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log('Toplu çekici ayarları oluşturuluyor...');
                await this.variablesService.createTopluCekici(2000);
                console.log('Toplu çekici ayarları oluşturuldu');
            } else {
                throw error;
            }
        }
    }

    async seed() {
        try {
            await this.seedYolYardim();
            await this.seedOzelCekici();
            await this.seedTopluCekici();
            await this.seedCarSegments();
            await this.seedCarStatuses();
            await this.seedOzelCekiciSehirler();
            await this.seedTopluCekiciSehirler();
            await this.seedTopluCekiciKmFiyatlar();
            console.log('Tüm seed işlemleri tamamlandı');
        } catch (error) {
            console.error('Seed işlemi sırasında hata:', error);
            throw error;
        }
    }
} 