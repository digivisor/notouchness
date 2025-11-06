'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import { Users, Target, Award, Heart, Zap, Globe, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const { cartCount } = useCart();

  const stats = [
    { number: '1K+', label: 'Aktif Kullanıcı' },
    { number: '1K+', label: 'Oluşturulan Kart' },
    { number: '99.9%', label: 'Müşteri Memnuniyeti' },
    { number: '24/7', label: 'Destek Hizmeti' }
  ];

  const values = [
    {
      icon: Zap,
      title: 'İnovasyon',
      description: 'Sürekli gelişen teknolojiyi takip ederek, müşterilerimize en güncel çözümleri sunuyoruz.'
    },
    {
      icon: Award,
      title: 'Kalite',
      description: 'Ürünlerimizde ve hizmetlerimizde en yüksek kalite standartlarını koruyoruz.'
    },
    {
      icon: Heart,
      title: 'Müşteri Odaklılık',
      description: 'Her müşterimizin ihtiyacını anlamak ve en iyi çözümü sunmak için çalışıyoruz.'
    },
    {
      icon: Globe,
      title: 'Sürdürülebilirlik',
      description: 'Çevre dostu çözümlerle, gelecek nesillere daha iyi bir dünya bırakmak için çaba gösteriyoruz.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-32 sm:py-40 px-6 mt-16 sm:mt-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Hakkımızda
          </h1>
          <p className="text-gray-300 text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed">
            Dijital kartvizit çözümleri ile profesyonel kimliğinizi yeni nesil teknoloji ile tanıştırın.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Mission */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-10 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Notouchness olarak, profesyonel iletişimi yeniden tanımlamayı hedefliyoruz. NFC ve QR kod teknolojisi ile 
              geleneksel kartvizitleri dijital dünyaya taşıyarak, sınırsız güncelleme ve paylaşım imkanı sunuyoruz. 
              Müşterilerimizin profesyonel kimliklerini en etkili şekilde yansıtmalarına yardımcı olmak için buradayız.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-10 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Vizyonumuz</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Dijital dönüşümün öncüsü olarak, her profesyonelin ihtiyacına uygun, sürdürülebilir ve çevre dostu 
              çözümler sunmak. Gelecekte, fiziksel kartvizitlerin yerini tamamen dijital çözümlerin alacağına inanıyoruz 
              ve bu dönüşümde lider konumda olmayı hedefliyoruz.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Değerlerimiz</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              İş yapış şeklimizi ve müşterilerimize yaklaşımımızı şekillendiren temel değerlerimiz
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-8 sm:p-12 text-white mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Hikayemiz</h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                Notouchness, dijital dönüşümün hızlandığı bir dönemde, profesyonel iletişimdeki eksiklikleri gözlemleyerek 
                kuruldu. Geleneksel kartvizitlerin sınırlılıklarını ve çevresel etkilerini fark eden ekibimiz, 
                NFC ve QR kod teknolojisini kullanarak daha akıllı, sürdürülebilir ve etkili bir çözüm geliştirdi.
              </p>
              <p>
                Bugün, binlerce profesyonel ve kurum, Notouchness ile dijital kimliklerini yönetiyor ve ağlarını genişletiyor. 
                Her gün daha fazla insanın dijital dönüşüm yolculuğuna katılmasına yardımcı olmaktan gurur duyuyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Notouchness, teknoloji ve tasarım alanında uzman bir ekiple çalışmaktadır
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-12 border border-gray-200">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Uzman Ekip</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Her birimiz, müşterilerimize en iyi deneyimi sunmak için tutkuyla çalışıyoruz. 
                  Dijital dönüşüm yolculuğunuzda yanınızdayız.
                </p>
                <a 
                  href="/iletisim" 
                  className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all group"
                >
                  Bizimle İletişime Geçin
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
