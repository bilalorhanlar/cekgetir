'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/adminNavbar'
import api from '@/utils/axios'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid')
  

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

    fetchOrders()
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

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('api/orders')
      console.log('Siparişler yüklendi:', response.data)
      setOrders(response.data)
    } catch (error) {
      console.error('Siparişler yüklenirken hata oluştu:', error)
      setError('Siparişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true)
      await api.patch(`api/orders/${orderId}`, { status: newStatus })
      await fetchOrders()
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
      alert('Durum güncellenirken bir hata oluştu')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ONAY_BEKLIYOR': { text: 'Onay Bekleniyor', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      'ONAYLANDI': { text: 'Onaylandı', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
      'CEKICI_YONLENDIRILIYOR': { text: 'Çekici Yönlendiriliyor', color: 'bg-purple-500/20 text-purple-500 border-purple-500/50' },
      'TRANSFER_SURECINDE': { text: 'Transfer Sürecinde', color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50' },
      'TAMAMLANDI': { text: 'Tamamlandı', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      'IPTAL_EDILDI': { text: 'İptal Edildi', color: 'bg-red-500/20 text-red-500 border-red-500/50' }
    }

    const config = statusConfig[status] || statusConfig['ONAY_BEKLIYOR']
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'ODEME_BEKLIYOR': { text: 'Ödeme Bekleniyor', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      'ODENDI': { text: 'Ödendi', color: 'bg-green-500/20 text-green-500 border-green-500/50' },
      'IPTAL_EDILDI': { text: 'İptal Edildi', color: 'bg-red-500/20 text-red-500 border-red-500/50' },
      'IADE_EDILDI': { text: 'İade Edildi', color: 'bg-orange-500/20 text-orange-500 border-orange-500/50' }
    }

    const config = statusConfig[status] || statusConfig['ODEME_BEKLIYOR']
    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.pnrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customerName} ${order.customerSurname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-[#141414]">
      <AdminNavbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Siparişler</h1>
              <p className="text-gray-400 mt-1">Toplam {filteredOrders.length} sipariş</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Talep No, Plaka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#202020] text-white rounded-lg border border-[#404040] focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="ONAY_BEKLIYOR">Onay Bekleniyor</option>
                <option value="ONAYLANDI">Onaylandı</option>
                <option value="CEKICI_YONLENDIRILIYOR">Çekici Yönlendiriliyor</option>
                <option value="TRANSFER_SURECINDE">Transfer Sürecinde</option>
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="IPTAL_EDILDI">İptal Edildi</option>
              </select>
              <div className="flex items-center gap-2 bg-[#202020] rounded-lg border border-[#404040] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#303030] text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#303030] text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-gray-400">Siparişler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={fetchOrders}
                className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-all font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">Sipariş bulunamadı</div>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('ALL')
                }}
                className="px-6 py-2.5 bg-[#202020] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-[#202020] rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="font-mono text-white text-lg">{order.pnrNo}</span>
                      <div className="mt-1 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Müşteri</div>
                      <div className="text-white font-medium">
                        {order.customerName} {order.customerSurname}
                      </div>
                      <div className="text-sm text-gray-400">
                        {order.customerPhone}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Hizmet</div>
                      <div className="text-white">
                        {order.serviceType === 'YOL_YARDIM' ? 'Yol Yardım' :
                         order.serviceType === 'OZEL_CEKICI' ? 'Özel Çekici' :
                         'Toplu Çekici'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Araç</div>
                      <div className="text-white font-medium">
                        {order.vehicleBrand} {order.vehicleModel}
                      </div>
                      <div className="text-sm text-gray-400">
                        {order.vehiclePlate}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Tutar</div>
                      <div className="text-white font-medium text-lg">
                        {order.price.toLocaleString('tr-TR')} TL
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#404040] flex items-center gap-2">
                    <button 
                      className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all font-medium relative"
                      onClick={() => router.push(`/admin/panel/orders/${order.id}`)}
                    >
                      Detay
                    </button>
                    {order.status === 'PENDING' && (
                      <button 
                        className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all font-medium relative"
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : 'İptal'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#202020] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-[#404040]">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Talep No</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Müşteri</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Araç</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Hizmet</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tutar</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Durum</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#404040]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#2a2a2a] transition-colors block md:table-row">
                        <td className="px-6 py-4 block md:table-cell">
                          <div className="flex justify-between items-center md:block">
                            <div className="font-mono text-white">{order.pnrNo}</div>
                            <div className="md:hidden flex flex-col gap-2">
                              {getStatusBadge(order.status)}
                              {getPaymentStatusBadge(order.paymentStatus)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 block md:table-cell">
                          <div className="text-white font-medium">
                            {order.customerName} {order.customerSurname}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 block md:table-cell">
                          <div className="text-white font-medium">
                            {order.vehicleBrand} {order.vehicleModel}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.vehiclePlate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white block md:table-cell">
                          {order.serviceType === 'YOL_YARDIM' ? 'Yol Yardım' :
                           order.serviceType === 'OZEL_CEKICI' ? 'Özel Çekici' :
                           'Toplu Çekici'}
                        </td>
                        <td className="px-6 py-4 block md:table-cell">
                          <div className="text-white font-medium">
                            {order.price.toLocaleString('tr-TR')} TL
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                        </td>
                        <td className="px-6 py-4 block md:table-cell">
                          <div className="flex items-center gap-2">
                            <button 
                              className="flex-1 md:flex-none px-3 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all font-medium relative"
                              onClick={() => router.push(`/admin/panel/orders/${order.id}`)}
                            >
                              Detay
                            </button>
                            {order.status === 'PENDING' && (
                              <button 
                                className="flex-1 md:flex-none px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all font-medium relative"
                                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                disabled={updatingStatus}
                              >
                                {updatingStatus ? (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                ) : 'İptal'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}