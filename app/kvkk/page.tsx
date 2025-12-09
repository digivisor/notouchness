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

      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 leading-relaxed text-gray-800">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Aydınlatma Metni
            </h2>
            <p>
              6698 sayılı KVKK uyarınca veri sorumlusu sıfatıyla; kimlik, iletişim, işlem güvenliği,
              ödeme/işlem bilgisi, cihaz/çerez verisi ve kullanım tercihleriniz; ürün/hizmet sunumu,
              sipariş ve ödeme süreçleri, destek talepleri, güvenlik/denetim, pazarlama ve deneyim
              kişiselleştirme amaçlarıyla işlenmektedir.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
              <li><span className="font-medium">Hukuki sebepler:</span> sözleşmenin ifası, hukuki yükümlülük, meşru menfaat, açık rıza (gerektiğinde).</li>
              <li><span className="font-medium">Toplama yöntemleri:</span> web sitesi, mobil arayüz, destek kanalları, ödeme altyapısı, log/çerezler.</li>
              <li><span className="font-medium">Saklama:</span> ilgili mevzuat ve meşru menfaat süresi boyunca; süresi dolan veriler anonimleştirilir veya silinir.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Açık Rıza Metni
            </h2>
            <p>
              Aşağıdaki işlemler için açık rıza vermektesiniz; dilediğiniz zaman geri çekebilirsiniz:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
              <li>Ürün/hizmet tanıtımı, kampanya ve duyuru iletileri</li>
              <li>Deneyim ve içerik kişiselleştirme (profil, tercih, öneri)</li>
              <li>Çerez/benzeri teknolojilerle pazarlama ve analitik</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Veri Aktarımları
            </h2>
            <p>Hizmet sağlayıcılar ve tedarikçilerle, yalnızca hizmet sunumu için gerekli ölçüde paylaşım yapılabilir:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
              <li>Ödeme/iyzico altyapısı, bulut ve barındırma sağlayıcıları, e-posta/SMS servisleri</li>
              <li>Güvenlik, log, hata izleme ve analitik hizmetleri</li>
              <li>Yasal gereklilik halinde yetkili kurumlar</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Haklarınız (KVKK m.11)
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
              <li>Verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme</li>
              <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Eksik/yanlış işlenen verilerin düzeltilmesini ve ilgilisine bildirilmesini isteme</li>
              <li>Silme/yok etme/anonimleştirme ve aktarımın bildirimi talebi</li>
              <li>Otomatik işleme sonucu aleyhe çıkacak sonuca itiraz</li>
              <li>Zarara uğramanız hâlinde tazmin talebi</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Başvuru & İletişim
            </h2>
            <p>
              Haklarınızı kullanmak, rızanızı geri çekmek veya sorularınız için{' '}
              <a href="mailto:info@notouchness.com" className="text-blue-600 hover:underline">
                info@notouchness.com
              </a>{' '}
              adresi üzerinden bize ulaşabilirsiniz. Başvurular mevzuattaki süreler içinde yanıtlanır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} />
              Güvenlik Önlemleri
            </h2>
            <p>
              Verileriniz; erişim kontrolü, şifreleme, ağ ve uygulama güvenliği önlemleri, loglama ve
              düzenli denetim süreçleriyle korunmaktadır. Paylaşımlar asgari veri ilkesiyle yapılır.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

