'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'read', 'unread'
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [markingAsReadId, setMarkingAsReadId] = useState(null)

  useEffect(() => {
    // Token kontrolü
    const adminToken = localStorage.getItem('adminToken')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (!adminToken) {
      router.push('/admin/login')
      return
    }

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

    fetchMessages()
  }, [router])

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

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/contact')
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Mesajlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        setDeletingId(id)
        await api.delete(`/api/contact/${id}`)
        toast.success('Mesaj başarıyla silindi')
        fetchMessages()
      } catch (error) {
        console.error('Error deleting message:', error)
        toast.error('Mesaj silinirken bir hata oluştu')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingAsReadId(id)
      await api.patch(`/api/contact/${id}/read`)
      toast.success('Mesaj okundu olarak işaretlendi')
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast.error('Mesaj işaretlenirken bir hata oluştu')
    } finally {
      setMarkingAsReadId(null)
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'read' && message.isRead) || 
      (filter === 'unread' && !message.isRead)
    
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.service.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">İletişim Mesajları</h1>
              <p className="text-gray-400 mt-1">Toplam {filteredMessages.length} mesaj</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Mesajlarda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              >
                <option value="all">Tüm Mesajlar</option>
                <option value="unread">Okunmamış</option>
                <option value="read">Okunmuş</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Mesajlar yükleniyor...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">Mesaj bulunamadı</div>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilter('all')
                }}
                className="px-6 py-2.5 bg-[#202020] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`bg-[#202020] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                    message.isRead ? 'border-[#404040]' : 'border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                        {!message.isRead && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
                            Yeni
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 break-all flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {message.email}
                        </p>
                        <p className="text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {message.phone}
                        </p>
                        <p className="text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {message.service}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(message.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                    <p className="text-white whitespace-pre-wrap">{message.message}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    {!message.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        disabled={markingAsReadId === message.id}
                        className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {markingAsReadId === message.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>İşaretleniyor...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Okundu İşaretle</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      disabled={deletingId === message.id}
                      className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === message.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Siliniyor...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Sil</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 