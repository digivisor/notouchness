'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export default function SSLCertificatePage() {
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">SSL Sertifikası</h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Güvenli bağlantı ve veri koruması için SSL sertifikası kullanıyoruz.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl p-8 mb-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-8 h-8 text-gray-900" />
              <h2 className="text-2xl font-bold text-gray-900">Güvenli Bağlantı</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sitemiz, tüm veri aktarımlarınızı şifrelemek için SSL (Secure Sockets Layer) sertifikası kullanmaktadır. 
              Bu, tarayıcınız ile sunucumuz arasındaki tüm iletişimin şifrelenmesini sağlar.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">Tüm ödeme işlemleri SSL ile korunmaktadır.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">Kişisel bilgileriniz güvenli bir şekilde işlenmektedir.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">Verileriniz üçüncü taraflarla paylaşılmamaktadır.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">SSL Sertifikası Hakkında</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              SSL sertifikası, web sitenizin güvenliğini sağlamak için kullanılan dijital bir sertifikadır. 
              Bu sertifika sayesinde:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-1">•</span>
                <span>Tarayıcınızın adres çubuğunda yeşil kilit simgesi görünür</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-1">•</span>
                <span>URL adresi &quot;https://&quot; ile başlar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-1">•</span>
                <span>Tüm veriler şifrelenmiş olarak iletilir</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-1">•</span>
                <span>Kredi kartı bilgileri ve kişisel veriler korunur</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

