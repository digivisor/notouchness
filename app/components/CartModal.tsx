'use client';

import React from 'react';
import Image from 'next/image';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500"
        onClick={onClose}
      ></div>
      
      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-50 shadow-2xl transform transition-all duration-500 ease-in-out">
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
            /* Empty Cart */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sepetiniz Boş</h3>
              <p className="text-gray-500 text-center mb-6">
                Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
              </p>
              <button 
                onClick={onClose}
                className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
              >
                Alışverişe Devam Et
              </button>
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
                  onClick={() => window.location.href = '/checkout'}
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
