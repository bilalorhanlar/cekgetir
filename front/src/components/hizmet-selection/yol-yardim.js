'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import dynamic from "next/dynamic";
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AcikRizaModal from '@/components/sozlesmeler/acikriza';
import AydinlatmaModal from '@/components/sozlesmeler/aydinlatma';
import KvkkModal from '@/components/sozlesmeler/kvkk';
import SorumlulukReddiModal from '@/components/sozlesmeler/sorumlulukreddi';

// LocationPicker bileşenini dinamik olarak import et
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
});

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

const libraries = ['places']

const mapStyles = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
  border: '1px solid rgba(64, 64, 64, 0.4)'
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true
}

export default function YolYardimModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [fiyatlandirma, setFiyatlandirma] = useState({
    basePrice: 0,
    basePricePerKm: 0,
    nightPrice: 1.5,
    baseLat: 40.9877,
    baseLng: 29.1267,
    arizaTipleri: {},
    segmentler: []
  })

  const [pnrNumber, setPnrNumber] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [araclar, setAraclar] = useState([])
  const [musteriBilgileri, setMusteriBilgileri] = useState({
    musteriTipi: 'kisisel',
    ad: '',
    soyad: '',
    tcVatandasi: true,
    tcKimlik: '',
    telefon: '',
    email: '',
    firmaAdi: '',
    vergiNo: '',
    vergiDairesi: ''
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
  const [selectedAriza, setSelectedAriza] = useState(null)
  const [aracBilgileri, setAracBilgileri] = useState({
    marka: '',
    model: '',
    yil: '',
    plaka: '',
    tip: '',
    condition: ''
  })
  const [price, setPrice] = useState(null)
  const [directions, setDirections] = useState(null)
  const [showMap, setShowMap] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [location, setLocation] = useState(null)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [predictions, setPredictions] = useState([])
  const autocompleteService = useRef(null)
  const mapRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationSearchValue, setLocationSearchValue] = useState('')
  const [sehir, setSehir] = useState(null)
  const [isMapSelected, setIsMapSelected] = useState(false)
  const [activeMapPanel, setActiveMapPanel] = useState(null)
  const [isAcikRizaOpen, setIsAcikRizaOpen] = useState(false);
  const [isAydinlatmaOpen, setIsAydinlatmaOpen] = useState(false);
  const [isKvkkOpen, setIsKvkkOpen] = useState(false);
  const [isSorumlulukReddiOpen, setIsSorumlulukReddiOpen] = useState(false);
  
  // Şehir adını normalize eden fonksiyon
  function normalizeSehirAdi(sehir) {
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

  const getCity = () => {
    return sehir;
  }
  
  // MapComponent için memoized location objeler
  const memoizedOriginLocation = useMemo(() => 
    fiyatlandirma ? { lat: fiyatlandirma.baseLat, lng: fiyatlandirma.baseLng } : null, 
    [fiyatlandirma?.baseLat, fiyatlandirma?.baseLng]
  )
  
  const memoizedEndLocation = useMemo(() => 
    location ? { lat: location.lat, lng: location.lng } : null, 
    [location?.lat, location?.lng]
  )

  // MapComponent için memoized callback
  const handleValuesChange = useCallback((distance, duration) => {
    setRouteInfo(prev => ({
      ...prev,
      distance,
      duration
    }))
  }, [])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
  }, [isLoaded])

  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 22 || currentHour < 8;

  // Fiyat hesaplama fonksiyonu
  const fiyatHesapla = useCallback(() => {
    if (!location || !aracBilgileri.tip || !selectedAriza || !routeInfo) {
      setPrice(0);
      return 0;
    }

    // Temel değerler
    const basePrice = Number(fiyatlandirma?.basePrice) || 0;
    const basePricePerKm = Number(fiyatlandirma?.basePricePerKm) || 0;
    const distance = routeInfo?.distance || 0;
    const nightPrice = Number(fiyatlandirma?.nightPrice) || 1.5;

    // Segment bilgileri
    const segmentObj = fiyatlandirma?.segmentler?.find(seg => String(seg.id) === String(aracBilgileri.tip));
    const segmentMultiplier = segmentObj ? Number(segmentObj.price) : 1;

    // Arıza ücreti
    const arizaFiyat = fiyatlandirma?.arizaTipleri?.[selectedAriza.id]?.price || 0;

    // Ara toplam hesaplama (arıza ücreti toplama olarak ekleniyor)
    const baseTotal = basePrice + (distance * basePricePerKm) + arizaFiyat;

    // Segment çarpanı uygulaması
    const segmentTotal = baseTotal * segmentMultiplier;

    const kdv = segmentTotal * 0.2;

    const finalPrice = (isNightTime ? segmentTotal * nightPrice : segmentTotal) + kdv;

    // Sadece fiyat değiştiğinde log at
    if (price !== Math.round(finalPrice)) {
      console.log('Fiyat Hesaplama Detayları:', {
        basePrice,
        basePricePerKm,
        distance,
        nightPrice,
        segmentMultiplier,
        arizaFiyat,
        baseTotal,
        segmentTotal,
        isNightTime,
        kdv,
        finalPrice
      });
    }

    setPrice(Math.round(finalPrice));
    return Math.round(finalPrice);
  }, [fiyatlandirma, location, aracBilgileri.tip, selectedAriza, routeInfo, isNightTime, price]);

  // Fiyat hesaplamayı useEffect ile tetikle
  useEffect(() => {
    if (location && aracBilgileri.tip && selectedAriza && routeInfo) {
      const newPrice = fiyatHesapla();
      // Sadece fiyat değiştiğinde state'i güncelle
      if (newPrice !== price) {
        setPrice(newPrice);
      }
    }
  }, [location, aracBilgileri.tip, selectedAriza, routeInfo, fiyatHesapla, price]);

  // Fiyat detaylarını göster
  const renderPriceDetails = () => {
    if (!price || !routeInfo) return null;

    return (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-[#202020] rounded-lg p-3 flex flex-col gap-1 col-span-2">
            <span className="text-xs text-white/60">Araç</span>
            <span className="font-semibold text-white">{aracBilgileri.marka} {aracBilgileri.model}</span>
          </div>
          <div className="bg-[#202020] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-white/60">Plaka</span>
            <span className="font-semibold text-white">{aracBilgileri.plaka}</span>
          </div>
          <div className="bg-[#202020] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-white/60">Arıza Tipi</span>
            <span className="font-semibold text-white">{selectedAriza.title}</span>
          </div>
          <div className="bg-[#202020] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-white/60">Mesafe</span>
            <span className="font-semibold text-yellow-500">{routeInfo.distance.toFixed(1)} km</span>
          </div>
          <div className="bg-[#202020] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-white/60">Süre</span>
            <span className="font-semibold text-yellow-500">{Math.round(routeInfo.duration)} dk</span>
          </div>

        </div>
        <div className="border-t border-[#404040] pt-3 mt-2 flex items-center justify-between">
          <span className="text-base font-semibold text-white">Toplam</span>
          <span className="text-lg font-bold text-yellow-500">{price.toLocaleString('tr-TR')} TL</span>
        </div>
      </div>
    );
  };

  // Fiyat teklifi bölümünü güncelle
  const renderPriceOffer = () => (
    <div className="bg-[#141414] rounded-lg p-4 sm:p-4 px-2 py-2 border border-[#404040]">
      {renderPriceDetails()}
      {isNightTime && (
        <div className="text-xs text-center text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded w-full">
          Gece Tarifesi • Önerilen (08:00 - 22:00)
        </div>
      )}
      <div className="text-[10px] sm:text-xs text-[#404040] text-right mt-1">Fiyatlara KDV dahildir</div>
    </div>
  );

  // Rota hesaplama fonksiyonu
  const calculateRoute = useCallback(async (destination) => {
    if (!fiyatlandirma || !window.google) {
      return;
    }
    
    const origin = memoizedOriginLocation;

    // Eğer mevcut rota bilgisi varsa ve aynı hedef için hesaplanmışsa, tekrar hesaplama
    if (routeInfo && 
        routeInfo.destination?.lat === destination.lat && 
        routeInfo.destination?.lng === destination.lng) {
      return;
    }
    
    const directionsService = new window.google.maps.DirectionsService();
    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(destination.lat, destination.lng),
      travelMode: window.google.maps.TravelMode.DRIVING
    };
    
    try {
      const result = await new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      const route = result.routes[0];
      const distance = route.legs[0].distance.value / 1000; // km
      const duration = (route.legs[0].duration.value / 60) + 15; // dk
      
      setDirections(result);
      setRouteInfo({
        distance,
        duration,
        destination: destination,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.instructions,
          distance: step.distance.text,
          duration: step.duration.text
        }))
      });
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      setError('Rota hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [fiyatlandirma, routeInfo, memoizedOriginLocation]);

  // Konumlar değiştiğinde fiyat hesapla
  useEffect(() => {
    if (location && aracBilgileri.tip && selectedAriza) {
      const shouldCalculateRoute = !routeInfo || 
        routeInfo.destination?.lat !== location.lat || 
        routeInfo.destination?.lng !== location.lng;
      
//      if (shouldCalculateRoute) {
//        calculateRoute(location);
//      }
    }
  }, [location, aracBilgileri.tip, selectedAriza, calculateRoute, routeInfo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [variablesResponse, carSegmentsResponse, carStatusesResponse, vehicleResponse] = await Promise.all([
          api.get('/api/variables/yol-yardim'),
          api.get('/api/variables/car-segments?type=yol-yardim'),
          api.get('/api/variables/car-statuses?type=yol-yardim'),
          axios.get('/data/arac-info.json')
        ]);

        // Değişkenleri ayarla
        const yolYardimData = variablesResponse.data || {
          basePrice: 0,
          basePricePerKm: 0,
          nightPrice: 1.5,
          baseLat: 40.9877,
          baseLng: 29.1267
        };

        setFiyatlandirma({
          basePrice: yolYardimData.basePrice,
          basePricePerKm: yolYardimData.basePricePerKm,
          nightPrice: yolYardimData.nightPrice,
          baseLat: yolYardimData.baseLat,
          baseLng: yolYardimData.baseLng,
          arizaTipleri: carStatusesResponse.data.reduce((acc, status) => {
            acc[status.id] = {
              name: status.name,
              price: status.price
            };
            return acc;
          }, {}),
          segmentler: carSegmentsResponse.data.map(segment => ({
            id: segment.id,
            name: segment.name,
            price: segment.price
          }))
        });

        // Araç bilgilerini ayarla
        setVehicleData({
          aracMarkalari: vehicleResponse.data.aracMarkalari,
          aracModelleri: vehicleResponse.data.aracModelleri,
          yillar: vehicleResponse.data.yillar,
          segmentler: carSegmentsResponse.data
        });

      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu.');
        // Set default values in case of error
        setFiyatlandirma({
          basePrice: 0,
          basePricePerKm: 0,
          nightPrice: 1.5,
          baseLat: 40.9877,
          baseLng: 29.1267,
          arizaTipleri: {},
          segmentler: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array since we only want to fetch once on mount

  // İstanbul sınırları kontrolü
  const isWithinIstanbul = (lat, lng) => {
    // İstanbul'un yaklaşık sınırları
    const istanbulBounds = {
      north: 41.5,  // Kuzey sınırı
      south: 40.8,  // Güney sınırı
      east: 29.5,   // Doğu sınırı
      west: 28.4    // Batı sınırı
    };
    
    return lat >= istanbulBounds.south && 
           lat <= istanbulBounds.north && 
           lng >= istanbulBounds.west && 
           lng <= istanbulBounds.east;
  };

  // Konumdan adres reverse geocode için
  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return ''
    
    // İstanbul sınırları kontrolü
    if (!isWithinIstanbul(lat, lng)) {
      toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.');
      setLocation(null);
      setSearchValue('');
      setIsMapSelected(false);
      setSehir(null);
      return '';
    }

    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          // Adresin İstanbul'da olup olmadığını kontrol et
          const addressComponents = results[0].address_components;
          const isIstanbul = addressComponents.some(component => 
            component.types.includes('administrative_area_level_1') && 
            component.long_name.toLowerCase().includes('istanbul')
          );

          if (!isIstanbul) {
            toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.');
            setLocation(null);
            setSearchValue('');
            setIsMapSelected(false);
            setSehir(null);
            resolve('');
            return;
          }

          resolve(results[0].formatted_address)
        } else {
          resolve('')
        }
      })
    })
  }

  const handleMapClick = async (lat, lng, address, sehir) => {
    // İstanbul sınırları kontrolü
    if (!isWithinIstanbul(lat, lng)) {
      toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.');
      setLocation(null);
      setSearchValue('');
      setIsMapSelected(false);
      setSehir(null);
      return;
    }

    setLocation({ lat, lng, address });
    setSearchValue(address);
    setIsMapSelected(true);
    setActiveMapPanel(null);
    setSehir(sehir);
  };

  const handleCurrentLocation = async () => {
    try {
      const loadingToast = toast.loading('Konumunuz alınıyor...', { id: 'location' });
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // İstanbul sınırları kontrolü
      if (!isWithinIstanbul(latitude, longitude)) {
        toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.', { id: 'location' });
        setLocation(null);
        setSearchValue('');
        setIsMapSelected(false);
        setSehir(null);
        return;
      }

      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=85e92bcb025e4243b2ad8ccaef8c3593`);
      const data = await response.json();
      
      // Adresin İstanbul'da olup olmadığını kontrol et
      const addressComponents = data.results[0].components;
      const isIstanbul = addressComponents.province?.toLowerCase().includes('istanbul') || 
                        addressComponents.state?.toLowerCase().includes('istanbul');

      if (!isIstanbul) {
        toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.', { id: 'location' });
        setLocation(null);
        setSearchValue('');
        setIsMapSelected(false);
        setSehir(null);
        return;
      }

      const address = data.results[0].formatted;
      const newLocation = { lat: latitude, lng: longitude, address: address };
      
      setLocation(newLocation);
      setSearchValue(address);
      setShowMap(null);
      
      toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
    } catch (error) {
      console.error('Geolocation error:', error);
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
      }
      
      toast.error(errorMessage, { id: 'location' });
      setLocation(null);
      setSearchValue('');
      setIsMapSelected(false);
      setSehir(null);
    }
  };

  const handleArizaSelect = (ariza) => {
    setSelectedAriza(ariza)
    setAracBilgileri(prev => ({
      ...prev,
      condition: ariza.name
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (step === 1) {
        // Konum kontrolü
        if (!location) {
          return;
        }

        // Arıza kontrolü
        if (!selectedAriza) {
          toast.error('Lütfen tüm araç bilgilerini doldurun');
          return;
        }

        // Araç bilgileri kontrolü
        if (!aracBilgileri.marka || !aracBilgileri.model || !aracBilgileri.yil || !aracBilgileri.plaka || !aracBilgileri.tip) {
          toast.error('Lütfen tüm araç bilgilerini doldurun');
          return;
        }

        setStep(2);
      } else if (step === 2) {
        // Fiyat kontrolü
        if (!price) {
          toast.error('Lütfen fiyat hesaplamasını bekleyin');
          return;
        }
        setStep(3);
      } else if (step === 3) {
        // Müşteri bilgileri kontrolü
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

        await createOrder();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const createOrder = async () => {
    try {
      const orderData = {
        serviceType: 'YOL_YARDIM',
        breakdownLocation: location?.address,
        breakdownLocationLat: location?.lat,
        breakdownLocationLng: location?.lng,
        breakdownDescription: selectedAriza?.title,
        destinationLocation: location?.address,
        vehicles: [{
          tip: aracBilgileri.tip,
          marka: aracBilgileri.marka,
          model: aracBilgileri.model,
          yil: aracBilgileri.yil,
          plaka: aracBilgileri.plaka,
          condition: selectedAriza?.name || selectedAriza?.title || aracBilgileri.condition
        }],
        price: price,
        customerInfo: {
          ad: musteriBilgileri.ad,
          soyad: musteriBilgileri.soyad,
          tcKimlik: musteriBilgileri.tcKimlik,
          telefon: musteriBilgileri.telefon,
          email: musteriBilgileri.email,
          firmaAdi: musteriBilgileri.firmaAdi,
          vergiNo: musteriBilgileri.vergiNo,
          vergiDairesi: musteriBilgileri.vergiDairesi
        }
      };

      console.log('Gönderilen veri:', orderData);

      const response = await api.post('api/orders', orderData);
      console.log('API yanıtı:', response);

      if (!response.data || !response.data.pnr) {
        throw new Error('Talep numarası alınamadı');
      }

      setPnrNumber(response.data.pnr);
      console.log('Talep:', response.data.pnr);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', response.data.pnr);
      }

      setStep(4);
      toast.success('Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu: ' + (error?.response?.data?.message || error?.message || 'Bilinmeyen hata'));
    }
  };

  useEffect(() => {
    console.log("routeInfo", routeInfo)
    console.log("step", step)
    if (step === 2 ) {
      setShowMap('route');
    }
  }, [step, routeInfo]);

  if (loadError) {
    return <div className="p-8 text-white">Harita yüklenemedi.</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-sm">
      <div className="relative bg-[#202020] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#404040] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {step === 1 ? 'Yol Yardım Talebi' : step === 2 ? 'Fiyat Teklifi' : step === 3 ? 'Müşteri Bilgileri' : 'Sipariş Tamamlandı'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
                    Konum
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <div className="w-full">
                        <div className="relative">
                          <LocationAutocomplete
                            value={searchValue}
                            onChange={e => {
                              const value = e.target?.value ?? e.value ?? '';
                              setSearchValue(value);
                              if (!value) {
                                setLocation(null);
                                setSehir(null);
                                setIsMapSelected(false);
                              }
                            }}
                            onInputChange={(value) => {
                              setSearchValue(value);
                              if (!value) {
                                setLocation(null);
                                setSehir(null);
                                setIsMapSelected(false);
                              }
                            }}
                            onSelect={({ lat, lng, address }) => {
                              const newLocation = { lat, lng, address: address || searchValue };
                              setLocation(newLocation);
                              setSearchValue(address || searchValue);
                              handleMapClick(lat, lng, address, getCity());
                              setIsMapSelected(true);
                              const city = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                              city.then(res => res.json()).then(data => {
                                const cityData = data;
                                setSehir(cityData.address.province || "");
                              });
                            }}
                            placeholder="Adres girin veya haritadan seçin"
                            isMapSelected={isMapSelected}
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
                                  setSehir(sehir);
                                  const newLocation = { lat: latitude, lng: longitude, address: address, sehir: sehir };
                                  setLocation(newLocation);
                                  setSearchValue(address);
                                  setIsMapSelected(true);
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
                                setShowMap(showMap === 'location' ? null : 'location');
                                setActiveMapPanel(activeMapPanel === 'location' ? null : 'location');
                              }}
                              className={`text-[#404040] hover:text-yellow-500 transition-colors ${activeMapPanel === 'location' ? 'text-yellow-500' : ''}`}
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
                </div>

                {showMap === 'location' && isLoaded && (
                  <div style={mapStyles} className="relative mt-2">
                    <LocationPicker
                      isStartPicker={true}
                      onLocationChange={(lat, lng, address) => {
                        setLocation({lat: lat, lng: lng, address: address});
                        setSearchValue(address);
                        handleMapClick(lat, lng, address, getCity());
                        setShowMap(null);
                        setActiveMapPanel(null);
                      }}
                      onCityChange={(city) => {
                        setSehir(city);
                      }}
                      onCalculateRoute={() => {}}
                      mapStyles={mapStyles}
                    />
                  </div>
                )}

                <div>
                  {loading ? (
                    <div className="text-[#404040]">Yükleniyor...</div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#ebebeb] mb-1">Araç Segmenti</label>
                        <select
                          value={aracBilgileri.tip}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, tip: e.target.value })}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Segment Seçin</option>
                          {fiyatlandirma.segmentler.map(segment => (
                            <option key={segment.id} value={segment.id}>{segment.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#ebebeb] mb-1">Marka</label>
                        <select
                          value={aracBilgileri.marka}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, marka: e.target.value, model: '' })}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Marka Seçin</option>
                          {vehicleData.aracMarkalari.map((marka, index) => (
                            <option key={`marka-${marka}-${index}`} value={marka}>{marka}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#ebebeb] mb-1">Model</label>
                        <select
                          value={aracBilgileri.model}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, model: e.target.value })}
                          disabled={!aracBilgileri.marka}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Model Seçin</option>
                          {aracBilgileri.marka && vehicleData.aracModelleri[aracBilgileri.marka]?.map((model, index) => (
                            <option key={`model-${model}-${index}`} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#ebebeb] mb-1">Yıl</label>
                        <select
                          value={aracBilgileri.yil}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, yil: e.target.value })}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Yıl Seçin</option>
                          {vehicleData.yillar.map(yil => (
                            <option key={yil} value={yil}>{yil}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm text-[#ebebeb] mb-1">Plaka</label>
                        <input
                          type="text"
                          value={aracBilgileri.plaka}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, plaka: e.target.value.toUpperCase() })}
                          placeholder="34ABC123"
                          maxLength={8}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
                    Arıza Tipi
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {Object.entries(fiyatlandirma.arizaTipleri || {}).map(([id, ariza]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleArizaSelect({ id, title: ariza.name })}
                        className={`p-2 rounded-lg border transition-colors ${
                          selectedAriza?.id === id
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                            : 'bg-[#141414] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
                        }`}
                      >
                        <div className="text-sm font-medium">{ariza.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !location || !selectedAriza}
                className="w-full py-3 px-6 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Lütfen Bekleyin...' : 'Devam Et'}
              </button>

            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderPriceOffer()}
                {/* Rota ve Harita */}
                <div className="bg-[#141414] rounded-lg border border-[#404040] overflow-hidden">
                  <div className="p-2 sm:p-4">
                    <div className="flex text-center justify-center sm:items-center ">
                      <button
                        type="button"
                        onClick={() => setShowMap(showMap === 'route' ? null : 'route')}
                        className="text-yellow-500 hover:text-yellow-400 transition-colors text-xs text-center sm:text-sm items-center bg-[#202020] px-2 sm:px-3 py-1 rounded-lg"
                      >
                        {showMap === 'route' ? 'Haritayı Gizle' : 'Haritayı Göster'}
                      </button>
                    </div>
                  </div>
                  {showMap === 'route' && memoizedOriginLocation && memoizedEndLocation && (
                    <div className="relative" style={{ height: '248px', minHeight: '120px', maxHeight: '248px' }}>
                        <MapComponent
                          startLocation={memoizedOriginLocation}
                          endLocation={memoizedEndLocation}
                          shouldCalculate={true}
                          mapStyles={mapStyles}
                          onValuesChange={handleValuesChange}
                        />
                    </div>
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
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Lütfen Bekleyin...' : 'Devam Et'}
                </button>
              </div>
            </form>
          ) : step === 3 ? (
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2 ">
                        Firma Adı
                      </label>
                      <input
                        type="text"
                        value={musteriBilgileri.firmaAdi}
                        onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, firmaAdi: e.target.value }))}
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
                        onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, vergiNo: e.target.value }))}
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
                        onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, vergiDairesi: e.target.value }))}
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
                        onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, ad: e.target.value }))}
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
                        onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, soyad: e.target.value }))}
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
                              setMusteriBilgileri(prev => ({ ...prev, tcKimlik: value }));
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
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={musteriBilgileri.telefon}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setMusteriBilgileri(prev => ({ ...prev, telefon: value }));
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
                    onChange={(e) => setMusteriBilgileri(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 px-4 bg-[#141414] text-[#404040] font-medium rounded-lg hover:bg-[#202020] hover:text-white transition-colors"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                  disabled={isSubmitting || (musteriBilgileri.musteriTipi === 'kisisel'
                    ? (!musteriBilgileri.ad || !musteriBilgileri.soyad || !musteriBilgileri.telefon || !musteriBilgileri.email || (musteriBilgileri.tcVatandasi && !musteriBilgileri.tcKimlik))
                    : (!musteriBilgileri.firmaAdi || !musteriBilgileri.vergiNo || !musteriBilgileri.vergiDairesi || !musteriBilgileri.telefon || !musteriBilgileri.email))}
                >
                  {isSubmitting ? 'Lütfen Bekleyin...' : 'Siparişi Onayla'}
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-[#404040]">
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
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Siparişiniz Onaylandı!</h3>
                <p className="text-[#404040] mb-4">
                  Siparişiniz başarıyla oluşturuldu. Aşağıdaki bilgileri kullanarak ödemenizi yapabilirsiniz.
                </p>
                <div className="bg-[#141414] rounded-lg p-4 mb-4">
                  <div className="text-[#404040] text-sm mb-1">Talep Numaranız</div>
                  <div className="text-3xl font-bold text-yellow-500 tracking-wider">{pnrNumber || 'Yükleniyor...'}</div>
                  <div className="text-[#404040] text-xs mt-2">
                    Bu numarayı kullanarak siparişinizi takip edebilirsiniz
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Ödeme Bilgileri */}
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                  <h3 className="text-lg font-semibold text-white mb-4">Ödeme Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Banka</div>
                      <div className="text-white font-medium">QNB Finansbank</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">IBAN</div>
                      <div className="text-white font-medium">TR65 0011 1000 0000 0098 6222 45</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Tutar</div>
                      <div className="text-2xl font-bold text-yellow-500">{price?.toLocaleString('tr-TR')} TL</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Açıklama</div>
                      <div className="text-white font-medium">Talep: {pnrNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Sipariş Detayları */}
                <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                  <h3 className="text-lg font-semibold text-white mb-4">Sipariş Detayları</h3>
                  <div className="space-y-3">
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Araç Bilgileri</div>
                      <div className="text-white font-medium">
                        {aracBilgileri.marka} {aracBilgileri.model} ({aracBilgileri.yil})
                      </div>
                      <div className="text-white font-medium">{aracBilgileri.plaka}</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Arıza</div>
                      <div className="text-white font-medium">{selectedAriza?.title}</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Konum</div>
                      <div className="text-white font-medium text-sm" title={location?.address}>
                        {location?.address}
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">İletişim</div>
                      <div className="text-white font-medium">{musteriBilgileri.telefon}</div>
                      <div className="text-white font-medium">{musteriBilgileri.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-lg font-semibold text-white mb-4">Önemli Bilgiler</h3>
                <ul className="space-y-2 text-[#404040]">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Ödemenizi yaptıktan sonra size SMS ve e-posta ile bilgilendirme yapılacaktır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Talep numaranızı kullanarak siparişinizin durumunu web sitemizden takip edebilirsiniz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Herhangi bir sorunuz olursa 7/24 müşteri hizmetlerimizi arayabilirsiniz.</span>
                  </li>
                </ul>
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
      <AcikRizaModal isOpen={isAcikRizaOpen} onClose={() => setIsAcikRizaOpen(false)} />
      <AydinlatmaModal isOpen={isAydinlatmaOpen} onClose={() => setIsAydinlatmaOpen(false)} />
      <KvkkModal isOpen={isKvkkOpen} onClose={() => setIsKvkkOpen(false)} />
      <SorumlulukReddiModal isOpen={isSorumlulukReddiOpen} onClose={() => setIsSorumlulukReddiOpen(false)} />
    </div>
  )
}
