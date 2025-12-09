'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { Shield, FileText } from 'lucide-react';

export default function KvkkPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      {/* Hero */}
      <div className="bg-black text-white py-24 sm:py-32 px-6 mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">KVKK & Açık Rıza Metni</h1>
          <p className="text-base sm:text-lg text-white/80">
            Kişisel verilerinizin korunmasına ilişkin aydınlatma ve açık rıza metni.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 leading-relaxed text-gray-800">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Aydınlatma
            </h2>
            <p>
              Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel
              verilerinizin işlenme amaçları, saklama süreleri, aktarım süreçleri ve haklarınız
              hakkında bilgi vermek için hazırlanmıştır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Açık Rıza
            </h2>
            <p>
              Aşağıdaki hususlarda açık rızanız bulunmaktadır: ürün/hizmet tanıtımları,
              kampanya ve duyuru iletileri, profil ve deneyim kişiselleştirmeleri.
              Rızanızı dilediğiniz zaman geri çekebilirsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Haklarınız
            </h2>
            <p>
              KVKK kapsamında verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama,
              aktarıma itiraz etme ve şikayette bulunma haklarına sahipsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              İletişim
            </h2>
            <p>
              Haklarınızı kullanmak veya sorularınız için{' '}
              <a href="mailto:info@notouchness.com" className="text-blue-600 hover:underline">
                info@notouchness.com
              </a>{' '}
              adresi üzerinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

