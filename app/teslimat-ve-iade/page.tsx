'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Truck, Package, RefreshCw, Clock } from 'lucide-react';

export default function DeliveryAndReturnPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      {/* Hero Section */}
      <div className="bg-black text-white py-24 sm:py-32 px-6 mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Teslimat ve İade Şartları</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        {/* Teslimat */}
        <section className="mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Teslimat Koşulları</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teslimat Süresi</h3>
                  <p>
                    Siparişleriniz onaylandıktan sonra 3-5 iş günü içinde kargoya verilir. 
                    Kargo süresi bölgeye göre 1-3 iş günü arasında değişmektedir.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teslimat Ücreti</h3>
                  <p>
                    500 TL ve üzeri siparişlerde kargo ücretsizdir. 500 TL altındaki siparişlerde 
                    kargo ücreti sipariş özetinde belirtilir.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teslimat Adresi</h3>
                  <p>
                    Siparişiniz, sipariş formunda belirttiğiniz adrese teslim edilir. 
                    Adres değişikliği için sipariş onayından sonra 24 saat içinde bizimle iletişime geçmeniz gerekir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İade */}
        <section className="mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">İade ve Değişim Koşulları</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">İade Hakkı</h3>
                  <p>
                    Mesafeli Satış Sözleşmesi kapsamında, ürünü teslim aldığınız tarihten itibaren 14 gün içinde 
                    cayma hakkınız bulunmaktadır. Ürün orijinal ambalajında, kullanılmamış ve hasarsız olmalıdır.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">İade İşlemi</h3>
                  <p>
                    İade talebinizi info@notouchness.com adresine e-posta göndererek veya müşteri hizmetlerimiz 
                    ile iletişime geçerek yapabilirsiniz. İade onayından sonra ürünü kargo ile gönderebilirsiniz.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">İade Ücreti</h3>
                  <p>
                    Ürün hatası veya yanlış ürün gönderilmesi durumunda iade kargo ücreti tarafımızca karşılanır. 
                    Diğer durumlarda iade kargo ücreti müşteriye aittir.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">İade Edilemeyen Ürünler</h3>
                  <p>
                    Kişiye özel üretilen veya üzerinde değişiklik yapılan ürünler iade edilemez. 
                    Ayrıca, müşteri hatası nedeniyle hasar gören ürünler iade kapsamı dışındadır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İade Süreci */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">İade Süreci</h2>
              <ol className="space-y-3 text-gray-600 leading-relaxed list-decimal list-inside">
                <li>İade talebinizi e-posta veya telefon ile bildirin</li>
                <li>İade onayı aldıktan sonra ürünü orijinal ambalajında gönderin</li>
                <li>Ürün kontrol edildikten sonra ödeme iadeniz 3-5 iş günü içinde yapılır</li>
                <li>İade tutarı, ödeme yaptığınız yöntemle geri ödenir</li>
              </ol>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

