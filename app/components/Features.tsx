'use client';

import { Zap, Shield, Smartphone, TrendingUp, Users, Globe } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Anında Paylaşım',
      description: 'Kartınızı dokunarak veya QR kod ile saniyeler içinde paylaşın'
    },
    {
      icon: Shield,
      title: 'Güvenli & Özel',
      description: 'Verileriniz güvenli sunucularda saklanır ve tamamen size aittir'
    },
    {
      icon: Smartphone,
      title: 'Tüm Cihazlarla Uyumlu',
      description: 'iOS, Android ve web tarayıcılarında sorunsuz çalışır'
    },
    {
      icon: TrendingUp,
      title: 'Analitik & İstatistik',
      description: 'Kartınızın görüntülenme sayısını ve etkileşimleri takip edin'
    },
    {
      icon: Users,
      title: 'Kurumsal Çözümler',
      description: 'Ekibiniz için toplu kart yönetimi ve özelleştirme'
    },
    {
      icon: Globe,
      title: 'Çevrimiçi Varlık',
      description: 'Kişisel web siteniz gibi özelleştirilebilir dijital profil'
    }
  ];

  return (
    <section id="features" className="relative py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Neden <span className="font-bold">notouchness</span>?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Modern iş dünyasının ihtiyaçlarına uygun, teknoloji odaklı çözümler
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <Icon className="text-gray-900" size={28} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">1K+</div>
            <div className="text-gray-600">Aktif Kullanıcı</div>
          </div>
          <div className="text-center p-8 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">1K+</div>
            <div className="text-gray-600">Paylaşılan Kart</div>
          </div>
          <div className="text-center p-8 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600">Müşteri Memnuniyeti</div>
          </div>
        </div>
      </div>
    </section>
  );
}
