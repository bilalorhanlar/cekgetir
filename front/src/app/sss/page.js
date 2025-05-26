'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import api from '@/utils/axios'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/api/faq')
        setFaqs(response.data)
      } catch (err) {
        setError('SSS verileri yüklenirken bir hata oluştu')
        console.error('SSS yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Çekgetir SSS"
              fill
              className="object-cover transform scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Sıkça Sorulan Sorular
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed">
                Merak ettiğiniz tüm soruların cevapları burada
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 md:-mt-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {faqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <button
                      className="w-full px-6 sm:px-8 py-4 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pr-4">{faq.question}</h3>
                      <svg
                        className={`w-6 h-6 flex-shrink-0 transform transition-transform duration-300 ${openIndex === faq.id ? 'rotate-180' : ''} text-yellow-500`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openIndex === faq.id && (
                      <div className="px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-t border-gray-100">
                        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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