'use client'

import { useState } from 'react'

export default function SSSClient({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null)

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
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
