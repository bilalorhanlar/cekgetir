'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer, Polyline } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

const libraries = ['places']

const mapStyles = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
  border: '1px solid rgba(64, 64, 64, 0.4)'
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false
}

const normalizeSehirAdi = (sehir) => {
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

const sehirTespiti = async (location) => {
  if (!window.google) return null;
  const geocoder = new window.google.maps.Geocoder();
  
  try {
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0]);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });

    // Türkiye'deki şehirleri kontrol et
    const addressComponents = response.address_components;
    const cityComponent = addressComponents.find(component => 
      component.types.includes('administrative_area_level_1')
    );

    if (cityComponent) {
      return cityComponent.long_name;
    }

    return null;
  } catch (error) {
    console.error('Şehir tespiti hatası:', error);
    return null;
  }
};

const isValidCoordinate = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// Yardımcı fonksiyon: konum objesini normalize et
const normalizeLocation = (loc) => {
  if (!loc) return null;
  return {
    lat: Number(loc.lat),
    lng: Number(loc.lng),
    address: loc.address || ''
  };
};

// Debounce fonksiyonu ekle
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Koordinatları düzgün parse eden yardımcı fonksiyon
const parseCoordinate = (val) => {
  if (typeof val === 'string') {
    return Number(val.replace(',', '.'));
  }
  return Number(val);
};

// Lat/Lng geçerliliğini kontrol eden yardımcı fonksiyon
const isValidLatLng = (lat, lng) => {
  const latNum = parseCoordinate(lat);
  const lngNum = parseCoordinate(lng);
  return !isNaN(latNum) && !isNaN(lngNum);
};

// Fallback: delivery otopark koordinatı yoksa pickup otopark koordinatını kullan
const getDeliveryOtoparkLat = (sehirFiyatlandirma) =>
  sehirFiyatlandirma.deliveryOtoparkLat ?? sehirFiyatlandirma.otoparkLat;
const getDeliveryOtoparkLng = (sehirFiyatlandirma) =>
  sehirFiyatlandirma.deliveryOtoparkLng ?? sehirFiyatlandirma.otoparkLng;

