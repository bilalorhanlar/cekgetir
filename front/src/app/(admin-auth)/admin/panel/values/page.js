'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function ValuesPage() {
  const router = useRouter()
  const [variables, setVariables] = useState({
    topluCekici: {
      sehirler: [],
      fiyatlandirma: {
        baseUcret: 0,
        kmBasiUcret: 0,
        ozelCekiciUcreti: {},
        segmentler: {},
        aracSayisiKatsayisi: {}
      }
    },
    ortak: {
      aracMarkalari: [],
      aracModelleri: {},
      segmentler: []
    },
    yolYardim: {
      id: 1,
      basePrice: 0,
      baseLng: 29.1267,
      baseLat: 40.9877,
      basePricePerKm: 0,
      nightPrice: 0,
      arizaTipleri: {
        yakitBitti: 0,
        akuBitti: 0,
        motorArizasi: 0,
        lastikArizasi: 0
      },
      segmentler: []
    },
    ozelCekici: {
      id: 0,
      nightPrice: 0
    }
  })

  const [carSegments, setCarSegments] = useState({
    'yol-yardim': [],
    'ozel-cekici': [],
    'toplu-cekici': []
  });

  const [carStatuses, setCarStatuses] = useState({
    'yol-yardim': [],
    'ozel-cekici': [],
    'toplu-cekici': []
  });

  const [ozelCekiciSehirler, setOzelCekiciSehirler] = useState([]);
  const [topluCekiciSehirler, setTopluCekiciSehirler] = useState([]);
  const [activeTab, setActiveTab] = useState('toplu-cekici');
  const [loading, setLoading] = useState(true);
  const [kmFiyatlar, setKmFiyatlar] = useState([]);
  const [showAllCities, setShowAllCities] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllOzelCekiciCities, setShowAllOzelCekiciCities] = useState(false);
  const [ozelCekiciSearchTerm, setOzelCekiciSearchTerm] = useState('');
  const [topluCekiciBasePrice, setTopluCekiciBasePrice] = useState(0);
  const [isLoadingTopluCekici, setIsLoadingTopluCekici] = useState(true);
  const [isSavingSegments, setIsSavingSegments] = useState({
    'yol-yardim': false,
    'ozel-cekici': false,
    'toplu-cekici': false
  });
  const [isSavingStatuses, setIsSavingStatuses] = useState({
    'yol-yardim': false,
    'ozel-cekici': false,
    'toplu-cekici': false
  });
  const [isSavingNumericValues, setIsSavingNumericValues] = useState({
    'yol-yardim': false,
    'ozel-cekici': false,
    'toplu-cekici': false
  });
  const [isSavingCity, setIsSavingCity] = useState({});

  const tabs = [
    { id: 'toplu-cekici', label: 'Toplu Çekici' },
    { id: 'ozel-cekici', label: 'Özel Çekici' },
    { id: 'yol-yardim', label: 'Yol Yardım' }
  ];

  useEffect(() => {
    // Token kontrolü
    const adminToken = localStorage.getItem('adminToken')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (!adminToken) {
      router.push('/admin/login')
      return
    }

    // Token süresi dolmuşsa çıkış yap
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('tokenExpiry')
      router.push('/admin/login')
      return
    }

    // Token süresi dolmak üzereyse yenile
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry) - 5 * 60 * 1000) { // 5 dakika kala
      refreshToken(adminToken)
    }

    fetchVariables()
    fetchCarSegments()
    fetchCarStatuses()
    fetchOzelCekiciSehirler()
    fetchTopluCekiciSehirler()
    fetchKmFiyatlar()
    fetchTopluCekici()
  }, [router])

  const refreshToken = async (token) => {
    try {
      const response = await api.post('/api/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const { access_token, expires_in } = response.data
        localStorage.setItem('adminToken', access_token)
        localStorage.setItem('tokenExpiry', (Date.now() + expires_in * 1000).toString())
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('tokenExpiry')
      router.push('/admin/login')
    }
  }

  const fetchVariables = async () => {
    try {
      const [yolYardimInfo, ozelCekiciInfo] = await Promise.all([
        api.get('/api/variables/yol-yardim'),
        api.get('/api/variables/ozel-cekici')
      ]);

      setVariables(prevState => ({
        ...prevState,
        yolYardim: yolYardimInfo.data,
        ozelCekici: ozelCekiciInfo.data
      }))
    } catch (error) {
      console.error('Error fetching variables:', error)
    }
  }

  const fetchCarSegments = async () => {
    try {
      const types = ['yol-yardim', 'ozel-cekici', 'toplu-cekici'];
      const segments = {};
      
      for (const type of types) {
        const response = await api.get(`/api/variables/car-segments?type=${type}`);
        segments[type] = response.data.map(segment => {
          const updatedSegment = {
            ...segment,
            price: segment.price ? String(segment.price) : '',
            type: type
          };
          return updatedSegment;
        });
      }
      
      setCarSegments(segments);
    } catch (error) {
      console.error('Frontend - Error fetching car segments:', error);
    }
  }

  const fetchCarStatuses = async () => {
    try {
      const types = ['yol-yardim', 'ozel-cekici', 'toplu-cekici'];
      const statuses = {};
      
      for (const type of types) {
        const response = await api.get(`/api/variables/car-statuses?type=${type}`);
        statuses[type] = response.data.map(status => {
          const updatedStatus = {
            ...status,
            price: status.price ? String(status.price) : '',
            type: type
          };
          return updatedStatus;
        });
      }
      
      setCarStatuses(statuses);
    } catch (error) {
      console.error('Frontend - Error fetching car statuses:', error);
    }
  }

  const fetchOzelCekiciSehirler = async () => {
    try {
      const response = await api.get('/api/variables/ozel-cekici/sehirler');
      setOzelCekiciSehirler(response.data);
    } catch (error) {
      console.error('Error fetching ozel cekici sehirler:', error);
    }
  }

  const fetchTopluCekiciSehirler = async () => {
    try {
      const response = await api.get('/api/variables/toplu-cekici/sehirler');
      setTopluCekiciSehirler(response.data);
    } catch (error) {
      console.error('Error fetching toplu cekici sehirler:', error);
    }
  }

  const fetchKmFiyatlar = async () => {
    try {
      const response = await api.get('/api/variables/toplu-cekici/km-fiyatlar');
      setKmFiyatlar(response.data);
      console.log('KM Bazlı Fiyatlandırma:', response.data);
    } catch (error) {
      console.error('Error fetching KM prices:', error);
    }
  };

  const fetchTopluCekici = async () => {
    try {
      setIsLoadingTopluCekici(true);
      const response = await api.get('/api/variables/toplu-cekici');
      if (response.data && response.data.basePrice) {
        setTopluCekiciBasePrice(response.data.basePrice);
      }
    } catch (error) {
      console.error('Error fetching toplu cekici:', error);
      toast.error('Toplu çekici bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingTopluCekici(false);
      setLoading(false);
    }
  };

  const handleOzelCekiciSehirUpdate = async (sehirAdi, basePrice, basePricePerKm) => {
    try {
      setIsSavingCity(prev => ({ ...prev, [sehirAdi]: true }));
      await api.patch(`/api/variables/ozel-cekici/sehirler/${sehirAdi}`, {
        basePrice,
        basePricePerKm
      });
      await fetchOzelCekiciSehirler();
      toast.success('Şehir fiyatlandırması başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating ozel cekici sehir:', error);
      toast.error('Şehir fiyatlandırması güncellenirken bir hata oluştu!');
    } finally {
      setIsSavingCity(prev => ({ ...prev, [sehirAdi]: false }));
    }
  }

  const handleTopluCekiciSehirUpdate = async (
    sehirAdi,
    basePrice,
    basePricePerKm,
    otoparkAdres,
    otoparkLat,
    otoparkLng,
    ozelCekiciBasePrice,
    ozelCekiciBasePricePerKm
  ) => {
    try {
      setIsSavingCity(prev => ({ ...prev, [sehirAdi]: true }));
      await api.patch(`/api/variables/toplu-cekici/sehirler/${sehirAdi}`, {
        basePrice,
        basePricePerKm,
        otoparkAdres,
        otoparkLat,
        otoparkLng,
        ozelCekiciBasePrice,
        ozelCekiciBasePricePerKm
      });
      await fetchTopluCekiciSehirler();
      toast.success('Şehir bilgileri başarıyla güncellendi!');
    } catch (error) {
      console.error('Error updating toplu çekici sehir:', error);
      toast.error('Şehir bilgileri güncellenirken bir hata oluştu!');
    } finally {
      setIsSavingCity(prev => ({ ...prev, [sehirAdi]: false }));
    }
  };

  const handleSaveNumericValues = async (type) => {
    try {
      setIsSavingNumericValues(prev => ({ ...prev, [type]: true }));
      if (type === 'yol-yardim') {
        await api.patch(`/api/variables/yol-yardim`, variables.yolYardim);
      } else if (type === 'ozel-cekici') {
        await api.patch(`/api/variables/ozel-cekici`, variables.ozelCekici);
      } else {
        await api.post(`/api/variables/${type}`, variables[type === 'toplu-cekici' ? 'topluCekici' : 'ozelCekici']);
      }
      toast.success('Değerler başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving numeric values:', error);
      toast.error('Değerler kaydedilirken bir hata oluştu!');
    } finally {
      setIsSavingNumericValues(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSaveCarSegments = async (type) => {
    try {
      setIsSavingSegments(prev => ({ ...prev, [type]: true }));

      if (!carSegments[type] || !Array.isArray(carSegments[type])) {
        throw new Error('Geçerli segment verisi bulunamadı');
      }

      const segmentsToUpdate = carSegments[type]
        .filter(segment => {
          if (!segment || typeof segment !== 'object') {
            return false;
          }
          if (!segment.id || isNaN(Number(segment.id))) {
            return false;
          }
          if (!segment.name || typeof segment.name !== 'string') {
            return false;
          }
          if (segment.price !== '' && isNaN(parseFloat(segment.price))) {
            return false;
          }
          return true;
        })
        .map(segment => {
          const price = segment.price === '' ? null : parseFloat(segment.price);
          const mappedSegment = {
            id: Number(segment.id),
            name: String(segment.name),
            price: price,
            type: type
          };
          return mappedSegment;
        });
      
      if (segmentsToUpdate.length === 0) {
        throw new Error('Güncellenecek geçerli segment bulunamadı');
      }
      
      const response = await api.patch(`/api/variables/car-segments/bulk/${type}`, segmentsToUpdate, {
        headers: {
          'Content-Type': 'application/json'
        }
      });   
      
      if (response.data && response.data.length > 0) {
        const updatedSegmentsMap = new Map(
          response.data.map(segment => [segment.id, segment])
        );

        const updatedSegments = carSegments[type].map(segment => {
          const updatedSegment = updatedSegmentsMap.get(segment.id);
          if (updatedSegment) {
            return {
              ...updatedSegment,
              price: updatedSegment.price === null ? '' : String(updatedSegment.price),
              type: type
            };
          }
          return segment;
        });

        setCarSegments(prev => {
          const newState = {
            ...prev,
            [type]: updatedSegments
          };
          return newState;
        });
        
        toast.success(`${type} segmentleri başarıyla güncellendi!`);
      } else {
        throw new Error('Kayıt başarısız: Sunucu yanıtı boş');
      }
    } catch (error) {
      console.error(`Frontend - Error saving ${type} segments:`, error);
      toast.error(`${type} segmentleri güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsSavingSegments(prev => ({ ...prev, [type]: false }));
    }
  }

  const handleSegmentChange = (type, segmentId, newPrice) => {
    if (!segmentId || isNaN(Number(segmentId))) {
      return;
    }

    setCarSegments(prev => {
      const newState = {
        ...prev,
        [type]: prev[type].map(s => {
          const updated = s.id === Number(segmentId) 
            ? { ...s, price: newPrice } 
            : s;
          return updated;
        })
      };
      return newState;
    });
  }

  const handleSaveCarStatuses = async (type) => {
    try {
      setIsSavingStatuses(prev => ({ ...prev, [type]: true }));
      if (!carStatuses[type] || !Array.isArray(carStatuses[type])) {
        throw new Error('Geçerli status verisi bulunamadı');
      }

      const statusesToUpdate = carStatuses[type]
        .filter(status => {
          if (!status || typeof status !== 'object') {
            return false;
          }
          if (!status.id || isNaN(Number(status.id))) {
            return false;
          }
          if (!status.name || typeof status.name !== 'string') {
            return false;
          }
          if (status.price !== '' && isNaN(parseFloat(status.price))) {
            return false;
          }
          return true;
        })
        .map(status => {
          const price = status.price === '' ? null : parseFloat(status.price);
          const mappedStatus = {
            id: Number(status.id),
            name: String(status.name),
            price: price,
            type: type
          };  
          return mappedStatus;
        });
      
      if (statusesToUpdate.length === 0) {
        throw new Error('Güncellenecek geçerli status bulunamadı');
      }
      
      const response = await api.patch(`/api/variables/car-statuses/bulk/${type}`, statusesToUpdate, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const updatedStatusesMap = new Map(
          response.data.map(status => [status.id, status])
        );

        const updatedStatuses = carStatuses[type].map(status => {
          const updatedStatus = updatedStatusesMap.get(status.id);
          if (updatedStatus) {
            return {
              ...updatedStatus,
              price: updatedStatus.price === null ? '' : String(updatedStatus.price),
              type: type
            };
          }
          return status;
        });
        
        setCarStatuses(prev => {
          const newState = {
            ...prev,
            [type]: updatedStatuses
          };
          return newState;
        });
        
        toast.success(`${type} durumları başarıyla kaydedildi!`);
      } else {
        throw new Error('Kayıt başarısız: Sunucu yanıtı boş');
      }
    } catch (error) {
      console.error(`Frontend - Error saving ${type} statuses:`, error);
      toast.error(`${type} durumları kaydedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setIsSavingStatuses(prev => ({ ...prev, [type]: false }));
    }
  }

  const handleStatusChange = (type, statusId, newPrice) => {
    if (!statusId || isNaN(Number(statusId))) {
      return;
    }

    setCarStatuses(prev => {
      const newState = {
        ...prev,
        [type]: prev[type].map(s => {
          const updated = s.id === Number(statusId) 
            ? { ...s, price: newPrice } 
            : s;
          return updated;
        })
      };
      return newState;
    });
  }

  const handleKmFiyatChange = async (id, field, value) => {
    try {
      const updatedFiyatlar = kmFiyatlar.map(fiyat => {
        if (fiyat.id === id) {
          return { ...fiyat, [field]: Number(value) };
        }
        return fiyat;
      });
      setKmFiyatlar(updatedFiyatlar);

      await api.patch(`/api/variables/toplu-cekici/km-fiyatlar/${id}`, {
        minKm: updatedFiyatlar.find(f => f.id === id).minKm,
        maxKm: updatedFiyatlar.find(f => f.id === id).maxKm,
        kmBasiUcret: updatedFiyatlar.find(f => f.id === id).kmBasiUcret
      });
    } catch (error) {
      console.error('Error updating KM price:', error);
      fetchKmFiyatlar(); // Hata durumunda orijinal verileri geri yükle
    }
  };

  const handleSaveTopluCekiciBasePrice = async () => {
    try {
      setIsLoadingTopluCekici(true);
      await api.patch('/api/variables/toplu-cekici', {
        basePrice: topluCekiciBasePrice
      });
      toast.success('Temel fiyat başarıyla güncellendi');
    } catch (error) {
      console.error('Error saving toplu cekici base price:', error);
      toast.error('Temel fiyat güncellenirken bir hata oluştu');
    } finally {
      setIsLoadingTopluCekici(false);
    }
  };

  const renderTopluCekiciSection = () => {
    if (loading || isLoadingTopluCekici) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Temel Değerler Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Temel Ücret</h2>
              <p className="text-sm text-gray-400 mt-1">Toplu çekici hizmetleri için temel ücret</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">₺</span>
              <span className="text-2xl font-bold text-yellow-500">{topluCekiciBasePrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                value={topluCekiciBasePrice}
                onChange={(e) => setTopluCekiciBasePrice(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent text-lg"
                disabled={isLoadingTopluCekici}
                placeholder="Temel ücret giriniz"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
            </div>
            
            <button
              onClick={handleSaveTopluCekiciBasePrice}
              disabled={isLoadingTopluCekici}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoadingTopluCekici ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Şehir Fiyatlandırma Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Şehir Fiyatlandırma</h2>
              <p className="text-sm text-gray-400 mt-1">Her şehir için temel ücret ve km başına ücret</p>
            </div>
          </div>
          
          {/* Arama Kutusu */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Şehir ara..."
              className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topluCekiciSehirler
              .filter(sehir => 
                sehir.sehirAdi.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => {
                const priorityCities = ['İstanbul', 'Ankara', 'İzmir', 'Sivas'];
                const aIndex = priorityCities.indexOf(a.sehirAdi);
                const bIndex = priorityCities.indexOf(b.sehirAdi);
                if (aIndex === -1 && bIndex === -1) return a.sehirAdi.localeCompare(b.sehirAdi);
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
              })
              .slice(0, showAllCities ? undefined : 4)
              .map((sehir) => (
                <div key={sehir.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-medium text-white">
                      {sehir.sehirAdi}
                    </label>
                  </div>
                  <div className="space-y-4">
                    {/* Base Ücret Bölümü */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333333]">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Base Ücret</h4>
                      <div className="relative">
                        <input
                          type="number"
                          value={sehir.basePrice}
                          onChange={(e) => {
                            const newSehirler = topluCekiciSehirler.map(s =>
                              s.id === sehir.id ? { ...s, basePrice: Number(e.target.value) } : s
                            );
                            setTopluCekiciSehirler(newSehirler);
                          }}
                          className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                          placeholder="Base Ücret"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                      </div>
                    </div>

                    {/* KM Bilgileri Bölümü */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333333]">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">KM Bilgileri</h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="number"
                            value={sehir.basePricePerKm}
                            onChange={(e) => {
                              const newSehirler = topluCekiciSehirler.map(s =>
                                s.id === sehir.id ? { ...s, basePricePerKm: Number(e.target.value) } : s
                              );
                              setTopluCekiciSehirler(newSehirler);
                            }}
                            className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                            placeholder="KM Başı Ücret"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺/km</span>
                        </div>
                      </div>
                    </div>

                    {/* Otopark Bilgileri Bölümü */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333333]">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Otopark Bilgileri</h4>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={sehir.otoparkAdres || ''}
                            onChange={(e) => {
                              const newSehirler = topluCekiciSehirler.map(s =>
                                s.id === sehir.id ? { ...s, otoparkAdres: e.target.value } : s
                              );
                              setTopluCekiciSehirler(newSehirler);
                            }}
                            className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                            placeholder="Otopark Adresi"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.000001"
                              value={sehir.otoparkLat || ''}
                              onChange={(e) => {
                                const newSehirler = topluCekiciSehirler.map(s =>
                                  s.id === sehir.id ? { ...s, otoparkLat: Number(e.target.value) } : s
                                );
                                setTopluCekiciSehirler(newSehirler);
                              }}
                              className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                              placeholder="Enlem"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Lat</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.000001"
                              value={sehir.otoparkLng || ''}
                              onChange={(e) => {
                                const newSehirler = topluCekiciSehirler.map(s =>
                                  s.id === sehir.id ? { ...s, otoparkLng: Number(e.target.value) } : s
                                );
                                setTopluCekiciSehirler(newSehirler);
                              }}
                              className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                              placeholder="Boylam"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Lng</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTopluCekiciSehirUpdate(
                        sehir.sehirAdi,
                        sehir.basePrice,
                        sehir.basePricePerKm,
                        sehir.otoparkAdres,
                        sehir.otoparkLat,
                        sehir.otoparkLng,
                        sehir.ozelCekiciBasePrice,
                        sehir.ozelCekiciBasePricePerKm
                      )}
                      disabled={isSavingCity[sehir.sehirAdi]}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
                    >
                      {isSavingCity[sehir.sehirAdi] ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Tümünü Göster/Gizle Butonu */}
          {topluCekiciSehirler.length > 4 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAllCities(!showAllCities)}
                className="px-6 py-2 bg-[#242424] text-white rounded-lg hover:bg-[#333333] transition-colors duration-200 text-sm font-medium border border-[#333333]"
              >
                {showAllCities ? 'Daha Az Göster' : 'Tümünü Göster'}
              </button>
            </div>
          )}
        </div>

        {/* KM Fiyatları Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">KM Bazlı Fiyatlandırma</h2>
              <p className="text-sm text-gray-400 mt-1">Mesafeye göre km başına ücretler</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kmFiyatlar.map((fiyat) => (
              <div key={fiyat.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {fiyat.minKm} - {fiyat.maxKm === 999999 ? '∞' : fiyat.maxKm} KM
                  </label>
                  <span className="text-xs text-gray-500">KM Başı Ücret</span>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={fiyat.kmBasiUcret}
                      onChange={(e) => handleKmFiyatChange(fiyat.id, 'kmBasiUcret', e.target.value)}
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segment Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Segment Katsayıları</h2>
              <p className="text-sm text-gray-400 mt-1">Araç segmentlerine göre fiyat katsayıları</p>
            </div>
            <button
              onClick={() => handleSaveCarSegments('toplu-cekici')}
              disabled={isSavingSegments['toplu-cekici']}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSavingSegments['toplu-cekici'] ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carSegments['toplu-cekici']?.map((segment) => (
              <div key={segment.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {segment.name}
                  </label>
                  <span className="text-xs text-gray-500">Katsayı</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={segment.price}
                    onChange={(e) => handleSegmentChange('toplu-cekici', segment.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Durum Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Durum Katsayıları</h2>
              <p className="text-sm text-gray-400 mt-1">Araç durumlarına göre fiyat katsayıları</p>
            </div>
            <button
              onClick={() => handleSaveCarStatuses('toplu-cekici')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
            >
              {isSavingStatuses['toplu-cekici'] ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carStatuses['toplu-cekici']?.map((status) => (
              <div key={status.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {status.name}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={status.price}
                    onChange={(e) => handleStatusChange('toplu-cekici', status.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderYolYardimSection = () => {
    return (
      <div className="space-y-8">
        {/* Temel Değerler Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Temel Değerler</h2>
            <button
              onClick={() => handleSaveNumericValues('yol-yardim')}
              disabled={isSavingNumericValues['yol-yardim']}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
            >
              {isSavingNumericValues['yol-yardim'] ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#242424] rounded-lg p-4 border border-[#333333]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Base Ücret</label>
              <div className="relative">
                <input
                  type="number"
                  value={variables.yolYardim.basePrice}
                  onChange={(e) => {
                    setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        basePrice: Number(e.target.value)
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
              </div>
            </div>
            <div className="bg-[#242424] rounded-lg p-4 border border-[#333333]">
              <label className="block text-sm font-medium text-gray-300 mb-2">KM Başı Ücret</label>
              <div className="relative">
                <input
                  type="number"
                  value={variables.yolYardim.basePricePerKm}
                  onChange={(e) => {
                    setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        basePricePerKm: Number(e.target.value)
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
              </div>
            </div>
            <div className="bg-[#242424] rounded-lg p-4 border border-[#333333]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Gece Ücreti Çarpanı</label>
              <div className="relative">
                <input
                  type="number"
                  value={variables.yolYardim.nightPrice}
                  onChange={(e) => {
                    setVariables(prev => ({
                      ...prev,
                      yolYardim: {
                        ...prev.yolYardim,
                        nightPrice: Number(e.target.value)
                      }
                    }));
                  }}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">x</span>
              </div>
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Konum Bilgileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#242424] rounded-lg p-4 border border-[#333333]">
                <label className="block text-sm font-medium text-gray-300 mb-2">Enlem</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={variables.yolYardim.baseLat}
                    onChange={(e) => {
                      setVariables(prev => ({
                        ...prev,
                        yolYardim: {
                          ...prev.yolYardim,
                          baseLat: Number(e.target.value)
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                    placeholder="Enlem değeri"
                  />
                </div>
              </div>
              <div className="bg-[#242424] rounded-lg p-4 border border-[#333333]">
                <label className="block text-sm font-medium text-gray-300 mb-2">Boylam</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    value={variables.yolYardim.baseLng}
                    onChange={(e) => {
                      setVariables(prev => ({
                        ...prev,
                        yolYardim: {
                          ...prev.yolYardim,
                          baseLng: Number(e.target.value)
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                    placeholder="Boylam değeri"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Segment Katsayıları</h2>
            <button
              onClick={() => handleSaveCarSegments('yol-yardim')}
              disabled={isSavingSegments['yol-yardim']}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
            >
              {isSavingSegments['yol-yardim'] ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carSegments['yol-yardim']?.map((segment) => (
              <div key={segment.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {segment.name}
                  </label>
                  <span className="text-xs text-gray-500">Katsayı</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={segment.price}
                    onChange={(e) => handleSegmentChange('yol-yardim', segment.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Durum Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Durum Katsayıları</h2>
            <button
              onClick={() => handleSaveCarStatuses('yol-yardim')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
            >
              {isSavingStatuses['yol-yardim'] ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carStatuses['yol-yardim']?.map((status) => (
              <div key={status.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {status.name}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={status.price}
                    onChange={(e) => handleStatusChange('yol-yardim', status.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOzelCekiciSection = () => {
    return (
      <div className="space-y-8">
        {/* Temel Değerler Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Gece Ücreti Çarpanı</h2>
              <p className="text-sm text-gray-400 mt-1">Özel çekici hizmetleri için gece ücreti çarpanı</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">x</span>
              <span className="text-2xl font-bold text-yellow-500">{variables.ozelCekici.nightPrice}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="number"
                value={variables.ozelCekici.nightPrice}
                onChange={(e) => {
                  setVariables(prev => ({
                    ...prev,
                    ozelCekici: {
                      ...prev.ozelCekici,
                      nightPrice: Number(e.target.value)
                    }
                  }));
                }}
                className="w-full px-4 py-3 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent text-lg"
                placeholder="Gece ücreti çarpanı giriniz"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">x</span>
            </div>
            
            <button
              onClick={() => handleSaveNumericValues('ozel-cekici')}
              disabled={isSavingNumericValues['ozel-cekici']}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSavingNumericValues['ozel-cekici'] ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Şehir Bazlı Fiyatlandırma Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Şehir Bazlı Fiyatlandırma</h2>
          </div>

          {/* Arama Kutusu */}
          <div className="mb-4">
            <input
              type="text"
              value={ozelCekiciSearchTerm}
              onChange={(e) => setOzelCekiciSearchTerm(e.target.value)}
              placeholder="Şehir ara..."
              className="w-full px-4 py-2 bg-[#242424] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ozelCekiciSehirler
              .filter(sehir => 
                sehir.sehirAdi.toLowerCase().includes(ozelCekiciSearchTerm.toLowerCase())
              )
              .sort((a, b) => {
                const priorityCities = ['İstanbul', 'Ankara', 'İzmir', 'Sivas'];
                const aIndex = priorityCities.indexOf(a.sehirAdi);
                const bIndex = priorityCities.indexOf(b.sehirAdi);
                if (aIndex === -1 && bIndex === -1) return a.sehirAdi.localeCompare(b.sehirAdi);
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
              })
              .slice(0, showAllOzelCekiciCities ? undefined : 4)
              .map((sehir) => (
                <div key={sehir.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      {sehir.sehirAdi}
                    </label>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={sehir.basePrice}
                        onChange={(e) => {
                          const newSehirler = ozelCekiciSehirler.map(s =>
                            s.id === sehir.id ? { ...s, basePrice: Number(e.target.value) } : s
                          );
                          setOzelCekiciSehirler(newSehirler);
                        }}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                        placeholder="Base Ücret"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={sehir.basePricePerKm}
                        onChange={(e) => {
                          const newSehirler = ozelCekiciSehirler.map(s =>
                            s.id === sehir.id ? { ...s, basePricePerKm: Number(e.target.value) } : s
                          );
                          setOzelCekiciSehirler(newSehirler);
                        }}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
                        placeholder="KM Başı Ücret"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺/km</span>
                    </div>
                    <button
                      onClick={() => handleOzelCekiciSehirUpdate(sehir.sehirAdi, sehir.basePrice, sehir.basePricePerKm)}
                      disabled={isSavingCity[sehir.sehirAdi]}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium relative"
                    >
                      {isSavingCity[sehir.sehirAdi] ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Tümünü Göster/Gizle Butonu */}
          {ozelCekiciSehirler.length > 4 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAllOzelCekiciCities(!showAllOzelCekiciCities)}
                className="px-6 py-2 bg-[#242424] text-white rounded-lg hover:bg-[#333333] transition-colors duration-200 text-sm font-medium border border-[#333333]"
              >
                {showAllOzelCekiciCities ? 'Daha Az Göster' : 'Tümünü Göster'}
              </button>
            </div>
          )}
        </div>

        {/* Segment Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Segment Katsayıları</h2>
            <button
              onClick={() => handleSaveCarSegments('ozel-cekici')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carSegments['ozel-cekici']?.map((segment) => (
              <div key={segment.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {segment.name}
                  </label>
                  <span className="text-xs text-gray-500">Katsayı</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={segment.price}
                    onChange={(e) => handleSegmentChange('ozel-cekici', segment.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Durum Kartı */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Durum Katsayıları</h2>
            <button
              onClick={() => handleSaveCarStatuses('ozel-cekici')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {carStatuses['ozel-cekici']?.map((status) => (
              <div key={status.id} className="bg-[#242424] rounded-lg p-4 border border-[#333333] hover:border-yellow-500/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    {status.name}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={status.price}
                    onChange={(e) => handleStatusChange('ozel-cekici', status.id, e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Değişkenler</h1>
              <p className="text-gray-400 mt-1">Sistem değişkenlerini ve katsayıları yönetin</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-8 border-b border-[#2a2a2a]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'toplu-cekici' && renderTopluCekiciSection()}
            {activeTab === 'yol-yardim' && renderYolYardimSection()}
            {activeTab === 'ozel-cekici' && renderOzelCekiciSection()}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #404040;
        }
      `}</style>
    </div>
  );
} 