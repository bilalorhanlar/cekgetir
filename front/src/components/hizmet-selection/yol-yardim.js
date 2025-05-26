'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import React from 'react'
import api from '@/utils/axios'
import axios from 'axios'
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
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
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
    // Gece ücreti kontrolü
    const finalPrice = isNightTime ? segmentTotal * nightPrice : segmentTotal;

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
      finalPrice
    });

    setPrice(Math.round(finalPrice));
    return Math.round(finalPrice);
  }, [fiyatlandirma, location, aracBilgileri.tip, selectedAriza, routeInfo, isNightTime]);

  // Fiyat detaylarını göster
  const renderPriceDetails = () => {
    if (!price || !routeInfo) return null;

    const segment = fiyatlandirma.segmentler.find(s => s.id === aracBilgileri.tip);
    const katsayi = parseFloat(segment?.price) || 1;
    const arizaFiyat = fiyatlandirma.arizaTipleri[selectedAriza.id]?.price || 0;
    const baseUcret = fiyatlandirma.basePrice;
    const kmUcreti = routeInfo.distance * fiyatlandirma.basePricePerKm;
    const araToplam = baseUcret + kmUcreti + arizaFiyat;
    const segmentUcreti = araToplam * (katsayi - 1);
    const geceUcreti = (currentHour >= 22 || currentHour < 6) ? (araToplam + segmentUcreti) * (fiyatlandirma.nightPrice - 1) : 0;

    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[#404040]">
          <span>Araç Markası:</span>
          <span>{aracBilgileri.marka}</span>
        </div>
        <div className="flex justify-between text-[#404040]">
          <span>Araç Modeli:</span>
          <span>{aracBilgileri.model}</span>
        </div>
        <div className="flex justify-between text-[#404040]">
          <span>Araç Yılı:</span>
          <span>{aracBilgileri.yil}</span>
        </div>
        <div className="flex justify-between text-[#404040]">
          <span>Plaka:</span>
          <span>{aracBilgileri.plaka}</span>
        </div>
        <div className="flex justify-between text-[#404040]">
          <span>Mesafe:</span>
          <span>{routeInfo.distance.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between text-[#404040]">
          <span>Arıza Tipi:</span>
          <span>{selectedAriza.name}</span>
        </div>
        <div className="flex justify-between text-white font-medium pt-2 border-t border-[#404040]">
          <span>Toplam:</span>
          <span>{price.toLocaleString('tr-TR')} TL</span>
        </div>
      </div>
    );
  };

  // Fiyat teklifi bölümünü güncelle
  const renderPriceOffer = () => (
    <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Fiyat Teklifi</h3>
        <div className="flex items-center gap-2">
          {isNightTime && (
            <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded max-w-[180px]">
              Gece Tarifesi (22:00 - 08:00) • Gündüz daha uygun
            </div>
          )}
          <div className="text-3xl font-bold text-yellow-500">
            {price?.toLocaleString('tr-TR')} TL
          </div>
        </div>
      </div>
      {renderPriceDetails()}
    </div>
  );

  // Rota hesaplama fonksiyonu
  const calculateRoute = useCallback(async (destination) => {
    if (!fiyatlandirma) {
      console.warn('Fiyatlandırma bilgisi henüz yüklenmedi');
      return;
    }
    
    const origin = {
      lat: fiyatlandirma.baseLat,
      lng: fiyatlandirma.baseLng
    };
    
    if (!window.google) {
      console.warn('Google Maps API henüz yüklenmedi');
      return;
    }

    console.log('Rota hesaplama başlıyor:', {
      origin,
      destination,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...'
    });
    
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
      const duration = route.legs[0].duration.value / 60; // dk
      
      setDirections(result);
      setRouteInfo({
        distance,
        duration,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.instructions,
          distance: step.distance.text,
          duration: step.duration.text
        }))
      });
      fiyatHesapla();
    } catch (error) {
      console.error('Rota hesaplama hatası:', error);
      setError('Rota hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [fiyatlandirma, fiyatHesapla]);

  // Fiyat hesaplamayı useEffect ile tetikle
  useEffect(() => {
    fiyatHesapla();
  }, [location, aracBilgileri.tip, selectedAriza, routeInfo, fiyatHesapla]);

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

  // Konumlar değiştiğinde fiyat hesapla
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      calculateRoute(deliveryLocation);
    }
  }, [pickupLocation, deliveryLocation, routeInfo, calculateRoute]);

  // Araç listesi değiştiğinde fiyat hesapla
  useEffect(() => {
    if (araclar.length > 0) {
      calculateRoute(deliveryLocation);
    }
  }, [araclar, routeInfo, calculateRoute, deliveryLocation]);

  // İstanbul sınırları kontrolü
  const isWithinIstanbul = (lat, lng) => {
    return lat >= 40.8 && lat <= 41.5 && lng >= 28.4 && lng <= 29.5;
  };

  // Konumdan adres reverse geocode için
  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return ''
    
    // İstanbul sınırları kontrolü
    if (!isWithinIstanbul(lat, lng)) {
      toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.');
      return '';
    }

    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          resolve('')
        }
      })
    })
  }

  const handleInputChange = async (e) => {
    const value = e.target.value
    setLocationSearchValue(value)
    
    if (value.length > 2 && autocompleteService.current) {
      try {
        const response = await autocompleteService.current.getPlacePredictions({
          input: value,
          componentRestrictions: { country: 'tr' },
          types: ['address'],
          bounds: new window.google.maps.LatLngBounds(
            { lat: 40.8, lng: 28.4 }, // Güneybatı
            { lat: 41.5, lng: 29.5 }  // Kuzeydoğu
          )
        })
        setPredictions(response.predictions)
        setShowAutocomplete(true)
      } catch (error) {
        console.error('Autocomplete error:', error)
      }
    } else {
      setPredictions([])
      setShowAutocomplete(false)
    }
  }

  const handlePredictionSelect = async (prediction) => {
    if (!window.google) return

    const geocoder = new window.google.maps.Geocoder()
    try {
      const result = await geocoder.geocode({ placeId: prediction.place_id })
      if (result.results[0]) {
        const place = result.results[0]
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        // İstanbul sınırları kontrolü
        if (!isWithinIstanbul(lat, lng)) {
          toast.error('Yol yardım hizmeti sadece İstanbul içinde geçerlidir.')
          return
        }

        const newLocation = {
          lat,
          lng,
          address: place.formatted_address
        }
        
        setLocation(newLocation)
        setLocationSearchValue(place.formatted_address)
        calculateRoute(newLocation)
        setShowAutocomplete(false)
        setPredictions([])
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await getAddressFromLatLng(lat, lng);
    const newLocation = { lat, lng, address };
    setLocation(newLocation);
    setLocationSearchValue(address);
  };

  const handleCurrentLocation = async () => {
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
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const address = await getAddressFromLatLng(latitude, longitude);
      const newLocation = { lat: latitude, lng: longitude, address };
      
      setLocation(newLocation);
      setLocationSearchValue(address);
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
    if (step === 2 && routeInfo) {
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
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Konum Seçin
                  </label>
                  <div className="relative">
                    {isLoaded && (
                      <div className="w-full">
                        <div className="relative">
                          <input
                            type="text"
                            id="location-input"
                            value={locationSearchValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                              }
                            }}
                            placeholder="Adres girin veya haritadan seçin"
                            className="w-full pr-16 px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            onClick={() => setShowMap(true)}
                            onFocus={() => setShowAutocomplete(true)}
                            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 bg-[#141414] z-[101]">
                            <button
                              type="button"
                              onClick={handleCurrentLocation}
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
                              onClick={() => setShowMap(!showMap)}
                              className={`text-[#404040] hover:text-yellow-500 transition-colors ${showMap ? 'text-yellow-500' : ''}`}
                              title="Haritadan Seç"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l.94 1.57a2 2 0 001.7.95h5.34a2 2 0 011.7-.95l.94-1.57A2 2 0 0116.72 3H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {showAutocomplete && predictions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[#404040] rounded-lg shadow-lg z-[100] max-h-[300px] overflow-y-auto">
                            {predictions.map((prediction) => (
                              <button
                                key={prediction.place_id}
                                onClick={() => handlePredictionSelect(prediction)}
                                className="w-full text-left px-4 py-3 text-white hover:bg-[#202020] transition-colors border-b border-[#404040] last:border-b-0"
                              >
                                {prediction.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {showMap && isLoaded && (
                  <div style={mapStyles} className="relative mt-2">
                    <GoogleMap
                      mapContainerStyle={mapStyles}
                      center={location || { lat: 41.0082, lng: 28.9784 }}
                      zoom={13}
                      options={mapOptions}
                      onClick={handleMapClick}
                      onLoad={map => (mapRef.current = map)}
                    >
                      {location && <Marker position={location} />}
                    </GoogleMap>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#404040] mb-2">
                    Araç Bilgileri
                  </label>
                  {loading ? (
                    <div className="text-[#404040]">Yükleniyor...</div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#404040] mb-1">Araç Segmenti</label>
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
                        <label className="block text-sm text-[#404040] mb-1">Marka</label>
                        <select
                          value={aracBilgileri.marka}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, marka: e.target.value, model: '' })}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Marka Seçin</option>
                          {vehicleData.aracMarkalari.map(marka => (
                            <option key={marka} value={marka}>{marka}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#404040] mb-1">Model</label>
                        <select
                          value={aracBilgileri.model}
                          onChange={(e) => setAracBilgileri({ ...aracBilgileri, model: e.target.value })}
                          disabled={!aracBilgileri.marka}
                          className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="">Model Seçin</option>
                          {aracBilgileri.marka && vehicleData.aracModelleri[aracBilgileri.marka]?.map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#404040] mb-1">Yıl</label>
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
                        <label className="block text-sm text-[#404040] mb-1">Plaka</label>
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
                  <label className="block text-sm font-medium text-[#404040] mb-2">
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
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Rota Bilgileri</h3>
                      <button
                        type="button"
                        onClick={() => setShowMap(showMap === 'route' ? null : 'route')}
                        className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm flex items-center gap-1 bg-[#202020] px-3 py-1.5 rounded-lg"
                      >
                        {showMap === 'route' ? 'Haritayı Kapat' : 'Haritayı Göster'}
                      </button>
                    </div>
                    {routeInfo && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#202020] rounded-lg p-2 text-center">
                          <div className="text-[#404040] text-xs">Mesafe</div>
                          <div className="text-white font-medium text-sm">{routeInfo.distance.toFixed(1)} km</div>
                        </div>
                        <div className="bg-[#202020] rounded-lg p-2 text-center">
                          <div className="text-[#404040] text-xs">Süre</div>
                          <div className="text-white font-medium text-sm">{Math.round(routeInfo.duration)} dk</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {showMap === 'route' && (
                    <div className="relative" style={{ height: '200px' }}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={location || { lat: 40.9877, lng: 29.1267 }}
                        zoom={13}
                        options={mapOptions}
                      >
                        {location && <Marker position={location} />}
                        {directions && (
                          <DirectionsRenderer
                            directions={directions}
                            options={{
                              suppressMarkers: true,
                              polylineOptions: {
                                strokeColor: '#EAB308',
                                strokeWeight: 5,
                                strokeOpacity: 0.8
                              }
                            }}
                          />
                        )}
                      </GoogleMap>
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
                  {isSubmitting ? 'Lütfen Bekleyin...' : 'Siparişi Onayla'}
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
                  Devam Et butonuna tıkladığınızda{' '}
                  <a href="/kvkk" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">KVKK</a>,{' '}
                  <a href="/acik-riza" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Açık Rıza Metni</a>,{' '}
                  <a href="/aydinlatma" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Aydınlatma Metni</a> ve{' '}
                  <a href="/sorumluluk-reddi" target="_blank" className="text-yellow-500 hover:text-yellow-400 transition-colors">Sorumluluk Reddi Beyanı</a> metinlerini okuduğunuzu ve onayladığınızı taahhüt etmiş sayılırsınız.
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
                      <div className="text-white font-medium">Garanti Bankası</div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">IBAN</div>
                      <div className="text-white font-medium">TR12 3456 7890 1234 5678 9012 34</div>
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
    </div>
  )
}
