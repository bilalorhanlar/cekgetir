'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from '@react-google-maps/api'
import api from '@/utils/axios'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import dynamic from "next/dynamic";
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AcikRizaModal from '@/components/sozlesmeler/acikriza';
import AydinlatmaModal from '@/components/sozlesmeler/aydinlatma';
import KvkkModal from '@/components/sozlesmeler/kvkk';
import SorumlulukReddiModal from '@/components/sozlesmeler/sorumlulukreddi';

// Leaflet'i SSR olmadan sadece client'ta render etmek için
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

// LocationPicker bileşenini dinamik olarak import et
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
});


const libraries = ['places']

const mapStyles = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem',
  border: '1px solid rgba(64, 64, 64, 0.4)'
}

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

export default function OzelCekiciModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [activeLocation, setActiveLocation] = useState(null)
  const [activeMapPanel, setActiveMapPanel] = useState(null)
  const [pickupSearchValue, setPickupSearchValue] = useState('')
  const [deliverySearchValue, setDeliverySearchValue] = useState('')
  const [aracBilgileri, setAracBilgileri] = useState({
    marka: '',
    model: '',
    yil: '',
    plaka: '',
    tip: '',
    durum: ''
  })

  const [musteriBilgileri, setMusteriBilgileri] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    musteriTipi: 'kisisel',
    firmaAdi: '',
    vergiNo: '',
    vergiDairesi: '',
    tcKimlik: '',
    tcVatandasi: true
  })
  const [price, setPrice] = useState(null)
  const [pricingData, setPricingData] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [directions, setDirections] = useState(null)
  const [pnrNumber, setPnrNumber] = useState(null)
  const [vehicleData, setVehicleData] = useState({
    aracMarkalari: [],
    aracModelleri: {},
    yillar: [],
    segmentler: [],
    durumlar: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sehirFiyatlandirma, setSehirFiyatlandirma] = useState(null)
  const mapRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const autocompleteService = useRef(null)
  const [extraFee, setExtraFee] = useState(0)
  const [sehir, setSehir] = useState(null)
  const [sehir2, setSehir2] = useState(null)  
  const [isPickupMapSelected, setIsPickupMapSelected] = useState(false);
  const [isDeliveryMapSelected, setIsDeliveryMapSelected] = useState(false);
  const [isAcikRizaOpen, setIsAcikRizaOpen] = useState(false);
  const [isAydinlatmaOpen, setIsAydinlatmaOpen] = useState(false);
  const [isKvkkOpen, setIsKvkkOpen] = useState(false);
  const [isSorumlulukReddiOpen, setIsSorumlulukReddiOpen] = useState(false);
  const [detectedBridges, setDetectedBridges] = useState([]);
  const [bridgeFees, setBridgeFees] = useState(0);

  // MapComponent için memoized location objeler
  const memoizedStartLocation = useMemo(() => 
    pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : null, 
    [pickupLocation?.lat, pickupLocation?.lng]
  )
  
  const memoizedEndLocation = useMemo(() => 
    deliveryLocation ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng } : null, 
    [deliveryLocation?.lat, deliveryLocation?.lng]
  )

  // MapComponent için memoized callback
  const handleValuesChange = useCallback((distance, duration, detectedBridges, bridgeFees) => {
    setRouteInfo({ distance, duration })
    setDetectedBridges(detectedBridges || []);
    setBridgeFees(bridgeFees || 0);
  }, [])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  })
  const setSehirFiyatlandirmaHandler = (sehir) => {
    setSehirFiyatlandirma(sehir)
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          { data: ozelCekiciData },
          { data: segmentsData },
          { data: statusesData },
          { data: vehicleInfoData }
        ] = await Promise.all([
          api.get('/api/variables/ozel-cekici'),
          api.get('/api/variables/car-segments?type=ozel-cekici'),
          api.get('/api/variables/car-statuses?type=ozel-cekici'),
          axios.get('/data/arac-info.json')
        ]);

        setPricingData({
          ...ozelCekiciData,
          segments: segmentsData.map(segment => ({
            id: segment.id,
            name: segment.name,
            price: segment.price
          })),
          statuses: statusesData.map(status => ({
            id: status.id,
            name: status.name,
            price: status.price
          }))
        });

        setVehicleData({
          segments: segmentsData,
          brands: vehicleInfoData.aracMarkalari,
          models: vehicleInfoData.aracModelleri,
          years: vehicleInfoData.yillar
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
  }, [isLoaded])

  const getCity = () => {
    return sehir;
  }

  const getCity2 = () => {
    return sehir2;
  }
  

  // Fiyat hesaplama fonksiyonu
  const fiyatHesapla = useCallback( async () => {
    let sehirFiyatlandirmaLocal = null;
    try {
    // Şehir fiyatlandırmasını getir
    const normalizedSehir = normalizeSehirAdi(sehir);
    const response = await api.get(`/api/variables/ozel-cekici/sehirler`)
    for (const sehirObj of response.data) {
      if (normalizeSehirAdi(sehirObj.sehirAdi).toLowerCase() === normalizedSehir.toLowerCase()) {
        setSehirFiyatlandirmaHandler(sehirObj)
        sehirFiyatlandirmaLocal = sehirObj;
        break
      }
    }
    } catch (error) {
      console.error('Şehir fiyatlandırması getirilemedi:', error)
    }
    
    // Debug: Log all required values
    console.log('fiyatHesapla debug:', {
      pickupLocation: !!pickupLocation,
      deliveryLocation: !!deliveryLocation,
      aracTip: aracBilgileri.tip,
      aracDurum: aracBilgileri.durum,
      sehir: sehir,
      sehirFiyatlandirmaLocal: sehirFiyatlandirmaLocal,
      routeInfo: routeInfo,
      pricingData: !!pricingData
    });
    
    // Gerekli kontroller
    if (!pickupLocation || !deliveryLocation || !aracBilgileri.tip || !aracBilgileri.durum) {
      console.log('fiyatHesapla: Missing required data, returning 0');
      setPrice(0);
      return 0;
    }

    // Şehir adı normalize edilmiş şekilde alınmalı!
    const isIstanbul = sehirFiyatlandirmaLocal && (
      sehirFiyatlandirmaLocal.sehirAdi?.toLocaleLowerCase('tr-TR') === 'istanbul'
        || sehirFiyatlandirmaLocal.sehirAdi?.toLocaleLowerCase('tr-TR') === 'i̇stanbul'
    );

    const currentHour = new Date().getHours();
    const isNightTime = (currentHour >= 22 || currentHour < 8);

    const nightMultiplier = (isIstanbul && isNightTime)
      ? (pricingData?.nightPrice || 1)
      : 1;
    
    // Fiyat hesaplama bileşenleri - Teslim alınacak konumun şehir fiyatlarını kullan
    const basePrice = Number(sehirFiyatlandirmaLocal?.basePrice) || 0;  // Teslim alınacak şehrin baz fiyatı
    const distanceMultiplier = routeInfo?.distance ? routeInfo.distance * (Number(sehirFiyatlandirmaLocal?.basePricePerKm) || 0) : 0;  // Teslim alınacak şehrin km ücreti
    
    // Araç tipine göre segment katsayısı (diziden bul)
    const segmentObj = pricingData?.segments?.find(seg => String(seg.id) === String(aracBilgileri.tip));
    const segmentMultiplier = segmentObj ? Number(segmentObj.price) || 1 : 1;
    
    // Araç durumuna göre durum ücreti (diziden bul)
    const statusObj = pricingData?.statuses?.find(st => String(st.id) === String(aracBilgileri.durum));
    const statusPrice = statusObj ? Number(statusObj.price) || 0 : 0;

    // Şile kontrolü ve ekstra ücret
    const isPickupInSile = pickupLocation?.address?.toLowerCase().includes('şile') || pickupLocation?.address?.toLowerCase().includes('sile');
    const isDeliveryInSile = deliveryLocation?.address?.toLowerCase().includes('şile') || deliveryLocation?.address?.toLowerCase().includes('sile');
    const sileExtraFee = (isPickupInSile || isDeliveryInSile) ? 3000 : 0;
    
    // Köprü ücreti - MapComponent'ten gelen bridgeFees kullanılıyor
    const totalBridgeFee = Number(bridgeFees) || 0;
    
    // Extra fee kontrolü
    const extraFeeValue = Number(extraFee) || 0;
    
    // Debug: Log calculation components
    console.log('fiyatHesapla calculation components:', {
      basePrice,
      distanceMultiplier,
      segmentMultiplier,
      statusPrice,
      sileExtraFee,
      totalBridgeFee,
      extraFee: extraFeeValue,
      nightMultiplier
    });
    
    // Toplam fiyat hesaplama (durum ücreti, Şile ücreti ve köprü ücreti toplama olarak ekleniyor)
    const totalPrice = ((basePrice + distanceMultiplier + statusPrice + sileExtraFee + totalBridgeFee + extraFeeValue) * segmentMultiplier) * nightMultiplier;
    
    // KDV hesaplama (%20)
    const kdv = totalPrice * 0.20;
    const finalPrice = totalPrice + kdv;
    let calculatedPrice = Math.round(finalPrice);
    
    // Safety check: if calculation results in NaN, use a fallback
    if (isNaN(calculatedPrice) || !isFinite(calculatedPrice)) {
      console.warn('fiyatHesapla: Calculation resulted in NaN, using fallback calculation');
      // Fallback: simple calculation with safe values
      const fallbackPrice = ((basePrice + (distanceMultiplier || 0) + statusPrice + sileExtraFee) * segmentMultiplier) * nightMultiplier;
      const fallbackKdv = fallbackPrice * 0.20;
      calculatedPrice = Math.round(fallbackPrice + fallbackKdv);
    }
    
    console.log('fiyatHesapla final calculation:', {
      totalPrice,
      kdv,
      finalPrice,
      calculatedPrice
    });
    
    setPrice(calculatedPrice);
    return calculatedPrice;
  }, [pickupLocation, deliveryLocation, aracBilgileri, routeInfo, pricingData, sehir, extraFee, bridgeFees]);


  const handleMapClick = (lat, lng, address, city) => {
    if (activeLocation === 'pickup') {
      setPickupLocation({ lat, lng, address });
      setPickupSearchValue(address);
      setSehir(city);
    } else if (activeLocation === 'delivery') {
      setDeliveryLocation({ lat, lng, address });
      setDeliverySearchValue(address);
      setSehir2(city);
    }
    // Harita panelini kapatmak istiyorsanız:
    setActiveMapPanel(null);
  };

  useEffect(() => {
    if (isLoaded && window.google) {
      const pickupInput = document.getElementById('pickup-input');
      const deliveryInput = document.getElementById('delivery-input');

      if (pickupInput) {
        pickupInput.addEventListener('click', () => {
          setActiveLocation('pickup');
          setActiveMapPanel('pickup');
        });
      }

      if (deliveryInput) {
        deliveryInput.addEventListener('click', () => {
          setActiveLocation('delivery');
          setActiveMapPanel('delivery');
        });
      }
    }
  }, [isLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (step === 1) {
        // Konum kontrolleri
        if (!pickupLocation) {
          return;
        }
        
        if (!deliveryLocation) {
          return;
        }

        // Araç bilgileri kontrolleri
        if (!aracBilgileri.marka || !aracBilgileri.model || !aracBilgileri.yil || !aracBilgileri.plaka || !aracBilgileri.tip) {
          toast.error('Lütfen tüm araç bilgilerini doldurun');
          return;
        }

        console.log("fiyatHesapla")
        const calculatedPrice = await fiyatHesapla();
        console.log("fiyatHesapla sonrası", calculatedPrice)

        setStep(2);
      } else if (step === 2) {
        if (!price || price === 0) {
          // Fiyat hesaplamasını bekle!
          console.log("fiyatHesapla")
          const calculatedPrice = await fiyatHesapla();
          console.log("fiyatHesapla sonrası", calculatedPrice)

          if (!calculatedPrice || calculatedPrice === 0) {
            toast.error('Lütfen fiyat hesaplamasını bekleyin');
            return;
          }
        }
        setStep(3);
      } else if (step === 3) {
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

        await createOrder();
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (
      step === 2 &&
      pickupLocation &&
      deliveryLocation
    ) {
      setActiveMapPanel('route');
    }
  }, [step, pickupLocation, deliveryLocation]);

  // Sipariş oluşturma fonksiyonu
  const createOrder = async () => {
    try {
      const orderData = {
        serviceType: 'OZEL_CEKICI',
        vehicles: [{
          tip: aracBilgileri.tip,
          marka: aracBilgileri.marka,
          model: aracBilgileri.model,
          yil: aracBilgileri.yil,
          plaka: aracBilgileri.plaka,
          condition: aracBilgileri.durum
        }],
        price,
        customerInfo: {
          ad: musteriBilgileri.ad,
          soyad: musteriBilgileri.soyad,
          telefon: musteriBilgileri.telefon,
          email: musteriBilgileri.email,
          tcKimlik: musteriBilgileri.tcKimlik,
          firmaAdi: musteriBilgileri.firmaAdi,
          vergiNo: musteriBilgileri.vergiNo,
          vergiDairesi: musteriBilgileri.vergiDairesi
        },
        pickupLocation: pickupLocation.address,
        pickupLocationLat: pickupLocation.lat,
        pickupLocationLng: pickupLocation.lng,
        dropoffLocationLat: deliveryLocation.lat,
        dropoffLocationLng: deliveryLocation.lng,
        dropoffLocation: deliveryLocation.address,
        isPickupFromParking: false,
        isDeliveryToParking: false
      };

      console.log('Gönderilen veri:', orderData);

      const { data } = await api.post('/api/orders', orderData);
      console.log('API yanıtı:', data);

      if (!data || !data.pnr) {
        throw new Error('Talep numarası alınamadı');
      }

      setPnrNumber(data.pnr);
      setStep(4);

      // PNR'ı localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPnr', data.pnr);
      }

      toast.success('Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu: ' + (error?.response?.data?.message || error?.message || 'Bilinmeyen hata'));
    }
  };

  useEffect(() => {
    // routeInfo güncellendiğinde ve gerekli bilgiler varsa fiyatı hesapla
    if (
      pickupLocation &&
      deliveryLocation &&
      aracBilgileri.tip &&
      aracBilgileri.durum &&
      routeInfo &&
      sehir
    ) {
      fiyatHesapla().then(calculatedPrice => {
        console.log("fiyatHesapla", calculatedPrice)
      }).catch(error => {
        console.error("fiyatHesapla error:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo, detectedBridges]);

  const renderAracBilgileri = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#ebebeb] mb-2">
            Araç Segmenti
          </label>
          <select
            value={aracBilgileri.tip}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, tip: e.target.value })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
          >
            <option value="">Segment Seçin</option>
            {vehicleData?.segments?.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#ebebeb] mb-2">
            Marka
          </label>
          <select
            value={aracBilgileri.marka}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, marka: e.target.value, model: '' })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Marka Seçin</option>
            {vehicleData?.brands?.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#ebebeb] mb-2">
            Model
          </label>
          <select
            value={aracBilgileri.model}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, model: e.target.value })}
            disabled={!aracBilgileri.marka}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Model Seçin</option>
            {aracBilgileri.marka && vehicleData?.models?.[aracBilgileri.marka]?.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#ebebeb] mb-2">
            Yıl
          </label>
          <select
            value={aracBilgileri.yil}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, yil: e.target.value })}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Yıl Seçin</option>
            {vehicleData?.years?.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#ebebeb] mb-2">
            Plaka
          </label>
          <input
            type="text"
            value={aracBilgileri.plaka}
            onChange={(e) => setAracBilgileri({ ...aracBilgileri, plaka: e.target.value })}
            placeholder="34ABC123"
            maxLength={8}
            className="w-full px-4 py-3 bg-[#141414] border border-[#404040] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#ebebeb] mb-2">
          Araç Durumu
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {pricingData?.statuses?.map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setAracBilgileri({ ...aracBilgileri, durum: status.id })}
              className={`p-2 rounded-lg border transition-colors text-sm font-medium ${
                aracBilgileri.durum === status.id
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                  : 'bg-[#141414] border-[#404040] text-[#404040] hover:bg-[#202020] hover:text-white'
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

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
            {step === 1 ? 'Özel Çekici Talebi' : step === 2 ? 'Fiyat Teklifi' : step === 3 ? 'Sipariş Onayı' : 'Sipariş Tamamlandı'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Alınacak Konum */}
                <div>
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
                    Nereden
                  </label>
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
                              handleMapClick(lat, lng, address, getCity());
                              setIsPickupMapSelected(true); // autocomplete kapansın
                              const city = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                              city.then(res => res.json()).then(data => {
                                const cityData = data;
                                setSehir(cityData.address.province || "");
                              });
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
                                // Mevcut konumdan seçim
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
                                  setPickupLocation(newLocation);
                                  setPickupSearchValue(address); // inputa adresi yaz
                                  setIsPickupMapSelected(true); // konumdan seçildi
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
                </div>

                {/* Teslim Edilecek Konum */}
                <div>
                  <label className="block text-sm font-medium text-[#ebebeb] mb-2">
                    Nereye
                  </label>
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
                              handleMapClick(lat, lng, address || deliverySearchValue, getCity2());
                              setIsDeliveryMapSelected(true); // autocomplete kapansın
                              const city = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                              city.then(res => res.json()).then(data => {
                                const cityData = data;
                                setSehir2(cityData.address.province || "");
                              });
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
                                // Mevcut konumdan seçim
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
                                  setDeliverySearchValue(address); // inputa adresi yaz
                                  setIsDeliveryMapSelected(true); // konumdan seçildi
                                  toast.success('Konumunuz başarıyla alındı.', { id: 'location' });
                                } catch (error) {
                                  setIsMapSelected(false);
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
                </div>
                {isLoaded && activeMapPanel === "pickup" && (
                  <div className=" mt-2">
                    <LocationPicker
                      isStartPicker={true}
                      onLocationChange={(lat, lng, address) => {
                        setPickupLocation({lat: lat, lng: lng, address: address});
                        setPickupSearchValue(address);
                        handleMapClick(lat, lng, address, getCity());
                        setIsPickupMapSelected(true); // mapten seçildi
                        setActiveMapPanel(null); // Seçim sonrası paneli kapat
                      }}
                      onCityChange={ (city) => {
                        setSehir(city);
                      }}
                      onCalculateRoute={ () => {}}
                      mapStyles={mapStyles}
                    />
                  </div>
                )}
                {isLoaded && activeMapPanel === "delivery" && (
                  <div className=" mt-2">
                    <LocationPicker
                      isStartPicker={false}
                      onLocationChange={(lat, lng, address) => {
                        setDeliveryLocation({lat: lat, lng: lng, address: address});
                        setDeliverySearchValue(address);
                        handleMapClick(lat, lng, address, getCity2());
                        setIsDeliveryMapSelected(true); // mapten seçildi
                        setActiveMapPanel(null); // Seçim sonrası paneli kapat
                      }}
                      onCityChange={ (city) => {
                        setSehir2(city);
                      }}
                      onCalculateRoute={ () => {}}
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
                    renderAracBilgileri()
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Lütfen Bekleyin...' : 'Devam Et'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(() => {
                const currentHour = new Date().getHours();
                const isNightTime = (currentHour >= 22 || currentHour < 8);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Fiyat Teklifi */}
                    <div className="bg-[#141414] rounded-lg p-4 border border-[#404040]">
                      <div className="block text-sm">
                        <div className="bg-[#202020] rounded-lg p-2 mb-3">
                          <div className="text-white/60">Araç</div>
                          <div className="text-white font-medium truncate" title={`${aracBilgileri.marka} ${aracBilgileri.model} (${aracBilgileri.yil})`}>
                            {aracBilgileri.marka} {aracBilgileri.model} ({aracBilgileri.yil})
                          </div>
                        </div>
                        <div className="bg-[#202020] rounded-lg p-2 mb-3">
                          <div className="text-white/60">Plaka</div>
                          <div className="text-white font-medium">{aracBilgileri.plaka}</div>
                        </div>
                        <div className="bg-[#202020] rounded-lg p-2 mb-3">
                          <div className="text-white/60">Nereden</div>
                          <div className="text-white font-medium text-xs" title={pickupLocation?.address }>
                            {pickupLocation?.address}
                          </div>
                        </div>
                        <div className="bg-[#202020] rounded-lg p-2">
                          <div className="text-white/60">Nereye</div>
                          <div className="text-white font-medium text-xs" title={deliveryLocation?.address}>
                            {deliveryLocation?.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3 mt-3">
                        Toplam : <span className="text-3xl font-bold text-yellow-500">{price?.toLocaleString('tr-TR')} TL</span>
                      </div>
                      {isNightTime && (
                        <div className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded w-full">
                          Gece Tarifesi • Önerilen (08:00 - 22:00)
                        </div>
                      )}
                      <button
                          type="button"
                          onClick={() => {
                            const isIstanbul = sehirFiyatlandirma && (
                              sehirFiyatlandirma.sehirAdi?.toLocaleLowerCase('tr-TR') === 'istanbul'
                                || sehirFiyatlandirma.sehirAdi?.toLocaleLowerCase('tr-TR') === 'i̇stanbul'
                            );
                            const currentHour = new Date().getHours();
                            const isNightTime = (currentHour >= 22 || currentHour < 8);
                            const nightMultiplier = (isIstanbul && isNightTime) ? (pricingData?.nightPrice || 1) : 1;
                            const basePrice = Number(sehirFiyatlandirma?.basePrice) || 0;
                            const distanceMultiplier = routeInfo?.distance ? routeInfo.distance * (Number(sehirFiyatlandirma?.basePricePerKm) || 0) : 0;
                            const segmentObj = pricingData?.segments?.find(seg => String(seg.id) === String(aracBilgileri.tip));
                            const segmentMultiplier = segmentObj ? Number(segmentObj.price) : 1;
                            const statusObj = pricingData?.statuses?.find(st => String(st.id) === String(aracBilgileri.durum));
                            const statusPrice = statusObj ? Number(statusObj.price) : 0;
                            const totalBridgeFee = Number(bridgeFees) || 0;
                            const totalPrice = ((basePrice + distanceMultiplier + statusPrice + totalBridgeFee + (extraFee || 0)) * segmentMultiplier) * nightMultiplier;
                            const kdv = totalPrice * 0.20;
                            const finalPrice = totalPrice + kdv;

                            console.log('Fiyat Hesaplama Detayları: ----------------', {
                              'Temel Fiyat': basePrice.toLocaleString('tr-TR') + ' TL',
                              'Teslim Edilecek Konum': deliveryLocation?.address,
                              'Teslim Alınacak Konum': pickupLocation?.address,
                              'Teslim Edilecek Şehir': deliveryLocation?.sehir,
                              'Teslim Alınacak Şehir': pickupLocation?.sehir,
                              'km başına fiyat': Number(sehirFiyatlandirma?.basePricePerKm).toLocaleString('tr-TR') + ' TL',
                              'Km': routeInfo?.distance,
                              'Mesafe Ücreti': distanceMultiplier.toLocaleString('tr-TR') + ' TL',
                              'Durum Ücreti': statusPrice.toLocaleString('tr-TR') + ' TL',
                              'Köprü Ücreti': totalBridgeFee.toLocaleString('tr-TR') + ' TL',
                              'Tespit Edilen Köprüler': detectedBridges,
                              'Segment Çarpanı': segmentMultiplier + 'x',
                              'Gece Tarifesi': isNightTime ? (nightMultiplier + 'x') : 'Yok',
                              'Ara Toplam': totalPrice.toLocaleString('tr-TR') + ' TL',
                              'KDV (%20)': (totalPrice * 0.20).toLocaleString('tr-TR') + ' TL',
                              'Genel Toplam': Math.round(totalPrice).toLocaleString('tr-TR') + ' TL',
                              'kdv dahil final fiyat': finalPrice.toLocaleString('tr-TR') + ' TL'
                            });
                          }} className="text-xs text-[#404040] mt-3">Fiyatlara KDV dahildir</button>
                    </div>

                    {/* Rota ve Harita */}
                    <div className="bg-[#141414] rounded-lg border border-[#404040] overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-white">Rota Bilgileri</h3>
                          <button
                            type="button"
                            onClick={() => setActiveMapPanel(activeMapPanel === 'route' ? null : 'route')}
                            className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm flex items-center gap-1 bg-[#202020] px-3 py-1.5 rounded-lg"
                          >
                            {activeMapPanel === 'route' ? 'Haritayı Kapat' : 'Haritayı Göster'}
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
                      {activeMapPanel === 'route' && isLoaded && memoizedStartLocation && memoizedEndLocation && (

                        <div style={{ height: '200px' }}>
                            <MapComponent 
                              startLocation={memoizedStartLocation}
                              endLocation={memoizedEndLocation}
                              shouldCalculate={true}
                              mapStyles={mapStyles}
                              onValuesChange={handleValuesChange}
                            />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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
                      <label className="block text-sm font-medium text-[#ebebeb] mb-2">
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
                  disabled={isSubmitting}
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
                <h3 className="text-xl font-bold text-white mb-2">Siparişiniz Alındı!</h3>
                <p className="text-[#404040] mb-4">
                  Siparişiniz başarıyla oluşturuldu. Aşağıdaki bilgileri kullanarak ödemenizi yapabilirsiniz.
                </p>
                <div className="bg-[#141414] rounded-lg p-4 mb-4">
                  <div className="text-[#404040] text-sm mb-1">Talep Numaranız</div>
                  <div className="text-2xl font-bold text-yellow-500">{pnrNumber}</div>
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
                      <div className="text-white font-medium">Talep Numarası : {pnrNumber}</div>
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
                      <div className="text-[#404040] text-sm mb-1">Nereden</div>
                      <div className="text-white font-medium text-sm" title={pickupLocation?.address}>
                        {pickupLocation?.address}
                      </div>
                    </div>
                    <div className="bg-[#202020] rounded-lg p-3">
                      <div className="text-[#404040] text-sm mb-1">Teslim Edilecek Konum</div>
                      <div className="text-white font-medium text-sm" title={deliveryLocation?.address}>
                        {deliveryLocation?.address}
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