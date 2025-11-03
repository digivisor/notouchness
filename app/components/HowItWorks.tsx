'use client';

import Image from 'next/image';

export default function HowItWorks() {
  const steps = [
    {
      icon: '/credit-card.png',
      title: 'Kartınızı Seçin',
      description: 'Size en uygun kartı seçin ve sipariş verin. Premium metal veya doğal ahşap seçeneklerimiz mevcut.'
    },
    {
      icon: '/user.png',
      title: 'Profilinizi Oluşturun',
      description: 'Kullanıcı dostu arayüzümüzle bilgilerinizi girin, sosyal medya hesaplarınızı ekleyin.'
    },
    {
      icon: '/contactless.png',
      title: 'Paylaşın',
      description: 'Kartınızı telefonlara yaklaştırın veya QR kodu okutun. Bilgileriniz anında paylaşılsın.'
    },
    {
      icon: '/browser.png',
      title: 'Güncelleyin',
      description: 'İstediğiniz zaman profilinizi güncelleyin. Değişiklikler otomatik olarak yansır.'
    }
  ];

  return (
    <section id="how-it-works" className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dijital kartvizitinizi kullanmaya başlamak sadece 4 adım
          </p>
        </div>

        {/* Adımlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Bağlantı Çizgisi (son adım hariç) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 -z-10"></div>
              )}
              
              <div className="text-center space-y-4">
                {/* İkon */}
                <div className="relative inline-block">
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: '#E4F1F1', opacity: 1 }}
                  >
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  </div>
                </div>

                {/* Başlık ve Açıklama */}
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
