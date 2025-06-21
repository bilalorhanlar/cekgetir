import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import SSSClient from './sss-client'

export const metadata = {
  title: 'Sık Sorulan Sorular',
  description: 'Çekgetir hakkında sık sorulan sorular. Yol yardım, çekici hizmeti ve şehirler arası araç taşıma hakkında merak edilenler.',
  keywords: 'çekgetir sss, yol yardım soruları, çekici hizmeti sık sorulan sorular, araç taşıma sss',
  openGraph: {
    title: 'Sık Sorulan Sorular | Çekgetir',
    description: 'Çekgetir hakkında sık sorulan sorular. Yol yardım, çekici hizmeti ve şehirler arası araç taşıma hakkında merak edilenler.',
  },
}

// Static FAQ verileri
const staticFaqs = [
  {
    id: 1,
    question: "Çekgetir hangi hizmetleri sunuyor?",
    answer: "Çekgetir olarak şehirler arası araç taşıma, çekici hizmeti ve yol yardım hizmetleri sunuyoruz. Akü takviyesi, lastik değişimi, yakıt ikmali gibi acil durumlarda da yanınızdayız."
  },
  {
    id: 2,
    question: "Hangi şehirlerde hizmet veriyorsunuz?",
    answer: "Türkiye genelinde tüm şehirlerde hizmet vermekteyiz. İstanbul, Ankara, İzmir ve diğer tüm illerde anlaşmalı iş ortaklarımız bulunmaktadır."
  },
  {
    id: 3,
    question: "7/24 hizmet veriyor musunuz?",
    answer: "Evet, 7 gün 24 saat kesintisiz hizmet vermekteyiz. Acil durumlarınızda her zaman bize ulaşabilirsiniz."
  },
  {
    id: 4,
    question: "Fiyat nasıl hesaplanıyor?",
    answer: "Fiyatlar mesafe, araç tipi, hizmet türü ve aciliyet durumuna göre değişmektedir. Size en uygun fiyat teklifini sunuyoruz."
  },
  {
    id: 5,
    question: "Ödeme nasıl yapılıyor?",
    answer: "Ödeme işlemi hizmet tamamlandıktan sonra nakit veya kredi kartı ile yapılabilmektedir. Şehirler arası taşıma hizmetlerinde ön ödeme de kabul ediyoruz."
  },
  {
    id: 6,
    question: "Araç taşıma süresi ne kadar?",
    answer: "Şehirler arası araç taşıma süresi mesafeye göre değişmektedir. Genellikle 1-3 gün içerisinde teslimat yapılmaktadır."
  },
  {
    id: 7,
    question: "Sigorta kapsamı var mı?",
    answer: "Evet, tüm hizmetlerimiz sigorta kapsamındadır. Araçlarınız güvenle taşınmaktadır."
  },
  {
    id: 8,
    question: "Hangi araç tiplerini taşıyorsunuz?",
    answer: "Binek araçlar, ticari araçlar, motosikletler ve özel araçlar dahil olmak üzere tüm araç tiplerini taşıyoruz."
  }
]

export default function SSSPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] sm:h-[65vh] md:h-[100vh] flex text-center items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/beyaz.jpeg"
              alt="Çekgetir SSS"
              fill
              className="object-cover transform scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-white"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Sıkça Sorulan Sorular
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed md:mb-20 lg:mb-24">
                Merak ettiğiniz tüm soruların cevapları burada
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 px-5 sm:px-8 lg:px-10 -mt-24 sm:-mt-48 md:-mt-96 relative z-10">
          <div className="max-w-4xl mx-auto">
            <SSSClient faqs={staticFaqs} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-black">
              Başka sorunuz var mı?
            </h2>
            <p className="text-xl sm:text-2xl mb-8 sm:mb-10 text-black/90">
              7/24 yanınızdayız!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <a 
                href="tel:+05404901000" 
                className="group inline-flex items-center justify-center bg-black text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +90 540 490 10 00
              </a>
              <a 
                href="https://wa.me/905404901000" 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center bg-[#25D366] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold hover:bg-[#1EA952] transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}