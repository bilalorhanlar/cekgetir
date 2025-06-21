'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'
import dynamic from "next/dynamic";
import LocationAutocomplete from '@/components/LocationAutocomplete';
import KvkkModal from '@/components/sozlesmeler/kvkk';
import AcikRizaModal from '@/components/sozlesmeler/acikriza';
import AydinlatmaModal from '@/components/sozlesmeler/aydinlatma';
import SorumlulukReddiModal from '@/components/sozlesmeler/sorumlulukreddi';

const libraries = ['places']
// Leaflet'i SSR olmadan sadece client'ta render etmek için
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

// LocationPicker bileşenini dinamik olarak import et
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
});


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
    .replace("I", 'i')
    .replace("İ", 'i')
    .replace("ı", 'i')
    .replace("ğ", 'g')
    .replace("ü", 'u')
    .replace("ş", 's')
    .replace("ö", 'o')
    .replace("ç", 'c')
}

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
    musteriTipi: 'kisisel',
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
  const [sehir, setSehir] = useState(null)
  const [sehir2, setSehir2] = useState(null)
  const [wayPoints, setWayPoints] = useState([])
  const [wayPointsKm, setWayPointsKm] = useState([])
  const [detectedBridges, setDetectedBridges] = useState([])
  const [bridgeFees, setBridgeFees] = useState(0)
  const [isPickupMapSelected, setIsPickupMapSelected] = useState(false)
  const [isDeliveryMapSelected, setIsDeliveryMapSelected] = useState(false)
  const [isKvkkOpen, setIsKvkkOpen] = useState(false)
  const [isAcikRizaOpen, setIsAcikRizaOpen] = useState(false);
  const [isAydinlatmaOpen, setIsAydinlatmaOpen] = useState(false);
  const [isSorumlulukReddiOpen, setIsSorumlulukReddiOpen] = useState(false);

  const getCity = () => {
    console.log('sehaasdasdasdir', sehir);
    return sehir;
  }
  const getCity2 = () => {
    console.log('sehaasdasdasdir2', sehir2);
    return sehir2;
  }

  const setSelectedCityPickup = (selected) => {
    console.log('selected', selected);
    const selectedCity = selected.target.value;
    
    // Check if the same city is selected for both pickup and delivery
    if (selectedCity && selectedCity === selectedDeliveryCity) {
      // Reset all inputs
      setSelectedPickupCity('');
      setSelectedDeliveryCity('');
      setSehir(null);
      setSehir2(null);
      setSehirFiyatlandirma(null);
      setDeliverySehirFiyatlandirma(null);
      setPickupLocation(null);
      setDeliveryLocation(null);
      setPickupSearchValue('');
      setDeliverySearchValue('');
      setPickupOtopark(false);
      setDeliveryOtopark(false);
      
      // Show error message
      toast.error('Lütfen farklı 2 il giriniz');
      return;
    }
    
    setSelectedPickupCity(selectedCity);
    setSehir(selectedCity);
  }

  const setSelectedCityDelivery = (selected) => {
    const selectedCity = selected.target.value;
    
    // Check if the same city is selected for both pickup and delivery
    if (selectedCity && selectedCity === selectedPickupCity) {
      // Reset all inputs
      setSelectedPickupCity('');
      setSelectedDeliveryCity('');
      setSehir(null);
      setSehir2(null);
      setSehirFiyatlandirma(null);
      setDeliverySehirFiyatlandirma(null);
      setPickupLocation(null);
      setDeliveryLocation(null);
      setPickupSearchValue('');
      setDeliverySearchValue('');
      setPickupOtopark(false);
      setDeliveryOtopark(false);
      
      // Show error message
      toast.error('Lütfen farklı 2 il giriniz');
      return;
    }
    
    setSelectedDeliveryCity(selectedCity);
    setSehir2(selectedCity);
  }

  const setRouteInfoHandle = (distance, duration, wayPointsKm, detectedBridges, bridgeFees) => {
    let routeInfo = {}
    routeInfo.distance = distance;
    routeInfo.duration = duration;
    routeInfo.wayPointsKm = []
    for (let i = 0; i < wayPointsKm.length; i++) {
      routeInfo.wayPointsKm.push(wayPointsKm[i])
    }
    setRouteInfo(routeInfo);
    setDetectedBridges(detectedBridges || []);
    setBridgeFees(bridgeFees || 0);
    console.log('routeInfodd', routeInfo, getRouteInfo())
    console.log('detectedBridges', detectedBridges)
  }

  const getRouteInfo = () => {
    return routeInfo;
  }
  const getWayPoints = () => {
    return wayPoints;
  }

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

  const normalizeSehirAdi = (sehir) => {
    return sehir
      .replace("I", 'i')
      .replace("İ", 'i')
      .replace("ı", 'i')
      .replace("ğ", 'g')
      .replace("ü", 'u')
      .replace("ş", 's')
      .replace("ö", 'o')
      .replace("ç", 'c')
  }

  // Rota hesaplama fonksiyonu
  const addWaypoints = useCallback(async () => {
    console.log('🔍 addWaypoints called with:', {
      pickupLocation: pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng, address: pickupLocation.address } : null,
      deliveryLocation: deliveryLocation ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng, address: deliveryLocation.address } : null,
      pickupOtopark,
      deliveryOtopark,
      sehir,
      sehir2,
      sehirFiyatlandirma: sehirFiyatlandirma ? sehirFiyatlandirma.sehirAdi : null,
      deliverySehirFiyatlandirma: deliverySehirFiyatlandirma ? deliverySehirFiyatlandirma.sehirAdi : null,
      fiyatlandirmaSehirler: fiyatlandirma?.sehirler?.length || 0
    });

    if (!pickupLocation || !deliveryLocation || !fiyatlandirma?.sehirler) {
      console.log('❌ Missing required data for waypoints');
      console.log('- pickupLocation:', !!pickupLocation);
      console.log('- deliveryLocation:', !!deliveryLocation);
      console.log('- fiyatlandirma.sehirler:', !!fiyatlandirma?.sehirler);
      return;
    }

    try {
      const newWayPoints = [];
      
      // 1. Konum -> Otopark rotası (Alınacak konum)
      if (!pickupOtopark && pickupLocation) {
        console.log('✅ Adding pickup location waypoint');
        newWayPoints.push({
          lat: Number(pickupLocation.lat),
          lng: Number(pickupLocation.lng),
          address: pickupLocation.address,
          name: "pickupLocation"
        });
      } else if (pickupOtopark) {
        console.log('ℹ️ Pickup is from otopark, skipping pickup location waypoint');
      }

      // 2. Otopark -> Otopark rotası (Toplu Çekici)
      if (sehir && sehir2) {
        console.log('🔍 Looking for pickup city:', sehir);
        // Alınacak şehir otoparkı
        const pickupSehirFiyatlandirma = fiyatlandirma.sehirler.find(s => 
          normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizeSehirAdi(sehir).toLowerCase()
        );
        
        if (pickupSehirFiyatlandirma) {
          console.log('✅ Adding pickup otopark waypoint:', pickupSehirFiyatlandirma.otoparkAdres);
          newWayPoints.push({
            lat: Number(pickupSehirFiyatlandirma.otoparkLat),
            lng: Number(pickupSehirFiyatlandirma.otoparkLng),
            address: pickupSehirFiyatlandirma.otoparkAdres,
            name: "pickupOtoparkLocation"
          });
        } else {
          console.log('❌ Pickup city not found in fiyatlandirma:', sehir);
        }

        console.log('🔍 Looking for delivery city:', sehir2);
        // Teslim edilecek şehir otoparkı
        const deliverySehirFiyatlandirma = fiyatlandirma.sehirler.find(s => 
          normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizeSehirAdi(sehir2).toLowerCase()
        );
        
        if (deliverySehirFiyatlandirma) {
          console.log('✅ Adding delivery otopark waypoint:', deliverySehirFiyatlandirma.otoparkAdres);
          newWayPoints.push({
            lat: Number(deliverySehirFiyatlandirma.otoparkLat),
            lng: Number(deliverySehirFiyatlandirma.otoparkLng),
            address: deliverySehirFiyatlandirma.otoparkAdres,
            name: "deliveryOtoparkLocation"
          });
        } else {
          console.log('❌ Delivery city not found in fiyatlandirma:', sehir2);
        }
      } else {
        console.log('ℹ️ Missing city information:', { sehir, sehir2 });
      }

      // 3. Otopark -> Konum rotası (Teslim edilecek konum)
      if (!deliveryOtopark && deliveryLocation) {
        console.log('✅ Adding delivery location waypoint');
        newWayPoints.push({
          lat: Number(deliveryLocation.lat),
          lng: Number(deliveryLocation.lng),
          address: deliveryLocation.address,
          name: "deliveryLocation"
        });
      } else if (deliveryOtopark) {
        console.log('ℹ️ Delivery is to otopark, skipping delivery location waypoint');
      }

      console.log('📊 Total waypoints created:', newWayPoints.length);
      console.log('📍 Waypoints:', newWayPoints.map(wp => ({ name: wp.name, lat: wp.lat, lng: wp.lng })));

      // En az 2 waypoint olmalı
      if (newWayPoints.length < 2) {
        console.log('❌ Not enough waypoints created:', newWayPoints.length);
        setWayPoints([]);
        return;
      }

      // State'i güncelle
      setWayPoints(newWayPoints);
      console.log('✅ Waypoints updated successfully');

    } catch (error) {
      console.error('❌ Waypoints oluşturma hatası:', error);
      toast.error('Rota oluşturulurken bir hata oluştu.');
      setWayPoints([]);
    }
  }, [pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, sehirFiyatlandirma, deliverySehirFiyatlandirma, fiyatlandirma, sehir, sehir2]);

  // Konumlar değiştiğinde waypoints'i güncelle
  useEffect(() => {
    console.log('🔄 useEffect triggered for waypoints:', {
      pickupLocation: pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng, address: pickupLocation.address } : null,
      deliveryLocation: deliveryLocation ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng, address: deliveryLocation.address } : null,
      sehir,
      sehir2,
      fiyatlandirmaSehirler: fiyatlandirma?.sehirler?.length || 0,
      pickupOtopark,
      deliveryOtopark
    });
    
    if (pickupLocation && deliveryLocation && fiyatlandirma?.sehirler?.length > 0) {
      console.log('✅ All required data available, calling addWaypoints');
      addWaypoints();
    } else {
      console.log('❌ Missing required data, clearing waypoints');
      console.log('- pickupLocation:', !!pickupLocation);
      console.log('- deliveryLocation:', !!deliveryLocation);
      console.log('- fiyatlandirma.sehirler.length:', fiyatlandirma?.sehirler?.length || 0);
      // Gerekli veriler yoksa waypoints'i temizle
      setWayPoints([]);
    }
  }, [pickupLocation, deliveryLocation, sehir, sehir2, fiyatlandirma, pickupOtopark, deliveryOtopark, addWaypoints]);

  // Şehir değerleri değiştiğinde waypoints'i güncelle
  useEffect(() => {
    console.log('🏙️ City values changed:', { sehir, sehir2 });
    if (pickupLocation && deliveryLocation && sehir && sehir2 && fiyatlandirma?.sehirler?.length > 0) {
      console.log('✅ Cities detected, updating waypoints');
      addWaypoints();
    }
  }, [sehir, sehir2, pickupLocation, deliveryLocation, fiyatlandirma, addWaypoints]);

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
    const loc = normalizeLocation({lat: location.lat, lng: location.lng, address: location.address});
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
    input.routeInfo = getRouteInfo();

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
        console.log('Tespit Edilen Köprüler:', detectedBridges);
        console.log('Köprü Ücretiiilililili:', bridgeFees);
        console.log('-------------------');
      }

      // Check if routeInfo exists and has wayPointsKm
      if (!input.routeInfo || !input.routeInfo.wayPointsKm) {
        console.warn('Route info or wayPointsKm is missing, cannot calculate price');
        return { totalPrice: 0 };
      }
      
      let totalPrice = 0;
      let index = 0;
      // 1. Aşama: Konum -> Otopark (Alınacak şehir)
      console.log('input.routeInfo.wayPointsKm', input.routeInfo.wayPointsKm);
      if (!input.pickupOtopark && input.pickupLocation && input.sehirFiyatlandirma) {
        const sehirAdi = typeof input.sehirFiyatlandirma === 'object' ? input.sehirFiyatlandirma.sehirAdi : input.sehirFiyatlandirma;
        const response = await api.get(`/api/variables/toplu-cekici/sehirler/${sehirAdi}`);
        let sehirFiyatlandirma = response.data;
        let pikcupkm = input.routeInfo.wayPointsKm[index];
        let pickupOtoparkBasePrice = Number(sehirFiyatlandirma.basePrice);
        let pickupOtoparkKmPrice = Number(sehirFiyatlandirma.basePricePerKm);
        let pickupOtoparkPrice = pickupOtoparkBasePrice + (pikcupkm * pickupOtoparkKmPrice);
        // 1.aşama fiyatı
        console.log('1.aşama yazdır')
        console.log('sehirFiyatlandirma', sehirFiyatlandirma)
        console.log('pikcupkm', pikcupkm)
        console.log('pickupOtoparkBasePrice', pickupOtoparkBasePrice)
        console.log('pickupOtoparkKmPrice', pickupOtoparkKmPrice)
        console.log('pickupOtoparkPrice', pickupOtoparkPrice)
        totalPrice += pickupOtoparkPrice;
        console.log('totalPrice', totalPrice)
        console.log('--------------------------------')
        index++;
      }

      // 2. Aşama: Otopark -> Otopark (Toplu Çekici)
      if (input.sehirFiyatlandirma && input.deliverySehirFiyatlandirma && input.fiyatlandirma) {
        let otoparkToOtoparkKm = input.routeInfo.wayPointsKm[index];
        const kmBasedPrice = getKmBasedPrice(otoparkToOtoparkKm, input.kmBasedFees);
        const otoparkToOtoparkPrice = Number(input.fiyatlandirma.basePrice) + (otoparkToOtoparkKm * kmBasedPrice);
        totalPrice += otoparkToOtoparkPrice;
        console.log('2.aşama yazdır')
        console.log('fiyatlandirma', input.fiyatlandirma)
        console.log('otoparkToOtoparkKm', otoparkToOtoparkKm)
        console.log('kmBasedPrice', kmBasedPrice)
        console.log('otoparkToOtoparkPrice', otoparkToOtoparkPrice)
        console.log('totalPrice', totalPrice)
        console.log('--------------------------------')
        index++;
      }
      showDebug = true;
      // 3. Aşama: Otopark -> Konum (Teslim edilecek şehir)
      if (!input.deliveryOtopark && input.deliveryLocation && input.deliverySehirFiyatlandirma) {
        const sehirAdi = typeof input.deliverySehirFiyatlandirma === 'object' ? input.deliverySehirFiyatlandirma.sehirAdi : input.deliverySehirFiyatlandirma;
        const response = await api.get(`/api/variables/toplu-cekici/sehirler/${sehirAdi}`);
        let deliverySehirFiyatlandirma = response.data;
        let deliveryKm = input.routeInfo.wayPointsKm[index];
        let deliveryOtoparkBasePrice = Number(deliverySehirFiyatlandirma.basePrice);
        let deliveryOtoparkKmPrice = Number(deliverySehirFiyatlandirma.basePricePerKm);
        let deliveryOtoparkPrice = deliveryOtoparkBasePrice + (deliveryKm * deliveryOtoparkKmPrice);
        totalPrice += deliveryOtoparkPrice;
        console.log('3.aşama yazdır')
        console.log('deliverySehirFiyatlandirma', deliverySehirFiyatlandirma)
        console.log('deliveryKm', deliveryKm)
        console.log('deliveryOtoparkBasePrice', deliveryOtoparkBasePrice)
        console.log('deliveryOtoparkKmPrice', deliveryOtoparkKmPrice)
        console.log('deliveryOtoparkPrice', deliveryOtoparkPrice)
        console.log('totalPrice', totalPrice)
        console.log('--------------------------------')
        index++;
      }
      const baseRoutePrice = totalPrice;
      totalPrice = 0; // Her aracı ayrı ayrı toplayacağız
      
      // 4. Aşama: Araç bazlı hesaplama
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
      
        const aracPrice = (baseRoutePrice * segmentMultiplier) + statusMultiplier;
      
        if (showDebug) {
          console.log('- Segment Çarpanı:', segmentMultiplier.toFixed(2));
          console.log('- Durum Ücreti:', statusMultiplier.toFixed(2), 'TL');
          console.log('- Araç Toplam Fiyatı:', aracPrice.toFixed(2), 'TL');
        }
      
        totalPrice += aracPrice;
      
        console.log('aracPrice', aracPrice)
        console.log('totalPrice', totalPrice)
        console.log('--------------------------------')
      }
      
      // 5. Aşama: KDV Hesaplama
      const kdvOrani = 0.20; // %20 KDV
      const kdvTutari = totalPrice * kdvOrani;
      totalPrice += kdvTutari;

      // 6. Aşama: Köprü Ücreti Hesaplama
      const totalBridgeFee = bridgeFees; // MapComponent'ten gelen bridgeFees kullanılıyor
      totalPrice += totalBridgeFee;

      if (showDebug) {
        console.log('\n5️⃣ KDV Hesaplama:');
        console.log('- KDV Oranı:', (kdvOrani * 100).toFixed(0) + '%');
        console.log('- KDV Tutarı:', kdvTutari.toFixed(2), 'TL');
        console.log('\n6️⃣ Köprü Ücreti:');
        console.log('- Tespit Edilen Köprüler:', detectedBridges);
        console.log('- Köprü Sayısı:', detectedBridges.length);
        console.log('- Toplam Köprü Ücreti:', totalBridgeFee.toFixed(2), 'TL');
        console.log('\n💰 Final Fiyat (KDV ve Köprü Dahil):', totalPrice.toFixed(2), 'TL');
      }

      return { totalPrice: Math.round(totalPrice) };
    } catch (error) {
      console.error('Fiyat hesaplama hatası:', error);
      throw error;
    }
  };


  // Araç listesi değiştiğinde fiyat hesapla
  useEffect(() => {
    if (araclar?.length > 0) {
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
  }, [araclar, calculateTotalPrice, pickupLocation, deliveryLocation, pickupOtopark, deliveryOtopark, araclar, fiyatlandirma, sehirFiyatlandirma, bridgeFees]);


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
        const sehirValueFiyat = fiyatlandirma.sehirler.find(s => s.sehirAdi === city);
        if (sehirValueFiyat) {
          setSearchValue(sehirValueFiyat.otoparkAdres);
          setLocation({
            lat: Number(sehirValueFiyat.otoparkLat),
            lng: Number(sehirValueFiyat.otoparkLng),
            address: sehirValueFiyat.otoparkAdres
          });
          setSehirFiyat(sehirValueFiyat);
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
 
        if ( fiyatlandirma?.sehirler) {

            if (isPickup) {
              const cityName = sehir;
              if (cityName) {
                setSelectedPickupCity(cityName);
                setSehirFiyatlandirma(sehir);
              }
            } else {
              const cityName = sehir2;
              if (cityName) {
                setSelectedDeliveryCity(cityName);
                setDeliverySehirFiyatlandirma(sehir2);
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
    
    // Aynı şehir kontrolü - her iki konum da seçildiğinde
    if (pickupLocation && deliveryLocation) {
      const pickupCity = sehir;
      const deliveryCity = sehir2;
      
      if (pickupCity && deliveryCity && pickupCity === deliveryCity) {
        // Inputları sıfırla
        setPickupLocation(null);
        setDeliveryLocation(null);
        setPickupSearchValue('');
        setDeliverySearchValue('');
        setSelectedPickupCity('');
        setSelectedDeliveryCity('');
        setSehir(null);
        setSehir2(null);
        setSehirFiyatlandirma(null);
        setDeliverySehirFiyatlandirma(null);
        
        // Uyarı göster
        toast.error('Lütfen farklı 2 il giriniz');
        return;
      }
    }
  }, [pickupLocation, deliveryLocation, fiyatlandirma]);

  // Improve geolocation error handling
  const handleCurrentLocation = async (target) => {    
    try {
      const loadingToast = toast.loading('Konumunuz alınıyor...', { id: 'location' });
      
      // Önce konum servislerinin mevcut olup olmadığını kontrol et
      if (!navigator.geolocation) {
        toast.error('Tarayıcınız konum servislerini desteklemiyor.', { id: 'location' });
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Konum alınamadı.';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Konum bilgisi mevcut değil. Lütfen internet bağlantınızı kontrol edin.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Konum alma zaman aşımına uğradı. Lütfen tekrar deneyin.';
                break;
              default:
                errorMessage = 'Konum alınamadı. Lütfen manuel olarak girin.';
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: false, // Daha hızlı sonuç için false yapıyoruz
            timeout: 15000, // Timeout süresini artırıyoruz
            maximumAge: 60000 // 1 dakika önceki konumu kabul ediyoruz
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // OpenCage API yerine Nominatim kullanıyoruz (daha güvenilir)
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`);
      const data = await response.json();
      
      if (!data || !data.address) {
        throw new Error('Adres bilgisi alınamadı');
      }
      
      const address = data.display_name;
      const cityName = data.address.province || data.address.state || data.address.city || "";

      if (target === 'pickup') {
        setSehir(cityName);
        setSelectedPickupCity(cityName);
        const newLocation = normalizeLocation({ lat: latitude, lng: longitude, address: address, sehir: cityName });
        setPickupSearchValue(address);
        setPickupLocation(newLocation);
        
        // Şehir fiyatlandırmasını güncelle
        if (cityName && fiyatlandirma?.sehirler) {
          const normalizedSehir = normalizeSehirAdi(cityName);
          const sehirFiyat = fiyatlandirma.sehirler.find(s => 
            normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
          );
          if (sehirFiyat) {
            setSehirFiyatlandirma(sehirFiyat);
          }
        }
      } else {
        setSehir2(cityName);
        setSelectedDeliveryCity(cityName);
        const newLocation = normalizeLocation({ lat: latitude, lng: longitude, address: address, sehir: cityName });
        setDeliveryLocation(newLocation);
        setDeliverySearchValue(address);
        
        // Şehir fiyatlandırmasını güncelle
        if (cityName && fiyatlandirma?.sehirler) {
          const normalizedSehir = normalizeSehirAdi(cityName);
          const sehirFiyat = fiyatlandirma.sehirler.find(s => 
            normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
          );
          if (sehirFiyat) {
            setDeliverySehirFiyatlandirma(sehirFiyat);
          }
        }
      }
      
      setActiveMapPanel(null);
      toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
    } catch (error) {
      console.error('Konum alınamadı:', error);
      toast.error(error.message || 'Konum alınamadı. Lütfen manuel olarak girin.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Şehir tespiti kontrolü
      let pickupCityDetected = false;
      let deliveryCityDetected = false;
      
      // Alınacak konum için şehir tespiti kontrolü
      if (pickupOtopark) {
        pickupCityDetected = !!selectedPickupCity;
      } else if (pickupLocation) {
        pickupCityDetected = !!sehir;
      }
      
      // Teslim edilecek konum için şehir tespiti kontrolü
      if (deliveryOtopark) {
        deliveryCityDetected = !!selectedDeliveryCity;
      } else if (deliveryLocation) {
        deliveryCityDetected = !!sehir2;
      }
      
      // Şehir tespiti başarısız olan konumlar için uyarı
      if (!pickupCityDetected) {
        toast.error('Alınacak konum için şehir tespit edilemedi. Lütfen konumu tekrar seçin.');
        return;
      }
      
      if (!deliveryCityDetected) {
        toast.error('Teslim edilecek konum için şehir tespit edilemedi. Lütfen konumu tekrar seçin.');
        return;
      }
      
      // Aynı şehir kontrolü
      if (pickupLocation && deliveryLocation) {
        const pickupCity = getCity();
        const deliveryCity = getCity2();
        
        if (pickupCity && deliveryCity && pickupCity === deliveryCity) {
          // Inputları sıfırla
          setPickupLocation(null);
          setDeliveryLocation(null);
          setPickupSearchValue('');
          setDeliverySearchValue('');
          setSelectedPickupCity('');
          setSelectedDeliveryCity('');
          setSehir(null);
          setSehir2(null);
          setSehirFiyatlandirma(null);
          setDeliverySehirFiyatlandirma(null);
          
          // Uyarı göster
          toast.error('Lütfen farklı 2 il giriniz');
          return;
        }
      }
      
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

  const handleMapClick = async (lat, lng, address, sehir, locationType = null) => {
    const newLocation = { lat, lng, address, sehir }

    // locationType parametresi varsa onu kullan, yoksa activeLocation'ı kullan
    const targetLocation = locationType || activeLocation;

    if (targetLocation === 'pickup') {
      const detectedCity = sehir;
      setLocationWithValidation(setPickupLocation, newLocation);
      setPickupSearchValue(address);
      if (detectedCity) {
        setSelectedPickupCity(detectedCity);
      }
    } else if (targetLocation === 'delivery') {
      const detectedCity = sehir;
      setLocationWithValidation(setDeliveryLocation, newLocation);
      setDeliverySearchValue(address);
      if (detectedCity) {
        setSelectedDeliveryCity(detectedCity);
      }
    }
    setActiveMapPanel(null);
  };

  const FiyatDetaylari = ({ routeInfo, toplamFiyat }) => {
    const totalBridgeFee = bridgeFees; // MapComponent'ten gelen bridgeFees kullanılıyor
    
    return (
      <div className="space-y-4">
        <div className="bg-[#202020] rounded-lg p-3">
          <div className="text-[#ebebeb] text-sm mb-1">Toplam Tutar</div>
          <div className="text-2xl font-bold text-yellow-500">
            {toplamFiyat.toLocaleString('tr-TR')} TL
          </div>
        </div>
        {routeInfo && (
          <>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#ebebeb] text-sm mb-1">Mesafe</div>
              <div className="text-white font-medium">{routeInfo.distance} km</div>
            </div>
            <div className="bg-[#202020] rounded-lg p-3">
              <div className="text-[#ebebeb] text-sm mb-1">Tahmini Süre</div>
              <div className="text-white font-medium">{Math.floor((routeInfo.duration + 43) / 60)} saat {(routeInfo.duration % 60)} dk</div>
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
  }, [pickupLocation, deliveryLocation, araclar, sehirFiyatlandirma, deliverySehirFiyatlandirma, fiyatlandirma, pickupOtopark, deliveryOtopark, kmBasedFees, fiyatHesapla, bridgeFees]);

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
                <h3 className="text-lg font-semibold text-white mb-4">Nereden</h3>
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
                        onChange={(e) => setSelectedCityPickup(e)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.sort((a, b) => a.sehirAdi.localeCompare(b.sehirAdi, 'tr-TR')).map((sehir) => (
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
                        {isLoaded && (
                          <div className="w-full">
                            <div className="relative">
                              <LocationAutocomplete
                                value={pickupSearchValue}
                                onChange={e => {
                                  setPickupSearchValue(e.target?.value ?? e.value ?? '');
                                  setIsPickupMapSelected(false); // elle yazınca map seçimi devre dışı
                                }}
                                onInputChange={() => setIsPickupMapSelected(false)}
                                onSelect={({ lat, lng, address }) => {
                                  const newLocation = { lat, lng, address: address || pickupSearchValue };
                                  setPickupLocation(newLocation);
                                  setPickupSearchValue(address || pickupSearchValue);
                                  // Sadece pickup için şehir tespiti yap
                                  const city = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`);
                                  city.then(res => res.json()).then(data => {
                                    const cityData = data;
                                    const cityName = cityData.address?.province || cityData.address?.state || cityData.address?.city || "";
                                    console.log('🔍 Pickup autocomplete - detected city:', cityName);
                                    console.log('🔍 Pickup autocomplete - full address data:', cityData.address);
                                    
                                    if (cityName) {
                                      setSehir(cityName);
                                      setSelectedPickupCity(cityName);
                                      
                                      // Aynı şehir kontrolü
                                      if (cityName === selectedDeliveryCity) {
                                        toast.error('Lütfen farklı 2 il giriniz');
                                        setPickupLocation(null);
                                        setPickupSearchValue('');
                                        setSelectedPickupCity('');
                                        setSehir(null);
                                        setSehirFiyatlandirma(null);
                                        return;
                                      }
                                      
                                      // Şehir fiyatlandırmasını güncelle
                                      if (fiyatlandirma?.sehirler) {
                                        const normalizedSehir = normalizeSehirAdi(cityName);
                                        const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                          normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
                                        );
                                        if (sehirFiyat) {
                                          setSehirFiyatlandirma(sehirFiyat);
                                          console.log('✅ Pickup şehir fiyatlandırması set edildi:', sehirFiyat.sehirAdi);
                                        }
                                      }
                                    }
                                  }).catch(error => {
                                    console.error('❌ Pickup city detection error:', error);
                                  });
                                  setIsPickupMapSelected(true); // autocomplete kapansın
                                }}
                                placeholder="Adres girin veya haritadan seçin"
                                isMapSelected={isPickupMapSelected}
                                inputClassName="w-full py-2.5 px-4 bg-[#121212] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500 shadow-md placeholder-[#404040]"
                                suggestionClassName="bg-[#141414] border border-[#404040] rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto text-white"
                                suggestionItemClassName="px-4 py-3 cursor-pointer hover:bg-yellow-500/10 border-b border-[#404040] last:border-b-0"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 bg-[#141414] z-[101]">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const position = await new Promise((resolve, reject) => {
                                        navigator.geolocation.getCurrentPosition(resolve, reject, { 
                                          enableHighAccuracy: false, 
                                          timeout: 15000, 
                                          maximumAge: 60000 
                                        });
                                      });
                                      const { latitude, longitude } = position.coords;
                                      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`);
                                      const data = await response.json();
                                      const address = data.display_name;
                                      let sehir = data.address?.province || data.address?.state || data.address?.city || "";
                                      setSehir2(sehir);
                                      setSelectedDeliveryCity(sehir);
                                      const newLocation = { lat: latitude, lng: longitude, address: address, sehir: sehir };
                                      setDeliveryLocation(newLocation);
                                      setDeliverySearchValue(address);
                                      setIsDeliveryMapSelected(true);
                                      
                                      // Aynı şehir kontrolü
                                      if (sehir === selectedPickupCity) {
                                        toast.error('Lütfen farklı 2 il giriniz');
                                        setDeliveryLocation(null);
                                        setDeliverySearchValue('');
                                        setSelectedDeliveryCity('');
                                        setSehir2(null);
                                        setDeliverySehirFiyatlandirma(null);
                                        return;
                                      }
                                      
                                      // Şehir fiyatlandırmasını güncelle
                                      if (sehir && fiyatlandirma?.sehirler) {
                                        const normalizedSehir = normalizeSehirAdi(sehir);
                                        const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                          normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
                                        );
                                        if (sehirFiyat) {
                                          setDeliverySehirFiyatlandirma(sehirFiyat);
                                        }
                                      }
                                      toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
                                    } catch (error) {
                                      console.error('Konum alma hatası:', error);
                                      toast.error('Konum izni kontrol edilemedi. Lütfen manuel olarak girin.');
                                    }
                                  }}
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
                          </div>
                        )}
                      </div>
                      {isLoaded && activeMapPanel === 'pickup' && (
                        <div style={mapStyles} className="relative mt-2">
                          <LocationPicker
                            isStartPicker={true}
                            onLocationChange={async (lat, lng, address) => {
                              setActiveLocation('pickup');
                              setPickupLocation({lat: lat, lng: lng, address: address});
                              setPickupSearchValue(address);
                              
                              // Şehir tespiti yap
                              try {
                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`);
                                const data = await response.json();
                                const cityName = data.address?.province || data.address?.state || data.address?.city || "";
                                
                                if (cityName) {
                                  setSehir(cityName);
                                  setSelectedPickupCity(cityName);
                                  
                                  // Aynı şehir kontrolü
                                  if (cityName === selectedDeliveryCity) {
                                    toast.error('Lütfen farklı 2 il giriniz');
                                    setPickupLocation(null);
                                    setPickupSearchValue('');
                                    setSelectedPickupCity('');
                                    setSehir(null);
                                    setSehirFiyatlandirma(null);
                                    setActiveMapPanel(null);
                                    return;
                                  }
                                  
                                  // Şehir fiyatlandırmasını güncelle
                                  if (fiyatlandirma?.sehirler) {
                                    const normalizedSehir = normalizeSehirAdi(cityName);
                                    const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                      normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
                                    );
                                    if (sehirFiyat) {
                                      setSehirFiyatlandirma(sehirFiyat);
                                      console.log('✅ Pickup şehir fiyatlandırması set edildi:', sehirFiyat.sehirAdi);
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Şehir tespiti hatası:', error);
                              }
                              
                              setIsPickupMapSelected(true);
                              setActiveMapPanel(null);
                            }}
                            onCityChange={ (city) => {
                              setSehir(city);
                            }}
                            onCalculateRoute={ () => {}}
                            mapStyles={mapStyles}
                            />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Nereye</h3>
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
                        onChange={(e) => setSelectedCityDelivery(e)}
                        className="w-full py-2.5 px-4 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500"
                      >
                        <option value="">Şehir Seçin</option>
                        {sehirler.sort((a, b) => a.sehirAdi.localeCompare(b.sehirAdi, 'tr-TR')).map((sehir) => (
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
                        {isLoaded && (
                          <div className="w-full">
                            <div className="relative">
                              <LocationAutocomplete
                                value={deliverySearchValue}
                                onChange={e => {
                                  setDeliverySearchValue(e.target?.value ?? e.value ?? '');
                                  setIsDeliveryMapSelected(false); // elle yazınca map seçimi devre dışı
                                }}
                                onInputChange={() => setIsDeliveryMapSelected(false)}
                                onSelect={({ lat, lng, address }) => {
                                  const newLocation = { lat, lng, address: address || deliverySearchValue };
                                  setDeliveryLocation(newLocation);
                                  setDeliverySearchValue(address || deliverySearchValue);
                                  // Sadece delivery için şehir tespiti yap
                                  const city = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                                  city.then(res => res.json()).then(data => {
                                    const cityData = data;
                                    const cityName = cityData.address.province || cityData.address.state || "";
                                    console.log('🔍 Delivery autocomplete - detected city:', cityName);
                                    console.log('🔍 Delivery autocomplete - full address data:', cityData.address);
                                    
                                    if (cityName) {
                                      setSehir2(cityName);
                                      setSelectedDeliveryCity(cityName);
                                      
                                      // Aynı şehir kontrolü
                                      if (cityName === selectedPickupCity) {
                                        toast.error('Lütfen farklı 2 il giriniz');
                                        setDeliveryLocation(null);
                                        setDeliverySearchValue('');
                                        setSelectedDeliveryCity('');
                                        setSehir2(null);
                                        setDeliverySehirFiyatlandirma(null);
                                        return;
                                      }
                                      
                                      // Şehir fiyatlandırmasını güncelle
                                      const normalizedSehir = normalizeSehirAdi(cityName);
                                      const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                        normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
                                      );
                                      if (sehirFiyat) {
                                        setDeliverySehirFiyatlandirma(sehirFiyat);
                                        console.log('✅ Delivery şehir fiyatlandırması set edildi:', sehirFiyat.sehirAdi);
                                      } else {
                                        console.log('❌ Delivery şehir fiyatlandırması bulunamadı:', cityName);
                                        console.log('Mevcut şehirler:', fiyatlandirma.sehirler.map(s => s.sehirAdi));
                                      }
                                    } else {
                                      console.log('❌ Delivery city name not found in address data');
                                    }
                                  }).catch(error => {
                                    console.error('❌ Delivery city detection error:', error);
                                  });
                                  setIsDeliveryMapSelected(true); // autocomplete kapansın
                                }}
                                placeholder="Adres girin veya haritadan seçin"
                                isMapSelected={isDeliveryMapSelected}
                                inputClassName="w-full py-2.5 px-4 bg-[#121212] text-white rounded-lg border border-[#404040] focus:outline-none focus:border-yellow-500 shadow-md placeholder-[#404040]"
                                suggestionClassName="bg-[#141414] border border-[#404040] rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto text-white"
                                suggestionItemClassName="px-4 py-3 cursor-pointer hover:bg-yellow-500/10 border-b border-[#404040] last:border-b-0"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 bg-[#141414] z-[101]">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const position = await new Promise((resolve, reject) => {
                                        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
                                      });
                                      const { latitude, longitude } = position.coords;
                                      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=85e92bcb025e4243b2ad8ccaef8c3593`);
                                      const data = await response.json();
                                      const address = data.results[0].formatted;
                                      let sehir = normalizeSehirAdi(data.results[0].components.province) || normalizeSehirAdi(data.results[0].components.state);
                                      setSehir2(sehir);
                                      const newLocation = { lat: latitude, lng: longitude, address: address, sehir: sehir };
                                      setDeliveryLocation(newLocation);
                                      setDeliverySearchValue(address);
                                      setIsDeliveryMapSelected(true);
                                      // Şehir fiyatlandırmasını güncelle
                                      if (sehir) {
                                        const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                          normalizeSehirAdi(s.sehirAdi).toLowerCase() === sehir.toLowerCase()
                                        );
                                        if (sehirFiyat) {
                                          setDeliverySehirFiyatlandirma(sehirFiyat);
                                        }
                                      }
                                      toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
                                    } catch (error) {
                                      toast.error('Konum izni kontrol edilemedi. Lütfen manuel olarak girin.');
                                    }
                                  }}
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
                          </div>
                        )}
                      </div>
                      {isLoaded && activeMapPanel === 'delivery' && (
                        <div style={mapStyles} className="relative mt-2">
                          <LocationPicker
                            isStartPicker={false}
                            onLocationChange={async (lat, lng, address) => {
                              setActiveLocation('delivery');
                              setDeliveryLocation({lat: lat, lng: lng, address: address});
                              setDeliverySearchValue(address);
                              
                              // Şehir tespiti yap
                              try {
                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`);
                                const data = await response.json();
                                const cityName = data.address?.province || data.address?.state || data.address?.city || "";
                                
                                if (cityName) {
                                  setSehir2(cityName);
                                  setSelectedDeliveryCity(cityName);
                                  
                                  // Aynı şehir kontrolü
                                  if (cityName === selectedPickupCity) {
                                    toast.error('Lütfen farklı 2 il giriniz');
                                    setDeliveryLocation(null);
                                    setDeliverySearchValue('');
                                    setSelectedDeliveryCity('');
                                    setSehir2(null);
                                    setDeliverySehirFiyatlandirma(null);
                                    setActiveMapPanel(null);
                                    return;
                                  }
                                  
                                  // Şehir fiyatlandırmasını güncelle
                                  if (fiyatlandirma?.sehirler) {
                                    const normalizedSehir = normalizeSehirAdi(cityName);
                                    const sehirFiyat = fiyatlandirma.sehirler.find(s => 
                                      normalizeSehirAdi(s.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()
                                    );
                                    if (sehirFiyat) {
                                      setDeliverySehirFiyatlandirma(sehirFiyat);
                                      console.log('✅ Delivery şehir fiyatlandırması set edildi:', sehirFiyat.sehirAdi);
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Şehir tespiti hatası:', error);
                              }
                              
                              setIsDeliveryMapSelected(true);
                              setActiveMapPanel(null);
                            }}
                            onCityChange={ (city) => {
                              setSehir2(city);
                            }}
                          />
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
                onClick={() => {
                  addWaypoints();
                }}
              >
                Devam Et
              </button>
            </form>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Marka</label>
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Model</label>
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Segment</label>
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Yıl</label>
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Plaka</label>
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
                          <label className="block text-[#ebebeb] text-sm mb-1">Durum</label>
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
                      className="w-full py-3 px-4 bg-[#141414] text-[#ebebeb] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors border border-[#404040]"
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
                    <div className="text-[#ebebeb] text-sm mb-1">Nereden</div>
                    <div className="text-white font-medium text-sm" title={pickupSearchValue}>
                      {pickupSearchValue}
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#ebebeb] text-sm mb-1">Nereye</div>
                    <div className="text-white font-medium text-sm" title={deliverySearchValue}>
                      {deliverySearchValue}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Fiyat Teklifi</h3>
                <FiyatDetaylari routeInfo={routeInfo} toplamFiyat={toplamFiyat} />
                <div className="text-xs text-[#404040] mt-1">Fiyatlara KDV dahildir</div>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await calculateTotalPrice({
                      pickupLocation, // Alınacak konum
                      deliveryLocation, // Teslim edilecek konum
                      pickupOtopark, // Alınacak otopark
                      deliveryOtopark, // Teslim edilecek otopark
                      araclar, // Araçlar
                      fiyatlandirma, // Fiyatlandırma
                      sehirFiyatlandirma, // Şehir fiyatlandırma
                      deliverySehirFiyatlandirma, // Teslim şehir fiyatlandırma
                      kmBasedFees, // Km bazlı ücretler
                      detectedBridges // Tespit edilen köprüler
                    }, true);
                    setToplamFiyat(result.totalPrice);
                    setRoutes(result.routes);
                  }}
                  className="mt-4 w-full py-2 px-4 bg-[#202020] text-[#404040] font-medium rounded-lg hover:bg-[#303030] hover:text-white transition-colors"
                >
                  Fiyat Hesaplama Detaylarını Göster
                </button>
              </div>

              {isLoaded && wayPoints && wayPoints.length >= 2 ? (
                <div key="map" style={mapStyles} className="relative mt-2">
                  <MapComponent
                    waypoints={wayPoints}
                    mapStyles={mapStyles}
                    shouldCalculate={true}
                    onValuesChange={(distance, duration, wayPointsKm, detectedBridges, bridgeFees) => {
                      console.log('3232wayPointsKm', wayPointsKm);
                      console.log('detectedBridges', detectedBridges);
                      setRouteInfoHandle(distance, duration, wayPointsKm, detectedBridges, bridgeFees)
                    }}          
                  />
                </div>
              ) : isLoaded && (
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040] mt-2">
                  <div className="text-center text-[#404040]">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    <p className="text-sm">Rota bilgileri yükleniyor...</p>
                    <p className="text-xs mt-1">Konumlar seçildikten sonra harita görünecektir</p>
                    {wayPoints && wayPoints.length > 0 && (
                      <p className="text-xs mt-1 text-yellow-500">
                        Waypoints sayısı: {wayPoints.length} (En az 2 gerekli)
                      </p>
                    )}
                  </div>
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                          <label className="text-sm font-medium text-[#ebebeb]">
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
                            <label htmlFor="tcVatandasi" className="text-sm text-[#ebebeb]">
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
                          <div className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-[#ebebeb]">
                            Yabancı Uyruklu
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                <p className="text-xs text-[#ebebeb]">
                  Siparişi Onayla butonuna tıkladığınızda{' '}
                  <button onClick={() => setIsKvkkOpen(true)} className="text-yellow-500 hover:text-yellow-400 transition-colors">KVKK</button>,{' '}
                  <button onClick={() => setIsAcikRizaOpen(true)} className="text-yellow-500 hover:text-yellow-400 transition-colors">Açık Rıza Metni</button>,{' '}
                  <button onClick={() => setIsAydinlatmaOpen(true)} className="text-yellow-500 hover:text-yellow-400 transition-colors">Aydınlatma Metni</button> ve{' '}
                  <button onClick={() => setIsSorumlulukReddiOpen(true)} className="text-yellow-500 hover:text-yellow-400 transition-colors">Sorumluluk Reddi Beyanı</button> metinlerini okuduğunuzu ve onayladığınızı taahhüt etmiş sayılırsınız.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Sipariş Tamamlandı</h3>
                <div className="space-y-4">
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#ebebeb] text-sm mb-1">Talep Numarası</div>
                    <div className="text-2xl font-bold text-yellow-500">{pnrNumber}</div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#ebebeb] text-sm mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {toplamFiyat.toLocaleString('tr-TR')} TL
                    </div>
                  </div>
                  <div className="bg-[#202020] rounded-lg p-3">
                    <div className="text-[#ebebeb] text-sm mb-1">Ödeme Bilgileri</div>
                    <div className="space-y-2">
                      <div className="text-white">
                        <span className="font-medium">Banka:</span> QNB Finansbank
                      </div>
                      <div className="text-white">
                        <span className="font-medium">IBAN:</span> TR65 0011 1000 0000 0098 6222 45
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Hesap Sahibi:</span> Ömer KAYA
                      </div>
                      <div className="text-[#ebebeb] text-sm mt-2">
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
      <KvkkModal isOpen={isKvkkOpen} onClose={() => setIsKvkkOpen(false)} />
      <AcikRizaModal isOpen={isAcikRizaOpen} onClose={() => setIsAcikRizaOpen(false)} />
      <AydinlatmaModal isOpen={isAydinlatmaOpen} onClose={() => setIsAydinlatmaOpen(false)} />
      <SorumlulukReddiModal isOpen={isSorumlulukReddiOpen} onClose={() => setIsSorumlulukReddiOpen(false)} />
    </div>
  )
} 