'use client'

import { useState, useEffect } from 'react'
import api from '@/utils/axios'

export default function SSSClient() {
  const [openIndex, setOpenIndex] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/faq')
        setFaqs(response.data)
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        setError('SSS\'ler yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">SSS'ler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (faqs.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Henüz SSS bulunmuyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {faqs.map((faq) => (
        <div 
          key={faq.id} 
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
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
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
