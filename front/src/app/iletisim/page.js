import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import ContactForm from './contact-form'

export const metadata = {
  title: 'İletişim',
  description: 'Çekgetir ile iletişime geçin. 7/24 yol yardım, çekici hizmeti ve şehirler arası araç taşıma için bize ulaşın.',
  keywords: 'çekgetir iletişim, yol yardım telefon, çekici hizmeti iletişim, araç kurtarma telefon',
  openGraph: {
    title: 'İletişim | Çekgetir',
    description: 'Çekgetir ile iletişime geçin. 7/24 yol yardım, çekici hizmeti ve şehirler arası araç taşıma için bize ulaşın.',
  },
}

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] sm:h-[65vh] md:h-[100vh] flex text-center items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/sari.jpeg"
              alt="Çekgetir İletişim"
              fill
              className="object-cover transform scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-white"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                İletişim
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed md:mb-20 lg:mb-24">
              Bizimle iletişime geçmek için aşağıdaki formu doldurabilir ya da diğer iletişim kanallarımızdan ulaşabilirsiniz
              </p>
            </div>
          </div>
        </section>
        
        {/* İletişim Bilgileri ve Form */}
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 -mt-24 sm:-mt-48 md:-mt-64 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* İletişim Bilgileri */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">İletişim Bilgileri</h2>
              
              <div className="space-y-8 sm:space-y-14">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Adres</h3>
                    <p className="text-sm sm:text-base text-black hover:text-yellow-500 transition-colors">
                      Ferhatpaşa, Anadolu Cd. No:74, 34888 Ataşehir/İstanbul
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Telefon</h3>
                    <a 
                      href="tel:+905404901000" 
                      className="text-sm sm:text-base text-black hover:text-yellow-500 transition-colors"
                    >
                      +90 540 490 10 00
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">E-posta</h3>
                    <a 
                      href="mailto:info@cekgetir.com" 
                      className="text-sm sm:text-base text-black hover:text-yellow-500 transition-colors"
                    >
                      info@cekgetir.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Çalışma Saatleri</h3>
                    <p className="text-sm sm:text-base text-black">7/24 Hizmet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim Formu */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">Bize Ulaşın</h2>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}