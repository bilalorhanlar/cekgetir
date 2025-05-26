'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useState } from 'react'
import YolYardimModal from '@/components/hizmet-selection/yol-yardim'
import OzelCekiciModal from '@/components/hizmet-selection/ozel-cekici'
import SehirlerArasiModal from '@/components/hizmet-selection/sehirler-arasi'
import CookieConsent from '@/components/CookieConsent'

export default function Home() {
  const [activeModal, setActiveModal] = useState(null)

  const handleModalClose = () => {
    setActiveModal(null)
  }

  const serviceOptions = [
    {
      id: 'sehirler-arasi',
      title: 'Şehirler Arası',
      description: 'Şehirler arası araç transferi',
      icon: (
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="M224 96.8V96a56.06 56.06 0 0 0-56-56h-8a16 16 0 0 0-16 16v120h-16V72a8 8 0 0 0-8-8H16A16 16 0 0 0 0 80v104a32 32 0 0 0 56 21.13A32 32 0 0 0 111 192h82a32 32 0 0 0 63-8v-48a40.07 40.07 0 0 0-32-39.2M160 56h8a40 40 0 0 1 40 40v8a8 8 0 0 0 8 8a24 24 0 0 1 24 24v20.31a31.71 31.71 0 0 0-16-4.31a32.06 32.06 0 0 0-31 24h-33Zm-48 24v96h-1a32 32 0 0 0-55-13.13a31.9 31.9 0 0 0-40-6.56V80ZM32 200a16 16 0 1 1 16-16a16 16 0 0 1-16 16m48 0a16 16 0 1 1 16-16a16 16 0 0 1-16 16m144 0a16 16 0 1 1 16-16a16 16 0 0 1-16 16"/></svg>
      )
    },
    {
      id: 'ozel-cekici',
      title: 'Çekici Hizmeti',
      description: 'Araç çekme ve taşıma hizmetleri',
      icon: (
        <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15 10h5.39l-3.33-4H15v4m2.5 8.5c.39 0 .74-.13 1.04-.43c.3-.3.46-.65.46-1.07c0-.39-.16-.74-.46-1.04c-.3-.3-.65-.46-1.04-.46c-.42 0-.77.16-1.07.46c-.3.3-.43.65-.43 1.04c0 .42.13.77.43 1.07c.3.3.65.43 1.07.43M6 18.5c.44 0 .8-.13 1.08-.43s.42-.65.42-1.07c0-.39-.14-.74-.42-1.04c-.28-.3-.64-.46-1.08-.46c-.44 0-.8.16-1.08.46c-.28.3-.42.65-.42 1.04c0 .42.14.77.42 1.07c.28.3.64.43 1.08.43M18 4l5 6v7h-2.5c0 .83-.31 1.53-.91 2.13c-.59.59-1.29.87-2.09.87c-.83 0-1.53-.28-2.12-.87c-.6-.6-.88-1.3-.88-2.13H9c0 .83-.3 1.53-.89 2.13c-.61.59-1.3.87-2.11.87c-.81 0-1.5-.28-2.11-.87C3.3 18.53 3 17.83 3 17H1v-4h8.19L3 8.11V11H1V5h1l11 6.06V4h5Z"/></svg>
      )
    },
    {
      id: 'yol-yardim',
      title: 'Yol Yardım',
      description: 'Akü takviyesi, lastik değişimi vs.',
      icon: (
        <svg className="w-8 h-8"  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path strokeLinecap="round" d="M6 12h4m4 0h4m-9 5.196l2-3.464m2-3.464l2-3.464m0 10.392l-2-3.464m-2-3.464L9 6.804M7 3.338A9.954 9.954 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5"/><path strokeLinecap="round" d="M15 17.197A6 6 0 1 1 17.197 15"/></g></svg>
      )
    }
    
  ]

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <main className="min-h-screen bg-white ">
        <CookieConsent />
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Çekgetir Yol Yardım"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/75 to-black/30"></div>
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center">
            {/* Sol taraf - Başlık ve Açıklama */}
            <div className="w-full lg:w-2/3 mb-4 lg:mb-0 mt-16 lg:mt-0 lg:pr-24">
              <div className="text-white">
                <h1 className="text-3xl md:text-5xl text-center lg:text-left font-bold mb-6">
                Şehirler Arası Araç Taşıma Ve Yol Yardım Hizmeti
                </h1>
                <p className="text-lg md:text-xl mb-8 text-center lg:text-left text-gray-300">
                  Çekici, lastik, akü ve tüm yol yardım hizmetleriyle yanınızdayız
                </p>
              </div>
            </div>

            {/* Sağ taraf - Hizmet Seçimi */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-6 shadow-xl border border-white/20 hover:border-white/30">
                <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6">Hizmet Seçin</h2>
                <div className="grid grid-cols-1 gap-3">
                  {serviceOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setActiveModal(option.id)}
                      className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-colors text-left group"
                    >
                      <div className="text-yellow-400 group-hover:scale-110 transition-transform">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-base">{option.title}</h4>
                        <p className="text-sm text-gray-300">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Neden Biz Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">Neden Bizi Tercih Etmelisiniz?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">7/24 Hizmet</h3>
                <p className="text-gray-600">Gece gündüz demeden, her an yanınızdayız. Acil durumlarınızda hızlı çözüm sunuyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Güvenilir Hizmet</h3>
                <p className="text-gray-600">Profesyonel ekip ve modern ekipmanlarla güvenli ve kaliteli hizmet garantisi.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Uygun Fiyat</h3>
                <p className="text-gray-600">Rekabetçi fiyatlar ve şeffaf fiyatlandırma politikası ile bütçenize uygun çözümler.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hizmetler Section */}
        <section id="hizmetler" className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-black">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Hizmetlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Yol Yardım</h3>
                <p className="text-gray-600">Aracınız yolda kaldığında en hızlı yol yardım desteğini sağlıyoruz. İhtiyacınızı bize iletmeniz yeterli. Gerekli ekipleri sizin adınıza yönlendiriyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Çekici Hizmeti</h3>
                <p className="text-gray-600">Aracınız mı çekilmeli? Konumunuza uygun çekiciyi hızlıca ayarlıyoruz. Süreci baştan sona biz takip ediyoruz.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Şehirler Arası Transfer</h3>
                <p className="text-gray-600">Aracınızı bir şehirden başka bir şehre taşıtmak mı istiyorsunuz? Talebinizi alıyor, sizin için en uygun firmayı görevlendiriyoruz. Siz sadece teslimat zamanını takip edin.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nasıl Çalışır Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">Nasıl Çalışır?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-400">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-black">Hizmet Seçin</h3>
                <p className="text-gray-600">İhtiyacınıza uygun hizmeti seçin</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-400">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-black">Bilgileri Girin</h3>
                <p className="text-gray-600">Konum ve araç bilgilerinizi girin</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-400">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-black">Onay Alın</h3>
                <p className="text-gray-600">Fiyat teklifini onaylayın</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-400">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-black">Yardım Alın</h3>
                <p className="text-gray-600">Ekipler yanınızda olacak</p>
              </div>
            </div>
          </div>
        </section>

        {/* İletişim CTA Section */}
        <section className="py-16 px-4 bg-yellow-400">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-black">Yolda mı kaldınız?</h2>
            <p className="text-xl mb-8 text-black/80">Tüm yol yardım hizmetleri için 7/24 yanınızdayız!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+905404901000" 
                className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 540 490 10 00
              </a>
              <a 
                href="https://wa.me/905404901000" 
                target="_blank"
                className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1EA952] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {activeModal === 'yol-yardim' && (
        <YolYardimModal onClose={handleModalClose} />
      )}
      {activeModal === 'ozel-cekici' && (
        <OzelCekiciModal onClose={handleModalClose} />
      )}
      {activeModal === 'sehirler-arasi' && (
        <SehirlerArasiModal onClose={handleModalClose} />
      )}

      <Footer />
    </>
  )
}