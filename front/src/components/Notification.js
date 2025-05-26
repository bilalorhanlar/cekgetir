'use client'

import { useState, useEffect } from 'react'

export default function Notification() {
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const handleNotification = (event) => {
      setNotification(event.detail)
      setTimeout(() => setNotification(null), 5000) // 5 saniye sonra kapat
    }

    window.addEventListener('showNotification', handleNotification)
    return () => window.removeEventListener('showNotification', handleNotification)
  }, [])

  if (!notification) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`p-4 rounded-xl shadow-lg max-w-md w-full backdrop-blur-md border ${
        notification.type === 'success' 
          ? 'bg-[#202020]/95 border-yellow-400/30' 
          : 'bg-[#202020]/95 border-red-400/30'
      }`}>
        <div className="flex items-start gap-3">
          {notification.type === 'success' ? (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                className="w-4 h-4 text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                className="w-4 h-4 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h3 className={`font-semibold ${
              notification.type === 'success' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {notification.type === 'success' ? 'Başarılı!' : 'Hata!'}
            </h3>
            <p className="text-white/60 text-sm mt-0.5">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="flex-shrink-0 text-white/40 hover:text-white/60 transition-colors p-1 hover:bg-white/5 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 