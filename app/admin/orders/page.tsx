'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import Toast from '../../components/Toast';
import { supabase } from '../../../lib/supabase';
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  Eye, Search, Filter, Download
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method?: string;
  payment_status: string;
  order_status: string;
  customer_note?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const loadOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Siparişler yüklenemedi!', 'error');
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Admin kontrolü
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    // Load orders on mount
    const fetchOrders = async () => {
      await loadOrders();
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: { order_status: string; updated_at?: string } = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'shipped' && !selectedOrder?.shipped_at) {
      updateData.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && !selectedOrder?.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      setToast({ message: 'Sipariş durumu güncellenemedi!', type: 'error' });
    } else {
      setToast({ message: 'Sipariş durumu güncellendi!', type: 'success' });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrderResult = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (updatedOrderResult.data) {
          setSelectedOrder(updatedOrderResult.data);
        }
      }
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      showToast('Ödeme durumu güncellenemedi!', 'error');
    } else {
      showToast('Ödeme durumu güncellendi!', 'success');
      loadOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, payment_status: status });
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AdminSidebar activePage="orders" />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Sipariş</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bekleyen</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kargoda</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.shipped}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Gelir</p>
                  <p className="text-3xl font-bold text-green-600">₺{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Sipariş no, müşteri adı veya email ile ara..."
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bekleyen
                </button>
                <button
                  onClick={() => setStatusFilter('processing')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'processing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  İşlemde
                </button>
                <button
                  onClick={() => setStatusFilter('shipped')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'shipped'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Kargoda
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürünler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        Sipariş bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} ürün
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₺{Number(order.total).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status === 'paid' ? 'Ödendi' : order.payment_status === 'pending' ? 'Bekliyor' : order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                            {order.order_status === 'pending' ? 'Bekliyor' : 
                             order.order_status === 'processing' ? 'İşlemde' :
                             order.order_status === 'shipped' ? 'Kargoda' :
                             order.order_status === 'delivered' ? 'Teslim Edildi' : order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div 
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Sipariş Detayı</h2>
                      <p className="text-sm text-gray-500">{selectedOrder.order_number}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircle size={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Müşteri Bilgileri</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ad Soyad:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.customer_email}</span>
                      </div>
                      {selectedOrder.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefon:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span>
                        </div>
                      )}
                      {selectedOrder.customer_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Adres:</span>
                          <span className="font-medium text-gray-900 text-right max-w-xs">{selectedOrder.customer_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sipariş Ürünleri</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                          {item.image && (
                            <div className="w-16 h-16 bg-white rounded overflow-hidden shrink-0">
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₺{(item.total || (item.price || 0) * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₺{(item.price || 0).toFixed(2)} / adet
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Fiyat Özeti</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ara Toplam:</span>
                        <span className="font-medium text-gray-900">₺{Number(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo:</span>
                        <span className="font-medium text-gray-900">₺{Number(selectedOrder.shipping_cost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vergi:</span>
                        <span className="font-medium text-gray-900">₺{Number(selectedOrder.tax).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Toplam:</span>
                        <span className="font-bold text-gray-900 text-lg">₺{Number(selectedOrder.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Updates */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Durum Güncelle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Durumu</label>
                        <select
                          value={selectedOrder.order_status}
                          onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="pending">Bekliyor</option>
                          <option value="processing">İşlemde</option>
                          <option value="shipped">Kargoda</option>
                          <option value="delivered">Teslim Edildi</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Durumu</label>
                        <select
                          value={selectedOrder.payment_status}
                          onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="pending">Bekliyor</option>
                          <option value="paid">Ödendi</option>
                          <option value="failed">Başarısız</option>
                          <option value="refunded">İade Edildi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(selectedOrder.customer_note || selectedOrder.admin_note) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Notlar</h3>
                      <div className="space-y-3">
                        {selectedOrder.customer_note && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">Müşteri Notu:</p>
                            <p className="text-sm text-blue-800">{selectedOrder.customer_note}</p>
                          </div>
                        )}
                        {selectedOrder.admin_note && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">Admin Notu:</p>
                            <p className="text-sm text-gray-700">{selectedOrder.admin_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
