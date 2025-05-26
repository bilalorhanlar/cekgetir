'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'genel',
    message: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/api/contact', formData)
      toast.success('Mesajınız başarıyla gönderildi!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'genel',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[50vh] sm:h-[40vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/home.jpeg"
              alt="Çekgetir İletişim"
              fill
              className="object-cover brightness-50"
            />
          </div>
          <div className="relative z-10 text-center text-white px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">İletişim</h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto">7/24 Tüm Yol Yardım Hizmetleri İçin Bize Ulaşın</p>
          </div>
        </section>

        {/* İletişim Bilgileri ve Form */}
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* İletişim Bilgileri */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">İletişim Bilgileri</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Adres</h3>
                    <p className="text-sm sm:text-base text-black">Ferhatpaşa, Anadolu Cd. No:74, 34888 Ataşehir/İstanbul</p>
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
                    <p className="text-sm sm:text-base text-black">+90 540 490 10 00</p>
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
                    <p className="text-sm sm:text-base text-black">info@cekgetir.com</p>
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
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-black">Bize Ulaşın</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                    Hizmet Türü
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base text-gray-900"
                  >
                    <option value="genel">Genel Bilgi</option>
                    <option value="cekici">Çekici Hizmeti</option>
                    <option value="lastik">Lastik Yardımı</option>
                    <option value="aku">Akü Takviye</option>
                    <option value="yakit">Yakıt İkmali</option>
                    <option value="kurtarma">Araç Kurtarma</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base text-gray-900"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-yellow-400 text-black py-2 sm:py-3 px-4 sm:px-6 rounded-md font-semibold transition-colors text-sm sm:text-base ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
                  }`}
                >
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Harita */}
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-black">Konum</h2>
            <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.201123456789!2d29.1271!3d40.9782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7d8d8d8d8d8%3A0x8d8d8d8d8d8d8d8d!2sFerhatpa%C5%9Fa%2C%20Anadolu%20Cd.%20No%3A74%2C%2034888%20Ata%C5%9Fehir%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1234567890!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 