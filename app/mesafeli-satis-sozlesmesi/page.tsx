'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FileText, ShoppingBag, CreditCard, User } from 'lucide-react';

export default function DistanceSellingAgreementPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      {/* Hero Section */}
      <div className="bg-black text-white py-24 sm:py-32 px-6 mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Mesafeli Satış Sözleşmesi</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <section className="mb-12">
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği 
              hükümleri gereğince düzenlenmiştir.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-start gap-4 mb-4">
                <ShoppingBag className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Taraflar</h2>
                  <div className="space-y-2 text-gray-600">
                    <p><strong className="text-gray-900">Satıcı:</strong> Notouchness</p>
                    <p><strong className="text-gray-900">Alıcı:</strong> Sipariş veren müşteri</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-4">
                <FileText className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Sözleşmenin Konusu</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Bu sözleşme, satıcının internet sitesi üzerinden sunulan ürünlerin satışı ve teslimatı 
                    ile ilgili tarafların hak ve yükümlülüklerini düzenlemektedir.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-4">
                <CreditCard className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Ödeme ve Fiyat</h2>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      Ürün fiyatları, kargo ücreti dahil olmak üzere sitede belirtilmiştir. 
                      Ödeme, sipariş sırasında seçilen ödeme yöntemi ile yapılır.
                    </p>
                    <p>
                      Tüm fiyatlar Türk Lirası (₺) cinsindendir ve KDV dahildir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Cayma Hakkı</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Mesafeli satış sözleşmelerinde, tüketiciye 14 günlük cayma hakkı tanınmıştır. 
                Cayma hakkı, ürünün teslim alındığı tarihten itibaren başlar.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Cayma hakkını kullanmak için, ürünü orijinal ambalajında, kullanılmamış ve hasarsız 
                olarak iade etmeniz gerekmektedir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Teslimat</h2>
              <p className="text-gray-600 leading-relaxed">
                Ürünler, sipariş onayından sonra 3-5 iş günü içinde kargoya verilir. 
                Teslimat süresi bölgeye göre 1-3 iş günü arasında değişmektedir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Uyuşmazlıkların Çözümü</h2>
              <p className="text-gray-600 leading-relaxed">
                Bu sözleşmeden doğan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti yasaları uygulanır. 
                Uyuşmazlıkların çözümünde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-4">
                <User className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">İletişim</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Sözleşme ile ilgili sorularınız için:
                    <br />
                    <strong className="text-gray-900">E-posta:</strong> info@notouchness.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

