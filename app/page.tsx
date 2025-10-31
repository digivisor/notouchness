'use client';

import { useState } from 'react';
import About from './components/About';
import Products from './components/Products';
import HowItWorks from './components/HowItWorks';
import CorporateCTA from './components/CorporateCTA';
import CorporateModal from './components/CorporateModal';
import Brands from './components/Brands';
import MobileApp from './components/MobileApp';
import Footer from './components/Footer';
import Header from './components/Header';
import CartModal from './components/CartModal';

export default function Home() {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);

  const openCart = () => {
    setIsCartVisible(true);
  };

  const closeCart = () => {
    setIsCartVisible(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header onCartClick={openCart} />

      {/* Cart Modal */}
      <CartModal isOpen={isCartVisible} onClose={closeCart} />

      {/* Sharp White Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sharp white geometric shapes */}
        <div className="absolute top-10 left-20 w-64 h-64 bg-white/10 rounded-lg blur-2xl"></div>
        <div className="absolute top-32 right-32 w-80 h-80 bg-white/8 blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-72 bg-white/12 blur-2xl"></div>
        <div className="absolute top-1/3 left-10 w-48 h-48 bg-white/6 rounded-full blur-xl"></div>
        
        {/* Additional sharp effects */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-white/8 blur-xl rotate-45"></div>
      </div>
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-8">
              <h1 className="text-5xl lg:text-6xl font-light text-white leading-tight">
                Profesyonel kimliğin notouchness ile{' '}
                <span className="inline-block px-4 py-1 rounded-full text-white" style={{ backgroundColor: '#4BA3A2' }}>
                  artık dijital.
                </span>
              </h1>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-xl">
                Profesyonel kimliğinizi dijital dünyada etkileyici bir şekilde sunar, çevreyi koruyarak ağınızı genişletmenize olanak sağlar.
              </p>
              <div className="flex gap-4 pt-4">
                <button 
                  className="text-white px-8 py-3 rounded-full font-medium transition hover:opacity-90"
                  style={{ backgroundColor: '#4BA3A2' }}
                >
                  KARTINIZI OLUŞTURUN
                </button>
                <button className="border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition">
                  KURUMSALA ÖZEL
                </button>
              </div>
            </div>
            {/* Right Content - Phone & Card */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                
                {/* Phone Mockup */}
                <div className="relative z-10 w-64 mx-auto">
                  <div className="bg-white rounded-[3rem] p-3 shadow-2xl">
                    <div className="bg-gray-100 rounded-[2.5rem] overflow-hidden">
                      <div className="aspect-[9/19] bg-white flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                            <p className="text-white text-4xl font-light">N</p>
                          </div>
                          <p className="text-xs text-gray-400">notouchness</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full"></div>
                </div>

                {/* NFC Card */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-8 z-20">
                  <div className="w-72 h-44 bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-2xl p-6 flex flex-col justify-between transform rotate-12 hover:rotate-6 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 border-2 border-white/20 rounded-lg"></div>
                    </div>
                    <div>
                      <p className="text-white text-xl font-light tracking-wider">notouchness</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Products Section */}
      <Products />

      {/* Corporate CTA Section */}
      <CorporateCTA onOpenModal={() => setIsCorporateModalOpen(true)} />

      {/* Brands Section */}
      <Brands />

      {/* Mobile App Section */}
      <MobileApp />

      {/* Footer */}
      <Footer />

      {/* Corporate Modal */}
      <CorporateModal 
        isOpen={isCorporateModalOpen} 
        onClose={() => setIsCorporateModalOpen(false)} 
      />
    </div>
  );
}
