'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'
import { toast } from 'react-hot-toast'

export default function FAQPage() {
  const router = useRouter()
  const [faqs, setFaqs] = useState([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [editingFaq, setEditingFaq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

    fetchFaqs()
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

  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/faq')
      setFaqs(response.data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error('SSS\'ler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Lütfen soru ve cevap alanlarını doldurun')
      return
    }

    try {
      setCreating(true)
      await api.post('/api/faq', newFaq)
      setNewFaq({ question: '', answer: '' })
      toast.success('SSS başarıyla eklendi')
      fetchFaqs()
    } catch (error) {
      console.error('Error creating FAQ:', error)
      toast.error('SSS eklenirken bir hata oluştu')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateFaq = async (id, updatedFaq) => {
    if (!updatedFaq.question.trim() || !updatedFaq.answer.trim()) {
      toast.error('Lütfen soru ve cevap alanlarını doldurun')
      return
    }

    try {
      setUpdating(true)
      await api.patch(`/api/faq/${id}`, updatedFaq)
      setEditingFaq(null)
      toast.success('SSS başarıyla güncellendi')
      fetchFaqs()
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast.error('SSS güncellenirken bir hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Bu SSS\'yi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      setDeletingId(id)
      await api.delete(`/api/faq/${id}`)
      toast.success('SSS başarıyla silindi')
      fetchFaqs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('SSS silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">SSS Yönetimi</h1>
              <p className="text-gray-400 mt-1">Toplam {filteredFaqs.length} SSS</p>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="SSS'lerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Yeni SSS Ekleme Formu */}
          <div className="bg-[#202020] rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni SSS Ekle
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Soru</label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="SSS sorusunu girin"
                  className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Cevap</label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="SSS cevabını girin"
                  className="w-full px-4 py-2.5 bg-[#141414] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all h-32 resize-none"
                />
              </div>
              <button
                onClick={handleCreateFaq}
                disabled={creating}
                className="w-full sm:w-auto bg-yellow-500 text-black px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>SSS Ekle</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mevcut SSS Listesi */}
          <div className="bg-[#202020] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mevcut SSS'ler
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-4 text-gray-400">SSS'ler yükleniyor...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">SSS bulunamadı</div>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-2.5 bg-[#141414] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-medium"
                >
                  Aramayı Temizle
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="bg-[#141414] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {editingFaq?.id === faq.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Soru</label>
                          <input
                            type="text"
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Cevap</label>
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#202020] border border-[#404040] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all h-32 resize-none"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleUpdateFaq(faq.id, editingFaq)}
                            disabled={updating}
                            className="flex-1 bg-yellow-500 text-black px-4 py-2.5 rounded-lg hover:bg-yellow-400 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating ? (
                              <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Kaydediliyor...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Kaydet</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="flex-1 bg-[#303030] text-white px-4 py-2.5 rounded-lg hover:bg-[#404040] transition-all font-medium flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>İptal</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFaq(faq)}
                              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              disabled={deletingId === faq.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === faq.id ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 