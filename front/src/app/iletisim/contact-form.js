'use client'

import { useState } from 'react'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function ContactForm() {
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
          <option value="is-ortakligi">İş Ortaklığı</option>
          <option value="genel">Genel Bilgi</option>
          <option value="genel">Şikayet</option>
          <option value="genel">Öneri</option>
          <option value="genel">İstek</option>
          <option value="genel">Toplu Çekici Hizmeti</option>
          <option value="cekici">Çekici Hizmeti</option>
          <option value="lastik">Yol Yardım Hizmeti</option>
          <option value="kurtarma">Araç Kurtarma Hizmeti</option>
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
  )
} 