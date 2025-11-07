'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, isLoaded } = useCart();
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Modal açıldığında render et ve animasyonu tetikle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Kısa bir delay ile animasyonu başlat (browser reflow için)
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Animasyon bitene kadar bekle, sonra DOM'dan kaldır
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // transition duration ile aynı
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCheckout = () => {
    onClose(); // Modal'ı kapat
    // Sepet yüklendikten sonra checkout'a git
    if (isLoaded && cartItems.length > 0) {
      router.push('/checkout');
    }
  };

  // Modal render edilmiyorsa hiçbir şey gösterme
  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop - Fade in/out animasyonu */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Cart Sidebar - Sağdan slide-in animasyonu */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-black">Sepetim</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {cartItems.length === 0 ? (
            /* Empty Cart - Daha modern tasarım */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-gray-200">
                <ShoppingCart size={48} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sepetiniz Boş</h3>
              <p className="text-gray-600 text-center mb-8 max-w-sm">
                Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın ve profesyonel dijital kartvizit çözümlerimizi keşfedin!
              </p>
              <Link 
                href="/store"
                onClick={onClose}
                className="inline-block bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition shadow-lg hover:shadow-xl text-center"
              >
                Mağazaya Git
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="relative w-20 h-20 bg-white rounded overflow-hidden shrink-0">
                      <Image 
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium text-gray-900 min-w-[30px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam</span>
                  <span className="text-2xl font-bold text-black">₺{getTotalPrice().toLocaleString('tr-TR')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Siparişi Tamamla
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
