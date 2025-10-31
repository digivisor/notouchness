'use client';

import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function Products() {
  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: 'Notouchness Black Card',
      price: '₺899',
      image: '/card-black.png',
      features: ['Premium Metal', 'NFC & QR', 'Sınırsız Paylaşım', 'Özel Tasarım']
    },
    {
      id: 2,
      name: 'Notouchness White Card',
      price: '₺899',
      image: '/card-white.png',
      features: ['Premium Metal', 'NFC & QR', 'Sınırsız Paylaşım', 'Özel Tasarım']
    },
    {
      id: 3,
      name: 'Notouchness Wood Card',
      price: '₺1,299',
      image: '/card-wood.png',
      features: ['Doğal Ahşap', 'NFC & QR', 'Sınırsız Paylaşım', 'Eşsiz Doku'],
      badge: 'Premium'
    },
    {
      id: 4,
      name: 'Notouchness Gold Card',
      price: '₺1,499',
      image: '/card-gold.png',
      features: ['24K Gold Plated', 'NFC & QR', 'Sınırsız Paylaşım', 'Lüks Tasarım'],
      badge: 'Lüks'
    },
    {
      id: 5,
      name: 'Notouchness Carbon Card',
      price: '₺1,099',
      image: '/card-carbon.png',
      features: ['Carbon Fiber', 'NFC & QR', 'Sınırsız Paylaşım', 'Spor Tasarım']
    }
  ];

  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kartlarımız
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profesyonel imajınıza uygun, kaliteli ve şık tasarımlarımızla tanışın
          </p>
        </div>

        {/* Ürün Kartları - Horizontal Scroll */}
        <div className="relative mb-12 flex items-center">
          {/* Sol Ok */}
          <button 
            onClick={() => {
              const container = document.getElementById('products-scroll');
              if (container) container.scrollBy({ left: -350, behavior: 'smooth' });
            }}
            className="absolute -left-16 z-10 bg-white shadow-lg p-3 hover:bg-gray-50 transition-all rounded-full"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div id="products-scroll" className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide w-full">
            {products.map((product) => (
              <div 
                key={product.id}
                className="flex-shrink-0 w-80 bg-gray-50 hover:shadow-xl transition-all duration-300 snap-start"
              >
                {/* Üst - Kart Görseli */}
                <div className="relative w-full h-80 flex items-center justify-center bg-gray-100 p-8">
                  {product.badge && (
                    <div 
                      className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-xs font-semibold z-10"
                    >
                      {product.badge}
                    </div>
                  )}
                  {/* Placeholder - gerçek kart görseli */}
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-64 h-40 bg-gradient-to-br from-gray-800 to-black shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform">
                      <p className="text-white text-xl font-light tracking-wider">notouchness</p>
                    </div>
                  </div>
                </div>

                {/* Alt - Detaylar */}
                <div className="p-6 bg-white space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  
                  <p className="text-2xl font-bold text-gray-900">{product.price}</p>

                  {/* Açıklama */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.features.join(' • ')}
                  </p>

                  {/* Satın Al Butonu */}
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-3 font-semibold bg-black text-white hover:bg-gray-800 transition-all"
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ Ok */}
          <button 
            onClick={() => {
              const container = document.getElementById('products-scroll');
              if (container) container.scrollBy({ left: 350, behavior: 'smooth' });
            }}
            className="absolute -right-16 z-10 bg-white shadow-lg p-3 hover:bg-gray-50 transition-all rounded-full"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mağaza Butonu */}
        <div className="text-center">
          <a 
            href="/store"
            className="inline-block px-10 py-4 font-semibold text-white transition-all hover:shadow-lg text-lg"
            style={{ backgroundColor: 'black' }}
          >
            Mağaza
          </a>
        </div>
      </div>
    </section>
  );
}