export default function TopluCekiciModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  const [fiyatlandirma, setFiyatlandirma] = useState({
    basePrice: 0,
    kmBasiUcret: 0,
    segmentler: {},
    durumlar: {},
    sehirler: []
  })
  const [toplamFiyat, setToplamFiyat] = useState(0)
  const [pnrNumber, setPnrNumber] = useState('')
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [pickupSearchValue, setPickupSearchValue] = useState('')
  const [deliverySearchValue, setDeliverySearchValue] = useState('')
  const [selectedPickupCity, setSelectedPickupCity] = useState('')
  const [selectedDeliveryCity, setSelectedDeliveryCity] = useState('')
  const [routeInfo, setRouteInfo] = useState(null)
  const [pickupOtopark, setPickupOtopark] = useState(false)
  const [deliveryOtopark, setDeliveryOtopark] = useState(false)
  const [araclar, setAraclar] = useState([])
  const [musteriBilgileri, setMusteriBilgileri] = useState({
    musteriTipi: '',
    ad: '',
    soyad: '',
    tcVatandasi: true,
    tcKimlik: '',
    firmaAdi: '',
    vergiNo: '',
    vergiDairesi: '',
    telefon: '',
    email: ''
  })
  const [vehicleData, setVehicleData] = useState({
    aracMarkalari: [],
    aracModelleri: {},
    yillar: [],
    segmentler: [],
    durumlar: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [modelOptions, setModelOptions] = useState([])
  const [sehirFiyatlandirma, setSehirFiyatlandirma] = useState(null)
  const [deliverySehirFiyatlandirma, setDeliverySehirFiyatlandirma] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [otoparkInfo, setOtoparkInfo] = useState({ adres: '', lat: null, lng: null })
  const citySelectRef = useRef(null)
  const [activeLocation, setActiveLocation] = useState(null)
  const [directions, setDirections] = useState(null)
  const [activeMapPanel, setActiveMapPanel] = useState(null)
  const [isLoadingTopluCekici, setIsLoadingTopluCekici] = useState(true)
  const [sehirler, setSehirler] = useState([])
  const [kmBasedFees, setKmBasedFees] = useState([])
  const [routes, setRoutes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/variables/toplu-cekici/all');
        
        if (!data || !data.topluCekici || !data.sehirler) {
          throw new Error('Invalid data format received from API');
        }

        setFiyatlandirma({
          ...data.topluCekici,
          topluCekiciBasePrice: data.topluCekici.basePrice,
          sehirler: data.sehirler || []
        });
        setSehirler(data.sehirler || []);
        setLoading(false);
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Araç segmentleri ve durumlarını API'den çek
  useEffect(() => {
    const fetchSegmentsAndStatuses = async () => {
      try {
        const [segmentsRes, statusesRes, vehicleInfoRes] = await Promise.all([
          api.get('/api/variables/car-segments?type=toplu-cekici'),
          api.get('/api/variables/car-statuses?type=toplu-cekici'),
          fetch('/data/arac-info.json').then(r => r.json())
        ]);
        setVehicleData({
          aracMarkalari: vehicleInfoRes.aracMarkalari || [],
          aracModelleri: vehicleInfoRes.aracModelleri || {},
          yillar: vehicleInfoRes.yillar || [],
          segmentler: segmentsRes.data,
          durumlar: statusesRes.data
        });
      } catch (err) {
        // Hata yönetimi
        setVehicleData({
          aracMarkalari: [],
          aracModelleri: {},
          yillar: [],
          segmentler: [],
          durumlar: []
        });
      }
    };
    fetchSegmentsAndStatuses();
  }, []);

  useEffect(() => {
    const fetchKmFiyatlar = async () => {
      try {
        const response = await api.get('/api/variables/toplu-cekici/km-fiyatlar');
        setKmBasedFees(response.data);
        console.log('🚛 KM Fiyatları Yüklendi:', response.data);
      } catch (error) {
        console.error('KM fiyatları yüklenirken hata:', error);
      }
    };

    fetchKmFiyatlar();
  }, []);

  // Rota hesaplama fonksiyonu
  const calculateRoute = useCallback(async () => {
    if (!pickupLocation || !deliveryLocation || !window.google) return;
    try {
      const directionsService = new window.google.maps.DirectionsService();
      let routes = [];

      // 1. Konum -> Otopark rotası (kırmızı)
      if (!pickupOtopark && pickupLocation && sehirFiyatlandirma) {
        const pickupOtoparkLocation = {
          lat: Number(sehirFiyatlandirma.otoparkLat),
          lng: Number(sehirFiyatlandirma.otoparkLng)
        };
        const result1 = await directionsService.route({
          origin: pickupLocation,
          destination: pickupOtoparkLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        routes.push({
          directions: result1,
          color: '#FF0000'
        });
      }

      // 2. Otopark -> Otopark rotası (sarı)
      if (sehirFiyatlandirma && deliverySehirFiyatlandirma) {
        const pickupOtoparkLocation = {
          lat: Number(sehirFiyatlandirma.otoparkLat),
          lng: Number(sehirFiyatlandirma.otoparkLng)
        };
        const deliveryOtoparkLocation = {
          lat: Number(deliverySehirFiyatlandirma.otoparkLat),
          lng: Number(deliverySehirFiyatlandirma.otoparkLng)
        };
        const result2 = await directionsService.route({
          origin: pickupOtoparkLocation,
          destination: deliveryOtoparkLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        routes.push({
          directions: result2,
          color: '#FFFF00'
        });
      }

      // 3. Otopark -> Konum rotası (yeşil)
      if (!deliveryOtopark && deliveryLocation && deliverySehirFiyatlandirma) {
        const deliveryOtoparkLocation = {
          lat: Number(deliverySehirFiyatlandirma.otoparkLat),
          lng: Number(deliverySehirFiyatlandirma.otoparkLng)
        };
        const result3 = await directionsService.route({
          origin: deliveryOtoparkLocation,
          destination: deliveryLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        routes.push({
          directions: result3,
          color: '#00FF00'
        });
      }

      // Toplam mesafe ve süre hesaplama
      let totalDistance = 0;
      let totalDuration = 0;

      routes.forEach(route => {
        const leg = route.directions.routes[0].legs[0];
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
      });

      // Rota bilgilerini güncelle
      setRouteInfo({
        distance: `${(totalDistance / 1000).toFixed(1)} km`,
        duration: `${Math.round(totalDuration / 60)} dakika`,
        distanceValue: totalDistance,
        durationValue: totalDuration
      });

      // Rotaları güncelle
      setRoutes(routes);
    } catch (error) {
      if (error.message && error.message.includes('ZERO_RESULTS')) {
        toast.error('Seçilen iki nokta arasında yol bulunamadı. Lütfen farklı bir konum seçin.');
        console.error('Rota bulunamadı:', { pickupLocation, deliveryLocation });
      } else {
        console.error('Rota hesaplama hatası:', error, { pickupLocation, deliveryLocation });
      }
    }
  }, [pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, sehirFiyatlandirma, deliverySehirFiyatlandirma]);

  // Konumlar değiştiğinde rotayı hesapla
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateRoute();
    }
  }, [pickupLocation, deliveryLocation, calculateRoute]);

  const getKmBasedPrice = (km, kmBasedFees) => {
    // Backend'den gelen KM fiyatlarına göre hesaplama
    const fee = kmBasedFees.find(fee => km >= fee.minKm && km <= fee.maxKm);
    return fee ? Number(fee.kmBasiUcret) : 0;
  };

  const calculateParkingFee = async (input) => {
    const { baseFee, parkingDistance, kmBasedFees, vehicle, segmentMultiplier, durumFiyati } = input;
    const kmPrice = getKmBasedPrice(parkingDistance, kmBasedFees);
    return Math.round(baseFee + (parkingDistance * kmPrice) + (durumFiyati * segmentMultiplier));
  };

  const calculateCityDeliveryFee = async (input) => {
    if (!input) return 0;
    const { distance, cityFee } = input;
    return Math.round((distance * cityFee.basePricePerKm) + cityFee.basePrice);
  };

  // setLocationWithValidation fonksiyonunu güncelle
  const setLocationWithValidation = (setter, location) => {
    const loc = normalizeLocation(location);
    if (loc && isValidCoordinate(loc.lat) && isValidCoordinate(loc.lng)) {
      setter(loc);
    } else {
      console.error('Invalid coordinates:', location);
    }
  };

  // Rota ve mesafe hesaplamadan önce origin/destination'ı normalizeLocation ile kullan
  const getDistanceBetween = async (origin, destination) => {
    try {
      const o = normalizeLocation(origin);
      const d = normalizeLocation(destination);
      if (
        isNaN(o.lat) || isNaN(o.lng) ||
        isNaN(d.lat) || isNaN(d.lng)
      ) {
        console.error('Invalid coordinates:', { origin, destination });
        return 0;
      }
      const directionsService = new window.google.maps.DirectionsService();
      try {
        const result = await directionsService.route({
          origin: { lat: o.lat, lng: o.lng },
          destination: { lat: d.lat, lng: d.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        if (!result.routes?.[0]?.legs?.[0]) {
          console.error('Invalid route result:', result);
          return 0;
        }
        return result.routes[0].legs[0].distance.value / 1000; // km
      } catch (error) {
        if (error.message && error.message.includes('ZERO_RESULTS')) {
          toast.error('Seçilen iki nokta arasında yol bulunamadı. Lütfen farklı bir konum seçin.');
          console.error('Rota bulunamadı:', { origin: o, destination: d });
          return 0;
        } else {
          console.error('Mesafe hesaplama hatası:', error, { origin: o, destination: d });
          return 0;
        }
      }
    } catch (error) {
      console.error('Mesafe hesaplama hatası:', error);
      return 0;
    }
  };

  const calculateTotalPrice = async (input, showDebug = false) => {
    try {
      if (showDebug) {
        console.log('--- DEBUG GİRDİLERİ ---');
        console.log('Alınacak Konum:', input.pickupLocation);
        console.log('Alınacak Otopark:', input.pickupOtopark);
        console.log('Alınacak Şehir Fiyatlandırması:', input.sehirFiyatlandirma);
        console.log('Teslim Edilecek Konum:', input.deliveryLocation);
        console.log('Teslim Edilecek Otopark:', input.deliveryOtopark);
        console.log('Teslim Edilecek Şehir Fiyatlandırması:', input.deliverySehirFiyatlandirma);
        console.log('Genel Fiyatlandırma:', input.fiyatlandirma);
        console.log('KM Bazlı Ücretler:', input.kmBasedFees);
        console.log('Araçlar:', input.araclar);
        console.log('-------------------');
      }

      let totalPrice = 0;
      let routes = [];

      // 1. Aşama: Konum -> Otopark (Alınacak şehir)
      if (!input.pickupOtopark && input.pickupLocation && input.sehirFiyatlandirma) {
        const pickupOtoparkLocation = {
          lat: Number(input.sehirFiyatlandirma.otoparkLat),
          lng: Number(input.sehirFiyatlandirma.otoparkLng)
        };
        const pickupToOtoparkKm = await getDistanceBetween(input.pickupLocation, pickupOtoparkLocation);
        const pickupToOtoparkPrice = Number(input.sehirFiyatlandirma.basePrice) + (pickupToOtoparkKm * Number(input.sehirFiyatlandirma.basePricePerKm));
        if (showDebug) {
          console.log('\n1️⃣ Alınacak Konum -> Otopark:');
          console.log('- Mesafe:', pickupToOtoparkKm.toFixed(2), 'km');
          console.log('- Base Price:', Number(input.sehirFiyatlandirma.basePrice).toFixed(2), 'TL');
          console.log('- KM Başına Ücret:', Number(input.sehirFiyatlandirma.basePricePerKm).toFixed(2), 'TL');
          console.log('- Toplam Fiyat:', pickupToOtoparkPrice.toFixed(2), 'TL');
        }
        totalPrice += pickupToOtoparkPrice;
        routes.push({
          origin: input.pickupLocation,
          destination: pickupOtoparkLocation,
          color: '#FF0000'
        });
      } else if (showDebug) {
        console.log('\n1️⃣ Alınacak Konum -> Otopark: Gerekli parametreler eksik!');
      }

      // 2. Aşama: Otopark -> Otopark (Toplu Çekici)
      if (input.sehirFiyatlandirma && input.deliverySehirFiyatlandirma && input.fiyatlandirma) {
        const pickupOtoparkLocation = {
          lat: Number(input.sehirFiyatlandirma.otoparkLat),
          lng: Number(input.sehirFiyatlandirma.otoparkLng)
        };
        const deliveryOtoparkLocation = {
          lat: Number(input.deliverySehirFiyatlandirma.otoparkLat),
          lng: Number(input.deliverySehirFiyatlandirma.otoparkLng)
        };
        const otoparkToOtoparkKm = await getDistanceBetween(pickupOtoparkLocation, deliveryOtoparkLocation);
        const kmBasedPrice = getKmBasedPrice(otoparkToOtoparkKm, input.kmBasedFees);
        const otoparkToOtoparkPrice = Number(input.fiyatlandirma.basePrice) + (otoparkToOtoparkKm * kmBasedPrice);
        if (showDebug) {
          console.log('\n2️⃣ Otopark -> Otopark (Toplu Çekici):');
          console.log('- Mesafe:', otoparkToOtoparkKm.toFixed(2), 'km');
          console.log('- Base Price:', Number(input.fiyatlandirma.basePrice).toFixed(2), 'TL');
          console.log('- KM Başına Ücret:', kmBasedPrice.toFixed(2), 'TL');
          console.log('- Toplam Fiyat:', otoparkToOtoparkPrice.toFixed(2), 'TL');
        }
        totalPrice += otoparkToOtoparkPrice;
        routes.push({
          origin: pickupOtoparkLocation,
          destination: deliveryOtoparkLocation,
          color: '#FFFF00'
        });
      } else if (showDebug) {
        console.log('\n2️⃣ Otopark -> Otopark (Toplu Çekici): Gerekli parametreler eksik!');
      }

      // 3. Aşama: Otopark -> Konum (Teslim edilecek şehir)
      if (!input.deliveryOtopark && input.deliveryLocation && input.deliverySehirFiyatlandirma) {
        const deliveryOtoparkLocation = {
          lat: Number(input.deliverySehirFiyatlandirma.otoparkLat),
          lng: Number(input.deliverySehirFiyatlandirma.otoparkLng)
        };
        const otoparkToDeliveryKm = await getDistanceBetween(deliveryOtoparkLocation, input.deliveryLocation);
        const otoparkToDeliveryPrice = Number(input.deliverySehirFiyatlandirma.basePrice) + (otoparkToDeliveryKm * Number(input.deliverySehirFiyatlandirma.basePricePerKm));
        if (showDebug) {
          console.log('\n3️⃣ Otopark -> Teslim Edilecek Konum:');
          console.log('- Mesafe:', otoparkToDeliveryKm.toFixed(2), 'km');
          console.log('- Base Price:', Number(input.deliverySehirFiyatlandirma.basePrice).toFixed(2), 'TL');
          console.log('- KM Başına Ücret:', Number(input.deliverySehirFiyatlandirma.basePricePerKm).toFixed(2), 'TL');
          console.log('- Toplam Fiyat:', otoparkToDeliveryPrice.toFixed(2), 'TL');
        }
        totalPrice += otoparkToDeliveryPrice;
        routes.push({
          origin: deliveryOtoparkLocation,
          destination: input.deliveryLocation,
          color: '#00FF00'
        });
      } else if (showDebug) {
        console.log('\n3️⃣ Otopark -> Teslim Edilecek Konum: Gerekli parametreler eksik!');
      }

      // 4. Aşama: Araç bazlı hesaplama
      if (showDebug) {
        console.log('\n4️⃣ Araç Detayları:');
      }
      for (const arac of input.araclar) {
        if (showDebug) {
          console.log(`\n🚗 Araç ${input.araclar.indexOf(arac) + 1}:`);
          console.log('- Marka:', arac.marka);
          console.log('- Model:', arac.model);
          console.log('- Segment:', arac.segment);
          console.log('- Durum:', arac.durum);
        }
        const segmentObj = vehicleData.segmentler.find(seg => String(seg.id) === String(arac.segment));
        const segmentMultiplier = segmentObj ? Number(segmentObj.price) : 1;
        const statusObj = vehicleData.durumlar.find(st => String(st.id) === String(arac.durum));
        const statusMultiplier = statusObj ? Number(statusObj.price) : 0;
        if (showDebug) {
          console.log('- Segment Çarpanı:', segmentMultiplier.toFixed(2));
          console.log('- Durum Ücreti:', statusMultiplier.toFixed(2), 'TL');
        }
        const aracPrice = (totalPrice * segmentMultiplier) + statusMultiplier;
        if (showDebug) {
          console.log('- Araç Toplam Fiyatı:', aracPrice.toFixed(2), 'TL');
        }
        totalPrice = aracPrice;
      }

      // 5. Aşama: KDV Hesaplama
      const kdvOrani = 0.20; // %20 KDV
      const kdvTutari = totalPrice * kdvOrani;
      totalPrice += kdvTutari;

      if (showDebug) {
        console.log('\n5️⃣ KDV Hesaplama:');
        console.log('- KDV Oranı:', (kdvOrani * 100).toFixed(0) + '%');
        console.log('- KDV Tutarı:', kdvTutari.toFixed(2), 'TL');
        console.log('\n💰 Final Fiyat (KDV Dahil):', totalPrice.toFixed(2), 'TL');
      }

      return { totalPrice: Math.round(totalPrice), routes };
    } catch (error) {
      console.error('Fiyat hesaplama hatası:', error);
      throw error;
    }
  };

  // Fiyat hesaplama useEffect'ini güncelle
  useEffect(() => {
    const calculatePrice = async () => {
      if (
        pickupLocation &&
        deliveryLocation &&
        araclar.length > 0 &&
        sehirFiyatlandirma &&
        fiyatlandirma
      ) {
        const result = await calculateTotalPrice({
          pickupLocation,
          deliveryLocation,
          pickupOtopark,
          deliveryOtopark,
          araclar,
          sehirFiyatlandirma,
          deliverySehirFiyatlandirma,
          fiyatlandirma,
          kmBasedFees
        });
        setToplamFiyat(result.totalPrice);
        setRoutes(result.routes);
      }
    };

    calculatePrice();
  }, [pickupLocation, deliveryLocation, araclar, sehirFiyatlandirma, deliverySehirFiyatlandirma, fiyatlandirma, pickupOtopark, deliveryOtopark, kmBasedFees]);

  // Debounce edilmiş değerler
  const debouncedPickupLocation = useDebounce(pickupLocation, 500);
  const debouncedDeliveryLocation = useDebounce(deliveryLocation, 500);
  const debouncedAraclar = useDebounce(araclar, 500);
  const debouncedRouteInfo = useDebounce(routeInfo, 500);

  // Konumlar değiştiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedPickupLocation && debouncedDeliveryLocation) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        fiyatlandirma,
        sehirFiyatlandirma
      });
    }
  }, [debouncedPickupLocation, debouncedDeliveryLocation, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, fiyatlandirma, sehirFiyatlandirma]);

  // Araç listesi değiştiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedAraclar?.length > 0) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        fiyatlandirma,
        sehirFiyatlandirma
      });
    }
  }, [debouncedAraclar, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, fiyatlandirma, sehirFiyatlandirma]);

  // Rota bilgisi güncellendiğinde fiyat hesapla
  useEffect(() => {
    if (debouncedRouteInfo) {
      calculateTotalPrice({
        pickupLocation,
        deliveryLocation,
        pickupOtopark,
        deliveryOtopark,
        araclar,
        fiyatlandirma,
        sehirFiyatlandirma
      });
    }
  }, [debouncedRouteInfo, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, fiyatlandirma, sehirFiyatlandirma]);

  // Şehir seçildiğinde fiyatlandırma ve otopark bilgisi çek
  useEffect(() => {
    if (selectedPickupCity) {
      const fetchSehirFiyat = async () => {
        try {
          const normalizedSehir = normalizeSehirAdi(selectedPickupCity);
          const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
          setSehirFiyatlandirma(response.data);
          if (pickupOtopark) {
            setLocationWithValidation(setPickupLocation, normalizeLocation({
              lat: response.data.otoparkLat,
              lng: response.data.otoparkLng,
              address: response.data.otoparkAdres
            }));
            setPickupSearchValue(response.data.otoparkAdres);
          }
        } catch (err) {
          console.error('Şehir fiyatlandırma hatası:', err);
          setSehirFiyatlandirma(null);
        }
      };
      fetchSehirFiyat();
    }
  }, [selectedPickupCity, pickupOtopark]);

  useEffect(() => {
    if (selectedDeliveryCity) {
      const fetchSehirFiyat = async () => {
        try {
          const normalizedSehir = normalizeSehirAdi(selectedDeliveryCity);
          const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
          if (deliveryOtopark) {
            setLocationWithValidation(setDeliveryLocation, normalizeLocation({
              lat: response.data.otoparkLat,
              lng: response.data.otoparkLng,
              address: response.data.otoparkAdres
            }));
            setDeliverySearchValue(response.data.otoparkAdres);
          }
        } catch (err) {
          console.error('Şehir fiyatlandırma hatası:', err);
        }
      };
      fetchSehirFiyat();
    }
  }, [selectedDeliveryCity, deliveryOtopark]);

  // Remove duplicate useEffect hooks and consolidate them
  useEffect(() => {
    const handleLocationUpdate = async (isPickup) => {
      const city = isPickup ? selectedPickupCity : selectedDeliveryCity;
      const isOtopark = isPickup ? pickupOtopark : deliveryOtopark;
      const setLocation = isPickup ? setPickupLocation : setDeliveryLocation;
      const setSearchValue = isPickup ? setPickupSearchValue : setDeliverySearchValue;
      const setSehirFiyat = isPickup ? setSehirFiyatlandirma : setDeliverySehirFiyatlandirma;

      if (isOtopark && city && fiyatlandirma?.sehirler) {
        const sehir = fiyatlandirma.sehirler.find(s => s.sehirAdi === city);
        if (sehir) {
          setSearchValue(sehir.otoparkAdres);
          setLocation({
            lat: Number(sehir.otoparkLat),
            lng: Number(sehir.otoparkLng),
            address: sehir.otoparkAdres
          });
          setSehirFiyat(sehir);
        }
      }
    };

    handleLocationUpdate(true); // Handle pickup location
    handleLocationUpdate(false); // Handle delivery location
  }, [pickupOtopark, deliveryOtopark, selectedPickupCity, selectedDeliveryCity, fiyatlandirma]);

  // Add new useEffect for handling city detection
  useEffect(() => {
    const detectCityAndSetPricing = async (location, isPickup) => {
      if (!location || !window.google) return;

      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });

        // Find the city component
        const cityComponent = result.address_components.find(component => 
          component.types.includes('administrative_area_level_1')
        );

        if (cityComponent && fiyatlandirma?.sehirler) {
          const cityName = cityComponent.long_name;
          const sehir = fiyatlandirma.sehirler.find(s => s.sehirAdi === cityName);
          
          if (sehir) {
            if (isPickup) {
              setSelectedPickupCity(cityName);
              setSehirFiyatlandirma(sehir);
            } else {
              setSelectedDeliveryCity(cityName);
              setDeliverySehirFiyatlandirma(sehir);
            }
          }
        }
      } catch (error) {
        console.error('City detection error:', error);
      }
    };

    if (pickupLocation) {
      detectCityAndSetPricing(pickupLocation, true);
    }
    if (deliveryLocation) {
      detectCityAndSetPricing(deliveryLocation, false);
    }
  }, [pickupLocation, deliveryLocation, fiyatlandirma]);

  // Improve geolocation error handling
  const handleCurrentLocation = async (target) => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'denied') {
        toast.error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.');
        return;
      }

      const loadingToast = toast.loading('Konumunuz alınıyor...', { id: 'location' });
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      const getPosition = (highAccuracy = true) => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              ...options,
              enableHighAccuracy: highAccuracy,
              timeout: highAccuracy ? 15000 : 60000
            }
          );
        });
      };

      try {
        const position = await getPosition(true);
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromLatLng(latitude, longitude);
        const newLocation = normalizeLocation({ lat: latitude, lng: longitude, address });
        
        if (target === 'pickup') {
          setPickupLocation(newLocation);
          setPickupSearchValue(address);
        } else {
          setDeliveryLocation(newLocation);
          setDeliverySearchValue(address);
        }
        setActiveMapPanel(null);
        
        toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
      } catch (error) {
        console.error('High accuracy geolocation error:', error);
        
        if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
          try {
            const lowAccuracyPosition = await getPosition(false);
            const { latitude, longitude } = lowAccuracyPosition.coords;
            const address = await getAddressFromLatLng(latitude, longitude);
            const newLocation = normalizeLocation({ lat: latitude, lng: longitude, address });

            if (target === 'pickup') {
              setPickupLocation(newLocation);
              setPickupSearchValue(address);
            } else {
              setDeliveryLocation(newLocation);
              setDeliverySearchValue(address);
            }
            setActiveMapPanel(null);
            
            toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
            return;
          } catch (retryError) {
            console.error('Low accuracy geolocation error:', retryError);
          }
        }

        let errorMessage = 'Konum alınamadı.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi alınamadı. Lütfen konum servislerinizin açık olduğundan emin olun ve tekrar deneyin.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.';
            break;
          default:
            errorMessage = 'Konum alınamadı. Lütfen manuel olarak girin.';
        }
        
        toast.error(errorMessage, { id: 'location' });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      toast.error('Konum izni kontrol edilemedi. Lütfen manuel olarak girin.');
    }
  };

  const handleClose = () => {
    if (pnrNumber) {
      // PNR'ı localStorage'a kaydet
      localStorage.setItem('lastPnr', pnrNumber);
      
      // Sipariş bilgilerini kaydet
      const orderInfo = {
        pnr: pnrNumber,
        pickupCity: selectedPickupCity,
        deliveryCity: selectedDeliveryCity,
        vehicles: araclar,
        price: toplamFiyat,
        customerInfo: musteriBilgileri,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`order_${pnrNumber}`, JSON.stringify(orderInfo));
      
      // PNR sorgulama sayfasına yönlendir
      window.location.href = `/pnr-sorgula?pnr=${pnrNumber}`;
    }
    onClose();
  };

  const aracEkle = () => {
    const yeniArac = {
      id: Date.now(), // Benzersiz ID ekle
      marka: '',
      model: '',
      yil: '',
      plaka: '',
      segment: '',
      durum: ''
    };
    setAraclar(prev => [...prev, yeniArac]);
  };

  const aracSil = (id) => {
    setAraclar(prev => prev.filter(arac => arac.id !== id));
  };

  const aracGuncelle = (id, field, value) => {
    setAraclar(prev => prev.map(arac => {
      if (arac.id === id) {
        const updatedArac = { ...arac, [field]: value };
        
        // Marka değiştiğinde model seçeneklerini güncelle
        if (field === 'marka') {
          const models = vehicleData?.aracModelleri[value] || [];
          setModelOptions(models);
          // Modeli sıfırla
          updatedArac.model = '';
        }
        
        return updatedArac;
      }
      return arac;
    }));
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    if (activeLocation === 'pickup') {
      setPickupSearchValue(value);
    } else {
      setDeliverySearchValue(value);
    }
  };

  // Autocomplete ve harita tıklama için konum atamalarını güncelle
  const handlePredictionSelect = async (prediction) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ placeId: prediction.place_id });
      if (result.results[0]) {
        const location = normalizeLocation({
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng(),
          address: result.results[0].formatted_address
        });
        if (activeLocation === 'pickup') {
          setPickupLocation(location);
          setPickupSearchValue(location.address);
        } else {
          setDeliveryLocation(location);
          setDeliverySearchValue(location.address);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && window.google) {
      const pickupInput = document.getElementById('pickup-input');
      const deliveryInput = document.getElementById('delivery-input');

      if (pickupInput) {
        const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInput, {
          types: ['address'],
          componentRestrictions: { country: 'tr' }
        });

        pickupAutocomplete.addListener('place_changed', () => {
          const place = pickupAutocomplete.getPlace();
          if (place.geometry) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            };
            setPickupLocation(location);
            setPickupSearchValue(location.address);
          }
        });
      }

      if (deliveryInput) {
        const deliveryAutocomplete = new window.google.maps.places.Autocomplete(deliveryInput, {
          types: ['address'],
          componentRestrictions: { country: 'tr' }
        });

        deliveryAutocomplete.addListener('place_changed', () => {
          const place = deliveryAutocomplete.getPlace();
          if (place.geometry) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            };
            setDeliveryLocation(location);
            setDeliverySearchValue(location.address);
          }
        });
      }
    }
  }, [isLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Konum kontrolleri
      if (pickupOtopark && !selectedPickupCity) {
        toast.error('Lütfen alınacak şehri seçin');
        return;
      }
      
      if (deliveryOtopark && !selectedDeliveryCity) {
        toast.error('Lütfen teslim edilecek şehri seçin');
        return;
      }

      if (!pickupOtopark && !pickupLocation) {
        toast.error('Lütfen alınacak konumu seçin');
        return;
      }
      
      if (!deliveryOtopark && !deliveryLocation) {
        toast.error('Lütfen teslim edilecek konumu seçin');
        return;
      }

      setStep(2);
    } else if (step === 2) {
      // Araç kontrolleri
      if (araclar.length === 0) {
        toast.error('Lütfen en az bir araç ekleyin');
        return;
      }

      if (araclar.some(arac => !arac.marka || !arac.model || !arac.segment || !arac.yil || !arac.plaka)) {
        toast.error('Lütfen tüm araç bilgilerini eksiksiz doldurun');
        return;
      }

      setStep(3);
    } else if (step === 3) {
      if (!toplamFiyat) {
        toast.error('Lütfen fiyat hesaplamasını bekleyin');
        return;
      }

      setStep(4);
    } else if (step === 4) {
      // Müşteri bilgileri kontrolleri
      if (musteriBilgileri.musteriTipi === 'kisisel') {
        if (!musteriBilgileri.ad || !musteriBilgileri.soyad || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          toast.error('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
        if (musteriBilgileri.tcVatandasi && !musteriBilgileri.tcKimlik) {
          toast.error('Lütfen TC Kimlik numaranızı girin');
          return;
        }
      } else if (musteriBilgileri.musteriTipi === 'kurumsal') {
        if (!musteriBilgileri.firmaAdi || !musteriBilgileri.vergiNo || !musteriBilgileri.vergiDairesi || !musteriBilgileri.telefon || !musteriBilgileri.email) {
          toast.error('Lütfen tüm firma bilgilerini eksiksiz doldurun');
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await createOrder();
      } catch (error) {
        console.error('Sipariş oluşturma hatası:', error);
        toast.error('Sipariş oluşturulurken bir hata oluştu: ' + (error?.response?.data?.message || error?.message || 'Bilinmeyen hata'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const createOrder = async () => {
    try {
      // Müşteri bilgilerini hazırla
      const customerInfo = {
        ad: musteriBilgileri.ad,
        soyad: musteriBilgileri.soyad,
        telefon: musteriBilgileri.telefon,
        email: musteriBilgileri.email,
        tcKimlik: musteriBilgileri.tcKimlik || '11111111',
        firmaAdi: musteriBilgileri.firmaAdi,
        vergiNo: musteriBilgileri.vergiNo,
        vergiDairesi: musteriBilgileri.vergiDairesi
      };

      // Araç bilgilerini hazırla - Backend'in beklediği formatta
      const vehicles = araclar.map(arac => ({
        tip: arac.segment,
        marka: arac.marka,
        model: arac.model,
        yil: arac.yil,
        plaka: arac.plaka,
        condition: arac.durum
      }));

      // Sipariş verilerini hazırla
      const orderData = {
        serviceType: 'TOPLU_CEKICI',
        customerInfo,
        vehicles,
        price: toplamFiyat,
        pickupLocation: pickupLocation.address,
        dropoffLocation: deliveryLocation.address,
        isPickupFromParking: pickupOtopark,
        isDeliveryToParking: deliveryOtopark,
      };

      console.log('Gönderilen sipariş verisi:', orderData);

      // API'ye gönder
      const { data } = await api.post('/api/orders', orderData);

      if (!data || !data.pnr) {
        throw new Error('Talep numarası alınamadı');
      }

      setPnrNumber(data.pnr);
      setStep(5);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
        
        // Sipariş bilgilerini kaydet
        const orderInfo = {
          pnr: data.pnr,
          pickupCity: selectedPickupCity,
          deliveryCity: selectedDeliveryCity,
          vehicles,
          price: toplamFiyat,
          customerInfo,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`order_${data.pnr}`, JSON.stringify(orderInfo));
      }

      toast.success('Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu: ' + (error?.response?.data?.message || error?.message || 'Bilinmeyen hata'));
    }
  };

  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return '';
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve('');
        }
      });
    });
  };

  const handleMapClick = async (e) => {
    const lat = Number(e.latLng.lat());
    const lng = Number(e.latLng.lng());
    const address = await getAddressFromLatLng(lat, lng);
    const newLocation = normalizeLocation({ lat, lng, address });

    // Google Maps Geocoder ile şehir bilgisini al
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
      if (status === 'OK' && results[0]) {
        let sehir = '';
        for (const component of results[0].address_components) {
          if (component.types.includes('administrative_area_level_1')) {
            sehir = component.long_name;
            break;
          }
        }

        // Şehir fiyatlandırmasını getir
        if (sehir) {
          try {
            const normalizedSehir = normalizeSehirAdi(sehir);
            const response = await api.get(`/api/variables/toplu-cekici/sehirler/${normalizedSehir}`);
            setSehirFiyatlandirma(response.data);
          } catch (error) {
            setSehirFiyatlandirma(null);
          }
        }
      }
    });

    // Şehir tespiti yap
    const detectedCity = await sehirTespiti(newLocation);
    console.log('📍 Tespit edilen şehir:', detectedCity);

    if (activeLocation === 'pickup') {
      setLocationWithValidation(setPickupLocation, newLocation);
      setPickupSearchValue(address);
      if (detectedCity) {
        setSelectedPickupCity(detectedCity);
      }
    } else {
      setLocationWithValidation(setDeliveryLocation, newLocation);
      setDeliverySearchValue(address);
      if (detectedCity) {
        setSelectedDeliveryCity(detectedCity);
      }
    }
    setActiveMapPanel(null);
  };

  const FiyatDetaylari = ({ routeInfo, toplamFiyat }) => {
    return (
      <div className="space-y-4">
        <div className="bg-[#202020] rounded-lg p-3">
          <div className="text-[#404040] text-sm mb-1">Toplam Tutar</div>
          <div className="text-2xl font-bold text-yellow-500">
            {toplamFiyat.toLocaleString('tr-TR')} TL
          </div>
        </div>
        {routeInfo && (
          <>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#404040] text-sm mb-1">Mesafe</div>
              <div className="text-white font-medium">{routeInfo.distance}</div>
            </div>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#404040] text-sm mb-1">Tahmini Süre</div>
              <div className="text-white font-medium">{routeInfo.duration}</div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Add useEffect to show route map when both locations are selected
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      setActiveMapPanel('route');
    }
  }, [pickupLocation, deliveryLocation]);

  useEffect(() => {
    if (
      step === 3 &&
      pickupLocation &&
      deliveryLocation
    ) {
      setActiveMapPanel('route');
    }
  }, [step, pickupLocation, deliveryLocation]);

  // Fiyat hesaplama fonksiyonu
  const fiyatHesapla = useCallback(async (showDebug = false) => {
    if (
      !pickupLocation ||
      !deliveryLocation ||
      araclar.length === 0 ||
      !sehirFiyatlandirma ||
      !fiyatlandirma
    ) {
      setToplamFiyat(0);
      return 0;
    }
    const result = await calculateTotalPrice({
      pickupLocation,
      deliveryLocation,
      pickupOtopark,
      deliveryOtopark,
      araclar,
      sehirFiyatlandirma,
      deliverySehirFiyatlandirma,
      fiyatlandirma,
      kmBasedFees
    }, showDebug);
    setToplamFiyat(result.totalPrice);
    setRoutes(result.routes);
    return result.totalPrice;
  }, [pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, sehirFiyatlandirma, deliverySehirFiyatlandirma, fiyatlandirma, kmBasedFees, calculateTotalPrice]);

  // Fiyat hesaplamayı useEffect ile tetikle
  useEffect(() => {
    fiyatHesapla();
  }, [pickupLocation, deliveryLocation, araclar, sehirFiyatlandirma, deliverySehirFiyatlandirma, fiyatlandirma, pickupOtopark, deliveryOtopark, kmBasedFees, fiyatHesapla]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
      <div className="relative bg-[#202020]/95 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#404040] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {step === 1 ? 'Konum Seçimi' : 
             step === 2 ? 'Araç Bilgileri' : 
             step === 3 ? 'Fiyat ve Rota' : 
             step === 4 ? 'Müşteri Bilgileri' :
             'Sipariş Tamamlandı'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Aracı Bize Teslim Edeceğiniz Konum</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pickupOtopark"
                      checked={pickupOtopark}
                      onChange={(e) => setPickupOtopark(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-[#202020] border-[#404040] rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <label htmlFor="pickupOtopark" className="text-white">
                      Otoparka Teslim Edilecek
                    </label>
                  </div>

                  {pickupOtopark ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={selectedPickupCity}
                        onChange={(e) => setSelectedPickupCity(e.target.value)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.map((sehir) => (
                          <option key={`pickup-${sehir.id}`} value={sehir.sehirAdi}>
                            {sehir.sehirAdi}
                          </option>
                        ))}
                      </select>
                      {selectedPickupCity && (
                        <div className="bg-[#202020] rounded-lg p-3">
                          <div className="text-[#404040] text-sm mb-1">Otopark Konumu</div>
                          <div className="text-white font-medium text-sm">
                            {sehirler.find(s => s.sehirAdi === selectedPickupCity)?.otoparkAdres}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          id="pickup-input"
                          type="text"
                          value={pickupSearchValue}
                          onChange={handleInputChange}
                          onFocus={() => setActiveLocation('pickup')}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                          <button
                            type="button"
                            onClick={() => handleCurrentLocation('pickup')}
                            className="text-[#404040] hover:text-white transition-colors"
                            title="Mevcut Konumu Kullan"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLocation('pickup');
                              setActiveMapPanel(activeMapPanel === 'pickup' ? null : 'pickup');
                            }}
                            className={`text-[#404040] hover:text-yellow-500 transition-colors ${activeMapPanel === 'pickup' ? 'text-yellow-500' : ''}`}
                            title="Haritadan Seç"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l.94 1.57a2 2 0 001.7.95h5.34a2 2 0 011.7-.95l.94-1.57A2 2 0 0116.72 3H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {isLoaded && activeMapPanel === 'pickup' && (
                        <div style={mapStyles} className="relative mt-2">
                          <GoogleMap
                            mapContainerStyle={mapStyles}
                            center={pickupLocation || { lat: 41.0082, lng: 28.9784 }}
                            zoom={13}
                            options={mapOptions}
                            onClick={handleMapClick}
                          >
                            {pickupLocation && <Marker position={pickupLocation} clickable={false} />}
                          </GoogleMap>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Aracı Teslim Alacağımız Konum</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="deliveryOtopark"
                      checked={deliveryOtopark}
                      onChange={(e) => setDeliveryOtopark(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-[#202020] border-[#404040] rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <label htmlFor="deliveryOtopark" className="text-white">
                      Otoparktan Teslim Alınacak
                    </label>
                  </div>

                  {deliveryOtopark ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={selectedDeliveryCity}
                        onChange={(e) => setSelectedDeliveryCity(e.target.value)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.map((sehir) => (
                          <option key={`delivery-${sehir.id}`} value={sehir.sehirAdi}>
                            {sehir.sehirAdi}
                          </option>
                        ))}
                      </select>
                      {selectedDeliveryCity && (
                        <div className="bg-[#202020] rounded-lg p-3">
                          <div className="text-[#404040] text-sm mb-1">Otopark Konumu</div>
                          <div className="text-white font-medium text-sm">
                            {sehirler.find(s => s.sehirAdi === selectedDeliveryCity)?.otoparkAdres}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          id="delivery-input"
                          type="text"
                          value={deliverySearchValue}
                          onChange={handleInputChange}
                          onFocus={() => setActiveLocation('delivery')}
                          placeholder="Adres veya konum ara..."
                          className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                          <button
                            type="button"
                            onClick={() => handleCurrentLocation('delivery')}
                            className="text-[#404040] hover:text-white transition-colors"
                            title="Mevcut Konumu Kullan"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLocation('delivery');
                              setActiveMapPanel(activeMapPanel === 'delivery' ? null : 'delivery');
                            }}
                            className={`text-[#404040] hover:text-yellow-500 transition-colors ${activeMapPanel === 'delivery' ? 'text-yellow-500' : ''}`}
                            title="Haritadan Seç"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l.94 1.57a2 2 0 001.7.95h5.34a2 2 0 011.7-.95l.94-1.57A2 2 0 0116.72 3H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {isLoaded && activeMapPanel === 'delivery' && (
                        <div style={mapStyles} className="relative mt-2">
                          <GoogleMap
                            mapContainerStyle={mapStyles}
                            center={deliveryLocation || { lat: 41.0082, lng: 28.9784 }}
                            zoom={13}
                            options={mapOptions}
                            onClick={handleMapClick}
                          >
                            {deliveryLocation && <Marker position={deliveryLocation} clickable={false} />}
                          </GoogleMap>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!pickupLocation || !deliveryLocation || (pickupOtopark && !selectedPickupCity) || (deliveryOtopark && !selectedDeliveryCity)}
                className="w-full py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </form>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Araç Bilgileri</h3>
                <div className="space-y-4">
                  {araclar.map((arac) => (
                    <div key={`arac-${arac.id}`} className="bg-[#202020] rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-medium">Araç {araclar.indexOf(arac) + 1}</h4>
                        {araclar.length > 1 && (
                          <button
                            type="button"
                            onClick={() => aracSil(arac.id)}
                            className="text-[#404040] hover:text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Marka</label>
                          <select
                            value={arac.marka}
                            onChange={(e) => aracGuncelle(arac.id, 'marka', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.aracMarkalari.map((marka) => (
                              <option key={`marka-${marka}`} value={marka}>
                                {marka}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Model</label>
                          <select
                            value={arac.model}
                            onChange={(e) => aracGuncelle(arac.id, 'model', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                            disabled={!arac.marka}
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.aracModelleri[arac.marka]?.map((model) => (
                              <option key={`model-${model}`} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Segment</label>
                          <select
                            value={arac.segment}
                            onChange={(e) => aracGuncelle(arac.id, 'segment', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData.segmentler.map((segment) => (
                              <option key={`segment-${segment.id}`} value={segment.id}>
                                {segment.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Yıl</label>
                          <select
                            value={arac.yil}
                            onChange={(e) => aracGuncelle(arac.id, 'yil', e.target.value)}
                            className="w-full py-2 px-3 bg-[#141414] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                          >
                            <option value="">Seçin</option>
                            {vehicleData?.yillar.map((yil) => (
                              <option key={`yil-${yil}`} value={yil}>
                                {yil}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Plaka</label>
                          <input
                            type="text"
                            value={arac.plaka}
                            onChange={(e) => aracGuncelle(arac.id, 'plaka', e.target.value.toUpperCase())}
                            placeholder="34ABC123"
                            maxLength={8}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-[#404040] text-sm mb-1">Durum</label>
                          <select
                            value={arac.durum}
                            onChange={(e) => aracGuncelle(arac.id, 'durum', e.target.value)}
                            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          >
                            <option value="">Araç Durumu Seçin</option>
                            {vehicleData.durumlar.map((durum) => (
                              <option key={`durum-${durum.id}`} value={durum.id}>
                                {durum.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {araclar.length < 10 && (
                    <button
                      type="button"
                      onClick={aracEkle}
                      className="w-full py-3 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors border border-[#404040]"
                    >
                      + Araç Ekle
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={araclar.length === 0 || araclar.some(arac => !arac.marka || !arac.model || !arac.segment || !arac.yil || !arac.plaka)}
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Rota Bilgileri</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Alınacak Konum</div>
                    <div className="text-white font-medium text-sm" title={pickupSearchValue}>
                      {pickupSearchValue}
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Teslim Edilecek Konum</div>
                    <div className="text-white font-medium text-sm" title={deliverySearchValue}>
                      {deliverySearchValue}
                    </div>
                  </div>
                  {routeInfo && (
                    <React.Fragment key="routeInfo">
                      <div key="distance" className="bg-[#202020] rounded-lg p-3">
                        <div className="text-[#404040] text-sm mb-1">Mesafe</div>
                        <div className="text-white font-medium">{routeInfo.distance}</div>
                      </div>
                      <div key="duration" className="bg-[#202020] rounded-lg p-3">
                        <div className="text-[#404040] text-sm mb-1">Tahmini Süre</div>
                        <div className="text-white font-medium">{routeInfo.duration}</div>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Fiyat Teklifi</h3>
                <FiyatDetaylari routeInfo={routeInfo} toplamFiyat={toplamFiyat} />
                <button
                  type="button"
                  onClick={async () => {
                    const result = await calculateTotalPrice({
                      pickupLocation,
                      deliveryLocation,
                      pickupOtopark,
                      deliveryOtopark,
                      araclar,
                      fiyatlandirma,
                      sehirFiyatlandirma,
                      deliverySehirFiyatlandirma,
                      kmBasedFees
                    }, true);
                    setToplamFiyat(result.totalPrice);
                    setRoutes(result.routes);
                  }}
                  className="mt-4 w-full py-2 px-4 bg-[#202020] text-[#404040] font-medium rounded-lg hover:bg-[#303030] hover:text-white transition-colors"
                >
                  Fiyat Hesaplama Detaylarını Göster
                </button>
              </div>

              {isLoaded && (
                <div key="map" style={mapStyles} className="relative mt-2">
                  <GoogleMap
                    mapContainerStyle={mapStyles}
                    center={
                      pickupLocation && deliveryLocation
                        ? {
                            lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
                            lng: (pickupLocation.lng + deliveryLocation.lng) / 2
                          }
                        : { lat: 41.0082, lng: 28.9784 }
                    }
                    zoom={13}
                    options={mapOptions}
                  >
                    {pickupLocation && <Marker key="pickup" position={pickupLocation} clickable={false} />}
                    {deliveryLocation && <Marker key="delivery" position={deliveryLocation} clickable={false} />}
                    {routes && routes.map((route, index) => {
                      const path = route.directions?.routes?.[0]?.overview_path;
                      if (!path) return null;
                      return (
                        <Polyline
                          key={`polyline-${index}`}
                          path={path}
                          options={{
                            strokeColor: route.color,
                            strokeWeight: 5,
                            strokeOpacity: 0.8
                          }}
                        />
                      );
                    })}
                  </GoogleMap>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Devam Et
                </button>
              </div>
            </div>
          ) : step === 4 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040] mb-4">
                <h3 className="text-lg font-semibold text-white mb-4">Müşteri Tipi</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMusteriBilgileri({ ...musteriBilgileri, musteriTipi: 'kisisel' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      musteriBilgileri.musteriTipi === 'kisisel'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#202020] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Kişisel</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusteriBilgileri({ ...musteriBilgileri, musteriTipi: 'kurumsal' })}
                    className={`p-3 rounded-lg border transition-colors ${
                      musteriBilgileri.musteriTipi === 'kurumsal'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                        : 'bg-[#202020] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Kurumsal</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {musteriBilgileri.musteriTipi === 'kurumsal' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Firma Adı
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.firmaAdi}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, firmaAdi: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Firma Adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Vergi Numarası
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.vergiNo}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, vergiNo: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Vergi Numarası"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Vergi Dairesi
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.vergiDairesi}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, vergiDairesi: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Vergi Dairesi"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Ad
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.ad}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, ad: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#404040] mb-2">
                        Soyad
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.soyad}
                        onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, soyad: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Soyadınız"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-[#404040]">
                            Kimlik Bilgileri
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="tcVatandasi"
                              checked={musteriBilgileri.tcVatandasi}
                              onChange={(e) => {
                                const newTcVatandasi = e.target.checked;
                                setMusteriBilgileri({
                                  ...musteriBilgileri,
                                  tcVatandasi: newTcVatandasi,
                                  tcKimlik: newTcVatandasi ? '' : '11111111111'
                                });
                              }}
                              className="w-4 h-4 rounded border-[#404040] bg-[#141414] text-yellow-500 focus:ring-yellow-500 focus:ring-offset-[#141414]"
                            />
                            <label htmlFor="tcVatandasi" className="text-sm text-[#404040]">
                              TC Vatandaşıyım
                            </label>
                          </div>
                        </div>
                        {musteriBilgileri.tcVatandasi ? (
                          <input
                            type="text"
                            value={musteriBilgileri.tcKimlik}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                              setMusteriBilgileri({ ...musteriBilgileri, tcKimlik: value });
                            }}
                            required
                            maxLength={11}
                            className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="TC Kimlik No"
                          />
                        ) : (
                          <div className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-[#404040]">
                            Yabancı Uyruklu
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={musteriBilgileri.telefon}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setMusteriBilgileri({ ...musteriBilgileri, telefon: value });
                    }}
                    required
                    maxLength={11}
                    className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={musteriBilgileri.email}
                    onChange={(e) => setMusteriBilgileri({ ...musteriBilgileri, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Lütfen Bekleyin...' : 'Siparişi Onayla'}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-[#404040]">
                  Siparişi Onayla butonuna tıkladığınızda{' '}
                  <a href="/kvkk" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">KVKK</a>,{' '}
                  <a href="/acik-riza" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Açık Rıza Metni</a>,{' '}
                  <a href="/aydinlatma" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Aydınlatma Metni</a> ve{' '}
                  <a href="/sorumluluk-reddi" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Sorumluluk Reddi Beyanı</a> metinlerini okuduğunuzu ve onayladığınızı taahhüt etmiş sayılırsınız.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Sipariş Tamamlandı</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Talep Numarası</div>
                    <div className="text-2xl font-bold text-yellow-500">{pnrNumber}</div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {toplamFiyat.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#404040] text-sm mb-1">Ödeme Bilgileri</div>
                    <div className="space-y-2">
                      <div className="text-white">
                        <span className="font-medium">Banka:</span> Garanti Bankası
                      </div>
                      <div className="text-white">
                        <span className="font-medium">IBAN:</span> TR12 3456 7890 1234 5678 9012 34
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Hesap Sahibi:</span> Çekgetir A.Ş.
                      </div>
                      <div className="text-[#404040] text-sm mt-2">
                        * Ödemenizi yaptıktan sonra dekontunuzu Talep numaranız ile birlikte info@cekgetir.com adresine göndermeniz gerekmektedir.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = `/pnr-sorgula?pnr=${pnrNumber}`;
                  }}
                  className="px-6 py-3 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Tamam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 