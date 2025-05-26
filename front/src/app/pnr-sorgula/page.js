'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '@/components/Navbar'

export default function PnrSorgula() {
  const [pnr, setPnr] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sayfa yüklendiğinde localStorage'dan PNR'ı kontrol et
  useEffect(() => {
    const savedPnr = localStorage.getItem('lastPnr')
    if (savedPnr) {
      setPnr(savedPnr)
      handlePnrQuery(savedPnr)
    }
  }, [])

  const handlePnrQuery = async (pnrNumber) => {
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await axios.get(`/api/orders/pnr/${pnrNumber.toUpperCase()}`)
      setOrder(response.data)
      // Başarılı sorgulamada PNR'ı localStorage'a kaydet
      localStorage.setItem('lastPnr', pnrNumber)
    } catch (err) {
      // Hata mesajını kullanıcı dostu bir şekilde göster
      setError('Böyle bir sipariş bulunamadı. Lütfen talep numaranızı kontrol edin.')
      // Hata durumunda localStorage'dan PNR'ı sil
      localStorage.removeItem('lastPnr')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    handlePnrQuery(pnr)
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">Talep No Sorgulama</h1>
            <p className="text-gray-400 text-base">Talep numaranızı girerek siparişinizin durumunu öğrenebilirsiniz.</p>
          </div>

          <div className="bg-[#202020] rounded-2xl p-8 shadow-xl border border-[#404040] mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pnr" className="block text-base font-medium text-white mb-2">
                  Talep No Numarası
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pnr"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    className="w-full px-5 py-3 bg-[#141414] border-2 border-[#404040] rounded-xl text-white placeholder-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base transition-all duration-300"
                    placeholder="Talep numaranızı girin"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Sorgulanıyor...</span>
                  </div>
                ) : 'Sorgula'}
              </button>
            </form>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 text-base">{error}</p>
              </div>
            </div>
          )}

          {order && (
            <div className="mt-8">
              {/* Durum ve Ödeme Bilgileri - Üstte Büyük Kartlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Sipariş Durumu Kartı */}
                <div className="bg-[#202020] rounded-2xl p-8 flex flex-col items-center justify-center border border-[#404040] shadow-xl relative overflow-hidden">
                  <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-pulse
                    ${order.status === 'TAMAMLANDI' ? 'bg-green-500/20 text-green-500 border-4 border-green-500/40' :
                      order.status === 'ONAY_BEKLIYOR' ? 'bg-yellow-500/20 text-yellow-500 border-4 border-yellow-500/40' :
                      order.status === 'IPTAL_EDILDI' ? 'bg-red-500/20 text-red-500 border-4 border-red-500/40' :
                      order.status === 'TRANSFER_SURECINDE' ? 'bg-purple-500/20 text-purple-500 border-4 border-purple-500/40' :
                      'bg-blue-500/20 text-blue-500 border-4 border-blue-500/40'}
                  `}>
                    {/* Duruma göre ikon */}
                    {order.status === 'TAMAMLANDI' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    {order.status === 'ONAY_BEKLIYOR' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                    )}
                    {order.status === 'IPTAL_EDILDI' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {order.status === 'TRANSFER_SURECINDE' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4m0 0l-2-2m2 2l2-2" /></svg>
                    )}
                    {order.status !== 'TAMAMLANDI' && order.status !== 'ONAY_BEKLIYOR' && order.status !== 'IPTAL_EDILDI' && order.status !== 'TRANSFER_SURECINDE' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                    )}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {order.status === 'TAMAMLANDI' ? 'Tamamlandı' :
                      order.status === 'ONAY_BEKLIYOR' ? 'Onay Bekliyor' :
                      order.status === 'ONAYLANDI' ? 'Onaylandı' :
                      order.status === 'CEKICI_YONLENDIRILIYOR' ? 'Çekici Yönlendiriliyor' :
                      order.status === 'TRANSFER_SURECINDE' ? 'Transfer Sürecinde' :
                      order.status === 'IPTAL_EDILDI' ? 'İptal Edildi' :
                      'Bilinmiyor'}
                  </div>
                  <div className="text-[#bdbdbd] text-sm">Sipariş Durumu</div>
                </div>
                {/* Ödeme Durumu Kartı */}
                <div className="bg-[#202020] rounded-2xl p-8 flex flex-col items-center justify-center border border-[#404040] shadow-xl relative overflow-hidden">
                  <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-pulse
                    ${order.paymentStatus === 'ODENDI' ? 'bg-green-500/20 text-green-500 border-4 border-green-500/40' :
                      order.paymentStatus === 'ODEME_BEKLIYOR' ? 'bg-yellow-500/20 text-yellow-500 border-4 border-yellow-500/40' :
                      order.paymentStatus === 'IPTAL_EDILDI' ? 'bg-red-500/20 text-red-500 border-4 border-red-500/40' :
                      order.paymentStatus === 'IADE_EDILDI' ? 'bg-blue-500/20 text-blue-500 border-4 border-blue-500/40' :
                      'bg-gray-500/20 text-gray-500 border-4 border-gray-500/40'}
                  `}>
                    {/* Ödeme durumuna göre ikon */}
                    {order.paymentStatus === 'ODENDI' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                    )}
                    {order.paymentStatus === 'ODEME_BEKLIYOR' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                    )}
                    {order.paymentStatus === 'IPTAL_EDILDI' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {order.paymentStatus === 'IADE_EDILDI' && (
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12v-8m0 0l-3 3m3-3l3 3" /></svg>
                    )}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {order.paymentStatus === 'ODENDI' ? 'Ödendi' :
                      order.paymentStatus === 'ODEME_BEKLIYOR' ? 'Ödeme Bekliyor' :
                      order.paymentStatus === 'IPTAL_EDILDI' ? 'İptal Edildi' :
                      order.paymentStatus === 'IADE_EDILDI' ? 'İade Edildi' :
                      'Bilinmiyor'}
                  </div>
                  <div className="text-[#bdbdbd] text-sm">Ödeme Durumu</div>
                  {/* Tutar */}
                  <div className="mt-4 text-2xl font-bold text-yellow-500">
                    {order.price.toLocaleString('tr-TR')} TL
                  </div>
                </div>
              </div>
              {/* Bilgi Kartları - Modern ve İkonlu */}
              <div className="grid gap-6 mt-8 grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto]">
                {/* Ödeme Bilgileri - üstte tam genişlik, 2x2 grid */}
                <div className="md:col-span-2 bg-[#202020] rounded-2xl p-6 border border-[#404040] shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M2 11h20" /></svg>
                    <span className="text-lg font-bold text-white">Ödeme Bilgileri</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className=" rounded-lg p-4 flex flex-col">
                      <span className="text-[#bdbdbd] text-xs mb-1">Banka</span>
                      <span className="text-white font-medium">Garanti Bankası</span>
                    </div>
                    <div className=" rounded-lg p-4 flex flex-col">
                      <span className="text-[#bdbdbd] text-xs mb-1">Hesap Sahibi</span>
                      <span className="text-white font-medium">Ömer Kaya</span>
                    </div>
                    <div className="bg-[#141414] rounded-lg p-4 flex flex-col">
                      <span className="text-[#bdbdbd] text-xs mb-1">IBAN</span>
                      <span className="text-white font-mono tracking-widest">TR12 3456 7890 1234 5678 9012 34</span>
                    </div>
                    <div className=" rounded-lg p-4 flex flex-col">
                      <span className="text-[#bdbdbd] text-xs mb-1">Açıklama</span>
                      <span className="text-white font-medium">Talep No: {order.pnrNo}</span>
                    </div>
                  </div>
                </div>
                {/* Hizmet Bilgileri - sağ altta, dinamik */}
                <div className="bg-[#202020] rounded-2xl p-6 border border-[#404040] shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span className="text-lg font-bold text-white">Hizmet Bilgileri</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <div className="text-[#bdbdbd] text-sm mb-1">Hizmet</div>
                      <div className="text-white font-medium">
                        {order.serviceType === 'YOL_YARDIM' ? 'Yol Yardım' : order.serviceType === 'OZEL_CEKICI' ? 'Özel Çekici' : order.serviceType === 'TOPLU_CEKICI' ? 'Toplu Çekici' : ''}
                      </div>
                    </div>
                    {order.serviceType === 'YOL_YARDIM' ? (
                      <>
                        <div>
                          <div className="text-[#bdbdbd] text-sm mb-1">Konum</div>
                          <div className="text-white font-medium">{order.breakdownLocation}</div>
                        </div>
                        {order.breakdownDescription && (
                          <div>
                            <div className="text-[#bdbdbd] text-sm mb-1">Arıza Tipi</div>
                            <div className="text-white font-medium">{order.breakdownDescription}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-[#bdbdbd] text-sm mb-1">Teslim Alınacak</div>
                          <div className="text-white font-medium">{order.pickupLocation}</div>
                        </div>
                        <div>
                          <div className="text-[#bdbdbd] text-sm mb-1">Bırakılacak</div>
                          <div className="text-white font-medium">{order.dropoffLocation}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* Araç Bilgileri - sol altta, dinamik */}
                <div className="bg-[#202020] rounded-2xl p-6 border border-[#404040] shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="6" rx="2" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /></svg>
                    <span className="text-lg font-bold text-white">Araç Bilgileri</span>
                  </div>
                  {order.serviceType === 'TOPLU_CEKICI' && order.bulkVehicles ? (
                    <div className="space-y-2">
                      {order.bulkVehicles.map((vehicle, index) => (
                        <div key={vehicle.id} className="border-b border-[#404040] pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                          <div className="text-yellow-500 font-medium mb-1">Araç {index + 1}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[#bdbdbd] text-xs mb-0.5">Marka</div>
                              <div className="text-white">{vehicle.marka}</div>
                            </div>
                            <div>
                              <div className="text-[#bdbdbd] text-xs mb-0.5">Model</div>
                              <div className="text-white">{vehicle.model}</div>
                            </div>
                            <div>
                              <div className="text-[#bdbdbd] text-xs mb-0.5">Yıl</div>
                              <div className="text-white">{vehicle.yil}</div>
                            </div>
                            <div>
                              <div className="text-[#bdbdbd] text-xs mb-0.5">Plaka</div>
                              <div className="text-white font-mono">{vehicle.plaka}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[#bdbdbd] text-xs mb-0.5">Marka</div>
                        <div className="text-white">{order.vehicleBrand}</div>
                      </div>
                      <div>
                        <div className="text-[#bdbdbd] text-xs mb-0.5">Model</div>
                        <div className="text-white">{order.vehicleModel}</div>
                      </div>
                      <div>
                        <div className="text-[#bdbdbd] text-xs mb-0.5">Yıl</div>
                        <div className="text-white">{order.vehicleYear}</div>
                      </div>
                      <div>
                        <div className="text-[#bdbdbd] text-xs mb-0.5">Plaka</div>
                        <div className="text-white font-mono">{order.vehiclePlate}</div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Müşteri Bilgileri - en altta tam genişlik, başlık-değer çiftleri yan yana kutucuk gibi */}
                <div className="md:col-span-2 bg-[#202020] rounded-2xl p-6 border border-[#404040] shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                    <span className="text-lg font-bold text-white">Müşteri Bilgileri</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {order.companyName ? (
                      <>
                        <div className=" rounded-lg p-4 flex flex-col">
                          <span className="text-[#bdbdbd] text-xs mb-1">Firma Adı</span>
                          <span className="text-white font-medium">{order.companyName}</span>
                        </div>
                        <div className=" rounded-lg p-4 flex flex-col">
                          <span className="text-[#bdbdbd] text-xs mb-1">Vergi No</span>
                          <span className="text-white font-medium">{order.taxNumber}</span>
                        </div>
                        <div className=" rounded-lg p-4 flex flex-col">
                          <span className="text-[#bdbdbd] text-xs mb-1">Vergi Dairesi</span>
                          <span className="text-white font-medium">{order.taxOffice}</span>
                        </div>
                      </>
                    ) : (
                      <div className=" rounded-lg p-4 flex flex-col">
                        <span className="text-[#bdbdbd] text-xs mb-1">Ad Soyad</span>
                        <span className="text-white font-medium">{order.customerName} {order.customerSurname}</span>
                      </div>
                    )}
                    <div className=" rounded-lg p-4 flex flex-col">
                      <span className="text-[#bdbdbd] text-xs mb-1">Telefon</span>
                      <span className="text-white font-medium">{order.customerPhone}</span>
                    </div>
                    {order.customerEmail && (
                      <div className=" rounded-lg p-4 flex flex-col">
                        <span className="text-[#bdbdbd] text-xs mb-1">E-posta</span>
                        <span className="text-white font-medium">{order.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 