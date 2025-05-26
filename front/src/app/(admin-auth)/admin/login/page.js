'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import api from '@/utils/axios'

export default function AdminLoginPage() {
  const router = useRouter()
  
  // Token kontrolü ve yenileme için useEffect
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (adminToken) {
      // Token süresi dolmuşsa çıkış yap
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('tokenExpiry')
        router.push('/admin/login')
        return
      }

      // Token süresi dolmak üzereyse yenile
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry) - 5 * 60 * 1000) { // 5 dakika kala
        refreshToken(adminToken)
      }

      router.push('/admin/panel/orders')
    }
  }, [router])

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshToken = async (token) => {
    try {
      const response = await api.post('/api/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const { access_token, expires_in } = response.data
        localStorage.setItem('adminToken', access_token)
        localStorage.setItem('tokenExpiry', (Date.now() + expires_in * 1000).toString())
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('tokenExpiry')
      router.push('/admin/login')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email || !formData.password) {
      setError('Tüm alanları doldurun')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        const { access_token, expires_in } = response.data
        localStorage.setItem('adminToken', access_token)
        localStorage.setItem('tokenExpiry', (Date.now() + expires_in * 1000).toString())
        router.push('/admin/panel/orders')
      }
      
    } catch (err) {
      console.error('Login Error:', err)
      setError(err.response?.data?.message || 'Giriş bilgileri hatalı')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191919] via-[#0a0a0a] to-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] transform transition-all duration-300 hover:scale-[1.01]">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Logo Container */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative w-48 h-16">
              <Image
                src="/images/logo.png"
                alt="Çekgetir Logo"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-3xl font-bold text-yellow-400 tracking-wide">Çekgetir</span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-white/90 text-center mb-8 tracking-wide">
            Yönetici Paneli
          </h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium tracking-wide">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all duration-200"
                placeholder="E-posta adresinizi girin"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium tracking-wide">
                Şifre
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-400/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-400/20"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-white/40 text-sm tracking-wide">
              © 2025 Çekgetir - Tüm hakları saklıdır
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 