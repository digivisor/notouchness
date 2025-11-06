'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      {/* Hero Section */}
      <div className="bg-black text-white py-24 sm:py-32 px-6 mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Gizlilik Sözleşmesi</h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Kişisel verilerinizin korunması bizim için önemlidir.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <section className="mb-12">
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong className="text-gray-900">Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-600 leading-relaxed">
              Notouchness olarak, kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Sözleşmesi, 
              kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-start gap-4 mb-4">
                <FileText className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Toplanan Bilgiler</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>Ad, soyad, e-posta adresi, telefon numarası</li>
                    <li>Fatura ve teslimat adresi bilgileri</li>
                    <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
                    <li>IP adresi ve tarayıcı bilgileri</li>
                    <li>Sipariş geçmişi ve tercihleriniz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-4">
                <Eye className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Bilgilerin Kullanımı</h2>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Toplanan bilgiler aşağıdaki amaçlarla kullanılmaktadır:
                  </p>
                  <ul className="space-y-2 text-gray-600 list-disc list-inside">
                    <li>Siparişlerinizin işlenmesi ve teslimatı</li>
                    <li>Müşteri hizmetleri ve destek sağlanması</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Ürün ve hizmetlerimizin iyileştirilmesi</li>
                    <li>Pazarlama ve iletişim faaliyetleri (izin verdiğiniz takdirde)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-4">
                <Lock className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Veri Güvenliği</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Kişisel verilerinizin güvenliği için SSL sertifikası kullanıyoruz ve tüm verileriniz 
                    şifrelenmiş olarak işlenmektedir. Verileriniz üçüncü taraflarla paylaşılmamakta ve sadece 
                    yasal zorunluluklar çerçevesinde saklanmaktadır.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Çerezler (Cookies)</h2>
              <p className="text-gray-600 leading-relaxed">
                Sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezleri tarayıcı 
                ayarlarınızdan yönetebilirsiniz. Ancak, bazı çerezlerin devre dışı bırakılması sitenin 
                işlevselliğini etkileyebilir.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Haklarınız</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>Kişisel verilerinizin düzeltilmesini isteme</li>
                <li>Kişisel verilerinizin silinmesini isteme</li>
                <li>Kişisel verilerinizin üçüncü kişilere aktarılmasına itiraz etme</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">İletişim</h2>
              <p className="text-gray-600 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                <br />
                <strong className="text-gray-900">E-posta:</strong> info@notouchness.com
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

