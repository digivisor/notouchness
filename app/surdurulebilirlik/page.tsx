'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { 
  Leaf, 
  Droplet, 
  Globe, 
  DollarSign, 
  Users, 
  TrendingUp,
  Download,
  Share2,
  Linkedin,
  Mail,
  ArrowRight,
  Check,
  ChevronRight,
  Wind,
  Zap,
  CloudRain,
  Trees,
  Recycle,
  Sprout,
  Layers,
  Plus,
  Minus,
  Wifi
} from 'lucide-react';

export default function SustainabilityPage() {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [employees, setEmployees] = useState(10);
  const [cardsPerEmployee, setCardsPerEmployee] = useState(100);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // Hesaplamalar
  const totalCards = employees * cardsPerEmployee;
  const paperCardCost = totalCards * 3; // Kağıt kartvizit maliyeti: 3 TL/kart
  const digitalCardCost = employees * 700; // Notouchness dijital kart maliyeti: 700 TL/kart
  const annualSavings = paperCardCost - digitalCardCost;
  const potentialCustomers = employees * 3; // Çalışan başına +3 potansiyel müşteri 
  
  // Çevresel etki hesaplamaları
  const treesSaved = Math.floor(totalCards / 10000); 
  const waterSaved = Math.floor(totalCards / 100); 
  const co2Saved = Math.floor(totalCards * 0.152); 

  const openCart = () => setIsCartVisible(true);
  const closeCart = () => setIsCartVisible(false);

  const handleShare = (platform: 'linkedin' | 'email') => {
    const text = `Şirketimiz ${employees} çalışan için dijital kartvizit kullanarak yılda ₺${annualSavings.toLocaleString('tr-TR')} tasarruf ediyor ve ${treesSaved} ağaç kurtarıyor!`;
    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
    } else {
      window.location.href = `mailto:?subject=Sürdürülebilirlik Etkisi&body=${encodeURIComponent(text)}`;
    }
  };

  const faqs = [
    {
      q: "Dijital kartvizitler gerçekten karbon ayak izini azaltır mı?",
      a: "Evet. Geleneksel kartvizitlerin üretimi, taşınması ve atılması süreçleri önemli miktarda karbon salınımına neden olur. Dijital kartvizitler bu süreçleri tamamen ortadan kaldırır."
    },
    {
      q: "NFC kartların ömrü ne kadardır?",
      a: "NFC kartlarımız dayanıklı malzemelerden üretilmiştir ve fiziksel bir hasar görmediği sürece yıllarca (100.000+ okuma) kullanılabilir. Tek bir kart, binlerce kağıt kartvizitin yerini alır."
    },
    {
      q: "Çalışanlarım işten ayrılırsa kartlar ne olur?",
      a: "Dijital sistemimiz sayesinde kartları kolayca yeni çalışanlara atayabilir veya içeriklerini güncelleyebilirsiniz. Böylece kart israfı yaşanmaz."
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header onCartClick={openCart} />
      <CartModal isOpen={isCartVisible} onClose={closeCart} />

      {/* Organic Background Lines (Fixed) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        {/* Left Curve */}
        <svg className="absolute top-0 left-0 h-full w-1/3 text-gray-50 -translate-x-1/4" viewBox="0 0 100 800" preserveAspectRatio="none">
           <path d="M0 0 C 50 200 50 600 0 800 L 0 0" fill="currentColor" />
        </svg>
        {/* Right Curve */}
        <svg className="absolute top-1/4 right-0 h-full w-1/3 text-green-50 translate-x-1/3" viewBox="0 0 100 800" preserveAspectRatio="none">
           <path d="M100 0 C 50 200 50 600 100 800 L 100 0" fill="currentColor" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#0f2e20] text-white pt-24 pb-48 md:pt-32 md:pb-64 overflow-hidden perspective-1000">
        
        {/* 3D Rotating Card Animation */}
        <div className="absolute top-[45%] right-0 md:-right-10 w-full md:w-1/2 h-full -translate-y-1/2 flex items-center justify-center z-0 opacity-40 md:opacity-100 pointer-events-none">
           <div className="w-80 h-48 md:w-96 md:h-56 relative preserve-3d animate-rotate-3d">
              {/* Front Side */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#000000] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-white/10 backface-hidden flex flex-col justify-between p-6 overflow-hidden">
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-cyan-400/10 to-white/0 w-[200%] animate-shine"></div>
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="flex justify-between items-start">
                    <div></div> {/* Spacer */}
                    <div className="flex items-center gap-1 text-white/80">
                        <span className="text-[10px] font-medium tracking-widest">NFC</span>
                        <Wifi className="rotate-90 w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="text-center z-10 flex justify-center items-center">
                     <Image 
                        src="/notouchness3.png" 
                        alt="notouchness" 
                        width={180} 
                        height={60} 
                        className="object-contain"
                     />
                  </div>
                  
                  <div className="text-center z-10">
                     <p className="text-[10px] text-gray-400 tracking-wider">www.notouchness.com</p>
                  </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-bl from-[#001f3f] via-[#003366] to-[#000000] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-white/10 backface-hidden rotate-y-180 flex flex-col justify-center items-center p-6 overflow-hidden">
                  {/* Shine Effect Back */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-cyan-400/5 to-white/0 w-[200%] animate-shine"></div>

                  {/* Magnetic Strip */}
                  <div className="absolute top-6 left-0 w-full h-10 bg-black/80 backdrop-blur-sm"></div>
                  
                  {/* Center Logo/Icon */}
                  <div className="relative z-10 opacity-80">
                     <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
                        <Wifi className="w-8 h-8 text-cyan-400/80 rotate-90" />
                     </div>
                  </div>
                  
                  {/* Bottom Text */}
                  <div className="absolute bottom-6 w-full text-center">
                      <p className="text-[8px] text-cyan-100/40 tracking-[0.3em] font-light uppercase">
                        The Future of Connection
                      </p>
                  </div>
              </div>
           </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center md:text-left pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 shadow-lg hover:bg-white/20 transition-all cursor-default hover:scale-105 duration-300">
            <Sprout className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium tracking-wide text-green-50">Sürdürülebilir Gelecek</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight">
            Doğa İçin <br />
            <span className="text-green-400 inline-block hover:scale-105 transition-transform duration-500 cursor-default">Dijital Dönüşüm</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed mb-10 md:mx-0 mx-auto">
            Notouchness ile kağıt kullanımını azaltın, karbon ayak izinizi düşürün. 
            Kurumsal kimliğinizi doğa dostu teknolojiyle birleştirin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start relative z-20">
             <button 
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-1"
             >
                Etkinizi Hesaplayın 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
             <Link 
                href="/store"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-all backdrop-blur-sm flex items-center justify-center gap-2 border border-white/10 hover:border-white/20"
             >
                Ürünleri İncele
             </Link>
          </div>
        </div>
      </section>

      {/* Clean Stats Cards - No Blur/Colors */}
      <section className="relative z-20 -mt-32 px-6 pb-20">
         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 perspective-1000">
            {[
                { title: "Kağıtsız", desc: "Sıfır Atık Politikası", icon: Recycle, color: "text-green-600" },
                { title: "Temassız", desc: "Yeni Nesil Teknoloji", icon: Zap, color: "text-blue-600" },
                { title: "Sınırsız", desc: "Ömür Boyu Kullanım", icon: Layers, color: "text-purple-600" },
            ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
            ))}
         </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="relative z-20 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 relative">
            <div className="grid lg:grid-cols-5 h-full relative z-10">
              
              {/* Left Side - Controls */}
              <div className="lg:col-span-2 bg-[#f8fafc] p-8 border-r border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Etki Simülasyonu
                </h3>
                
                <div className="space-y-10">
                  {/* Employees Input */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold text-gray-600">Şirketinizde kaç çalışan var?</label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={employees}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= 10000) {
                            setEmployees(val);
                          }
                        }}
                        className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-green-700 text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10000"
                      step="1"
                      value={employees}
                      onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500 transition-all"
                    />
                  </div>

                  {/* Cards Input */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold text-gray-600">Her çalışan için yılda kaç kartvizit sipariş ediyorsunuz?</label>
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={cardsPerEmployee}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= 5000) {
                            setCardsPerEmployee(val);
                          }
                        }}
                        className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-green-700 text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5000"
                      step="1"
                      value={cardsPerEmployee}
                      onChange={(e) => setCardsPerEmployee(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-12 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2 relative z-10">
                    <TrendingUp className="w-4 h-4" />
                    <span>Potansiyel Etki</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 relative z-10">+{potentialCustomers}</p>
                  <p className="text-xs text-gray-500 mt-1 relative z-10">Çalışan başına +3 potansiyel müşteri</p>
                </div>
              </div>

              {/* Right Side - Results */}
              <div className="lg:col-span-3 p-8 md:p-10 bg-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900">Yıllık Tasarruf Tablosu</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  <div className="relative p-6 rounded-2xl bg-[#0f2e20] text-white shadow-xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors"></div>
                    <p className="text-sm text-green-200 font-medium mb-2 relative z-10">Toplam Yıllık Tasarruf</p>
                    <p className="text-4xl font-bold relative z-10">₺{annualSavings > 0 ? annualSavings.toLocaleString('tr-TR') : 0}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-300/80 relative z-10">
                        <TrendingUp className="w-3 h-3" />
                        <span>Sektör ortalamasına göre</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                    <p className="text-sm text-gray-500 font-medium mb-2">Geleneksel Maliyet</p>
                    <p className="text-3xl font-bold text-gray-900">₺{paperCardCost.toLocaleString('tr-TR')}</p>
                    <p className="text-xs text-gray-400 mt-2">Kağıt kartvizit maliyeti (3 TL/kart)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors sm:col-span-2">
                    <p className="text-sm text-gray-500 font-medium mb-2">Dijital Kart Maliyeti</p>
                    <p className="text-3xl font-bold text-gray-900">₺{digitalCardCost.toLocaleString('tr-TR')}</p>
                    <p className="text-xs text-gray-400 mt-2">Notouchness dijital kart maliyeti (700 TL/kart)</p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Doğaya Katkınız
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                      { val: treesSaved, label: "Ağaç", icon: Trees, color: "text-green-600", bg: "bg-green-50" },
                      { val: waterSaved, label: "Galon Su", icon: Droplet, color: "text-blue-600", bg: "bg-blue-50" },
                      { val: co2Saved, label: "Lb CO2", icon: Wind, color: "text-gray-600", bg: "bg-gray-50" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 cursor-default group">
                        <div className={`w-10 h-10 mx-auto ${item.bg} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <p className="text-xl font-bold text-gray-900">{item.val}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps - Curved Line Connector */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        {/* Connecting Line SVG */}
        <svg className="absolute top-1/2 left-0 w-full h-20 -translate-y-1/2 hidden md:block text-gray-100 z-0" preserveAspectRatio="none">
            <path d="M0 40 Q 250 0 500 40 T 1000 40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

        <div className="max-w-6xl mx-auto relative z-10">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
              <p className="text-gray-500">3 adımda şirketinizi geleceğe taşıyın.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-12">
              {[
                  { step: "01", title: "Analiz & Planlama", desc: "Mevcut kağıt kullanımınızı analiz edip size özel tasarruf planı oluşturuyoruz." },
                  { step: "02", title: "Dijital Entegrasyon", desc: "Tüm ekibiniz için NFC kartları hazırlıyor ve profil sistemine entegre ediyoruz." },
                  { step: "03", title: "Sürdürülebilir Etki", desc: "Anında kullanıma başlayarak karbon ayak izinizi düşürmeye başlıyorsunuz." },
              ].map((item, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow text-center relative group hover:-translate-y-2 duration-300">
                      <div className="w-14 h-14 bg-[#0f2e20] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-900/20 group-hover:rotate-12 transition-transform">
                          {item.step}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                  </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-[#f8fafc]">
          <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900">Sıkça Sorulan Sorular</h2>
              </div>
              <div className="space-y-4">
                  {faqs.map((faq, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <button 
                            onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                              <span className="font-semibold text-gray-900 pr-8">{faq.q}</span>
                              {activeAccordion === i ? <Minus className="w-5 h-5 text-green-600 flex-shrink-0" /> : <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                          </button>
                          <div className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${activeAccordion === i ? 'max-h-40 py-4 pb-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                              <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-[#0f2e20] text-center relative overflow-hidden">
         {/* Animated Rings */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-pulse"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/5 rounded-full animate-pulse delay-700"></div>
         
         <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Değişimin Parçası Olun</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Profesyonel kimliğinizi dijitalleştirin, doğayı koruyun ve geleceğe ilham verin.
            </p>
            <Link 
                href="/store" 
                className="inline-flex items-center gap-3 bg-white text-[#0f2e20] px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl group"
            >
                Hemen Başlayın <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes rotate-3d {
          0% { transform: rotateY(0deg) rotateX(10deg); }
          50% { transform: rotateY(180deg) rotateX(-10deg); }
          100% { transform: rotateY(360deg) rotateX(10deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        .preserve-3d {
            transform-style: preserve-3d;
        }
        .backface-hidden {
            backface-visibility: hidden;
        }
        .rotate-y-180 {
            transform: rotateY(180deg);
        }
        .animate-rotate-3d {
            animation: rotate-3d 12s linear infinite;
        }
        .animate-shine {
            animation: shine 3s infinite linear;
        }
        .perspective-1000 {
            perspective: 1000px;
        }
        .rotate-x-6 {
            transform: rotateX(6deg);
        }
      `}</style>
    </div>
  );
}
