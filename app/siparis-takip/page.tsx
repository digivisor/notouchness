'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import Toast from '../components/Toast';
import { Package, Truck, CheckCircle, Clock, Search, Mail, Phone, MapPin, XCircle } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderNumber, setCancelOrderNumber] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const lastSearchedOrderRef = useRef<string | null>(null);

  const handleSearch = async (orderNum?: string) => {
    const searchOrderNum = orderNum || orderNumber;
    if (!searchOrderNum.trim()) {
      setToast({ message: 'Lütfen sipariş numarası giriniz', type: 'error' });
      return;
    }

    setIsLoading(true);
    setOrder(null);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', searchOrderNum.trim())
      .single();

    setIsLoading(false);

    if (error || !data) {
      setToast({ message: 'Sipariş bulunamadı! Sipariş numaranızı kontrol edin.', type: 'error' });
      return;
    }

    // Items'ı parse et (JSON string olabilir)
    const parsedData = {
      ...data,
      items: typeof data.items === 'string' 
        ? JSON.parse(data.items) 
        : (data.items || [])
    };

    setOrder(parsedData);
  };

  useEffect(() => {
    const orderFromUrl = searchParams.get('order');
    if (orderFromUrl && orderFromUrl !== lastSearchedOrderRef.current) {
      // URL'den gelen order number'ı set et
      setOrderNumber(orderFromUrl);
      // Otomatik sorgu yap (URL'de order parametresi varsa ve daha önce sorgulanmamışsa)
      handleSearch(orderFromUrl);
      lastSearchedOrderRef.current = orderFromUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCancelClick = () => {
    if (!order) return;
    setCancelOrderNumber('');
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    // Sipariş numarası doğrulama
    if (cancelOrderNumber.trim() !== order.order_number) {
      setToast({ message: 'Sipariş numarası eşleşmiyor!', type: 'error' });
      return;
    }

    setIsCancelling(true);

    try {
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: order.order_number })
      });
      const result = await res.json();
      if (!result.success) {
        setToast({ message: result.message || 'Sipariş iptal edilirken bir hata oluştu!', type: 'error' });
        setIsCancelling(false);
        return;
      }
      setOrder({ ...order, order_status: 'cancelled' });
      setShowCancelModal(false);
      setCancelOrderNumber('');
      setShowCancelSuccessModal(true);
      setIsCancelling(false);
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setToast({ message: 'Bir hata oluştu, lütfen tekrar deneyin.', type: 'error' });
      setIsCancelling(false);
    }
  };

  const getStatusInfo = (status: string) => {
    type StatusIcon = React.ComponentType<{ size?: number; className?: string }>;
    const statuses: Record<string, { label: string; color: string; icon: StatusIcon; description: string }> = {
      pending: { 
        label: 'Beklemede', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Clock,
        description: 'Siparişiniz onay bekliyor'
      },
      processing: { 
        label: 'Hazırlanıyor', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Package,
        description: 'Siparişiniz hazırlanıyor'
      },
      shipped: { 
        label: 'Kargoya Verildi', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Truck,
        description: 'Siparişiniz kargoya verildi'
      },
      delivered: { 
        label: 'Teslim Edildi', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: CheckCircle,
        description: 'Siparişiniz teslim edildi'
      },
      cancelled: { 
        label: 'İptal Edildi', 
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Clock,
        description: 'Sipariş iptal edildi'
      },
    };
    return statuses[status] || statuses.pending;
  };

  const getStatusProgress = (status: string) => {
    const progress: Record<string, number> = {
      pending: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0,
    };
    return progress[status] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-gray-900" />
            <h1 className="text-4xl font-bold text-gray-900">Sipariş Takip</h1>
          </div>
          <p className="text-gray-600">Sipariş numaranızı girerek siparişinizi takip edebilirsiniz</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Sipariş numaranızı girin (ör: ORD-20251106-001)"
                className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 font-mono"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sipariş: {order.order_number}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('tr-TR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className={`px-6 py-3 rounded-xl border-2 font-bold ${getStatusInfo(order.order_status).color}`}>
                  {getStatusInfo(order.order_status).label}
                </div>
              </div>

              {/* Progress Bar */}
              {order.order_status !== 'cancelled' && (
                <div className="mb-6">
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-900 rounded-full transition-all duration-500"
                        style={{ width: `${getStatusProgress(order.order_status)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      {getStatusInfo(order.order_status).description}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
                  const statusInfo = getStatusInfo(status);
                  const Icon = statusInfo.icon;
                  const isCompleted = getStatusProgress(order.order_status) >= getStatusProgress(status);
                  const isCurrent = order.order_status === status;

                  return (
                    <div key={status} className={`flex items-center gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isCurrent ? 'text-black' : 'text-gray-600'}`}>
                          {statusInfo.label}
                        </p>
                        <p className="text-sm text-gray-500">{statusInfo.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-gray-600" />
                Müşteri Bilgileri
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Mail className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">E-posta</p>
                    <p className="font-medium text-gray-900">{order.customer_email}</p>
                  </div>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Phone className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="font-medium text-gray-900">{order.customer_phone}</p>
                    </div>
                  </div>
                )}
                {order.customer_address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Teslimat Adresi</p>
                      <p className="font-medium text-gray-900">{order.customer_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-gray-600" />
                Sipariş Ürünleri
              </h3>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {item.image && (
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₺{item.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">₺{item.price.toFixed(2)} / adet</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Sipariş ürünleri bulunamadı.</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam:</span>
                  <span>₺{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo:</span>
                  <span>{order.shipping_cost === 0 ? 'Ücretsiz' : `₺${order.shipping_cost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Toplam:</span>
                  <span>₺{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 items-start">
              <Link
                href="/"
                className="flex-1 px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition text-center"
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                href="/store"
                className="flex-1 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition text-center"
              >
                Alışverişe Devam Et
              </Link>
              {/* İptal Butonu - Sadece beklemede durumunda göster */}
              {order.order_status === 'pending' && (
                <button
                  onClick={handleCancelClick}
                  className="px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center gap-2 whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4" />
                  İptal Et
                </button>
              )}
            </div>
            
            {/* İptal Uyarısı */}
            {order.order_status === 'pending' && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-semibold text-gray-900">Not:</span> Sipariş sadece bekleme aşamasında iptal edilebilir. Hazırlanma aşamasına geçtikten sonra iptal edilemez.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!order && !isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h3>
            <p className="text-gray-600">Sipariş numaranızı girerek siparişinizi takip edebilirsiniz</p>
          </div>
        )}
      </div>

      {/* İptal Onay Modalı */}
      {showCancelModal && order && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Siparişi İptal Et</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelOrderNumber('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Siparişinizi iptal etmek için sipariş numaranızı girin. Bu işlem geri alınamaz.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Numarası
              </label>
              <input
                type="text"
                value={cancelOrderNumber}
                onChange={(e) => setCancelOrderNumber(e.target.value)}
                placeholder={order.order_number}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 font-mono"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelOrderNumber('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || cancelOrderNumber.trim() !== order.order_number}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İptal Ediliyor...
                  </>
                ) : (
                  'İptal Et'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İptal Başarı Modalı */}
      {showCancelSuccessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Başarıyla İptal Edildi</h3>
            <p className="text-gray-700 mb-4">İade işleminiz başlatıldı. Bankanızın süreçlerine göre tutar genellikle 1-3 iş günü içinde hesabınıza yansır. Detaylar için bankanızla iletişime geçebilirsiniz.</p>
            <button
              onClick={() => setShowCancelSuccessModal(false)}
              className="mt-4 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >Tamam</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => {}} />
        <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
          <div className="text-center">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}

