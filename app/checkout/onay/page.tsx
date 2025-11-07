'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartModal from '../../components/CartModal';
import { CheckCircle, Truck } from 'lucide-react';

function OnayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderNumberFromUrl = searchParams.get('order');

    if (paymentStatus === 'success' && orderNumberFromUrl) {
      setOrderNumber(orderNumberFromUrl);
      handlePaymentSuccess(orderNumberFromUrl);
    } else if (paymentStatus === 'error') {
      // Hata durumunda ödeme sayfasına yönlendir
      router.push('/checkout/odeme?payment=error');
    } else if (orderNumberFromUrl) {
      // Direkt order number ile geldiyse (test modu)
      setOrderNumber(orderNumberFromUrl);
      handlePaymentSuccess(orderNumberFromUrl);
    } else {
      // Parametre yoksa bilgiler sayfasına yönlendir
      router.push('/checkout');
    }
  }, [searchParams, router]);

  const handlePaymentSuccess = async (orderNumberFromUrl: string) => {
    try {
      setLoading(true);
      
      // Siparişi kontrol et
      const { data: existingOrder, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumberFromUrl)
        .single();

      if (orderError || !existingOrder) {
        console.error('Sipariş bulunamadı:', orderError);
        router.push('/checkout/odeme?payment=error&reason=order_not_found');
        return;
      }

      // Payment status'u paid yap (eğer henüz paid değilse)
      if (existingOrder.payment_status !== 'paid') {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('order_number', orderNumberFromUrl);
      }

      // Email gönder
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: existingOrder.customer_name,
            customerEmail: existingOrder.customer_email,
            orderNumber: orderNumberFromUrl,
            orderDate: new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            items: typeof existingOrder.items === 'string' 
              ? JSON.parse(existingOrder.items) 
              : existingOrder.items,
            subtotal: existingOrder.subtotal,
            shippingCost: existingOrder.shipping_cost,
            total: existingOrder.total,
            shippingAddress: existingOrder.customer_address,
          }),
        });
      } catch (emailError) {
        console.error('Email gönderilemedi:', emailError);
      }

      // Siparişi set et
      setOrder(existingOrder);
      
      // Sepeti 2 saniye sonra boşalt
      setTimeout(() => {
        clearCart();
        // localStorage'daki form verilerini temizle
        localStorage.removeItem('checkout_form_data');
      }, 2000);
    } catch (error) {
      console.error('Payment success error:', error);
      router.push('/checkout/odeme?payment=error&reason=server_error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartVisible(true)} />
        <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartVisible(true)} />
        <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sipariş Bulunamadı</h1>
            <p className="text-gray-600 mb-8">Sipariş bilgileri yüklenemedi.</p>
            <Link 
              href="/checkout"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Checkout Sayfasına Dön
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const items = typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-20">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 bg-gray-900 text-white border-gray-900">
                  <CheckCircle className="w-5 h-5" />
                </div>
                {s < 3 && (
                  <div className="w-24 h-1 mx-2 bg-gray-900"></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className="text-sm text-gray-900 font-medium">Bilgiler</span>
            <span className="text-sm text-gray-900 font-medium">Ödeme</span>
            <span className="text-sm text-gray-900 font-medium">Onay</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="max-w-2xl w-full space-y-6">
            {/* Success Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Siparişiniz Tamamlandı</h2>
              <p className="text-gray-600 mb-6">
                Sipariş onay maili <strong>{typeof order.customer_email === 'string' ? order.customer_email : ''}</strong> adresinize gönderildi.
              </p>
            </div>

            {/* Order Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sipariş Numarası</span>
                  <span className="font-mono font-semibold text-gray-900">{orderNumber || (typeof order.order_number === 'string' ? order.order_number : '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Toplam Tutar</span>
                  <span className="font-semibold text-gray-900">₺{typeof order.total === 'number' ? order.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Ödeme Durumu</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">Ödendi</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {items && items.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
                <div className="space-y-3">
                  {items.map((item: { name: string; image?: string; quantity: number; total: number }, idx: number) => (
                    <div key={idx} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || '/card-black.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Track Order Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Siparişinizi Takip Edin</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Sipariş durumunuzu takip etmek için aşağıdaki sayfadan sipariş numaranızı girebilirsiniz.
              </p>
              <Link
                href={`/siparis-takip?order=${orderNumber || (typeof order.order_number === 'string' ? order.order_number : '')}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
              >
                <Truck className="w-4 h-4" />
                Siparişimi Takip Et
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-center"
                >
                  Ana Sayfaya Dön
                </Link>
                <Link
                  href="/store"
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-center"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OnayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <OnayContent />
    </Suspense>
  );
}

