"use client";

import Image from 'next/image';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface ModalProduct {
  id: number;
  name: string;
  price: string | number;
  image: string;
  backImage?: string;
  description?: string;
  features?: string[];
  badge?: string;
  inStock?: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  product: ModalProduct | null;
  onClose: () => void;
  onAddToCart: (product: ModalProduct, qty: number) => void;
  onBuyNow: (product: ModalProduct, qty: number) => void;
}

export default function ProductModal({ isOpen, product, onClose, onAddToCart, onBuyNow }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl relative">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition z-10">
            <X size={24} className="text-gray-600" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-10">
            {/* Left - Product Image */}
            <div className="relative rounded-xl overflow-hidden">
              {product.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-black text-white text-sm font-semibold z-10 rounded-lg">
                  {product.badge}
                </div>
              )}
              <div className="relative w-full h-[500px]">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6 flex flex-col justify-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-4xl font-bold text-gray-900">{product.price}</p>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'Profesyonel dijital kartvizit: NFC ve QR ile hızlı paylaşım, sınırsız güncelleme ve şık tasarım.'}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Ürün Özellikleri</h3>
                <ul className="space-y-2">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">NFC ve QR kod teknolojisi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">Sınırsız paylaşım ve güncelleme</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">Özel tasarım ve baskı seçenekleri</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">Su geçirmez ve dayanıklı</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-black mt-1">✓</span>
                        <span className="text-gray-700">Anında aktivasyon</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Stock Status */}
              <div className={`px-4 py-2 rounded-lg inline-block ${product.inStock !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.inStock !== false ? '✓ Stokta Var' : '✗ Stokta Yok'}
              </div>

              {/* Quantity and Buttons */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Adet:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-semibold">-</button>
                    <span className="px-6 py-2 border-x border-gray-300 text-gray-900 font-medium min-w-[60px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-semibold">+</button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product, quantity); onClose(); }}
                    disabled={product.inStock === false}
                    className={`flex-1 py-4 font-semibold text-lg rounded-lg transition-all border-2 ${product.inStock !== false ? 'bg-white text-black border-black hover:bg-gray-50' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'}`}
                  >
                    Sepete Ekle
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onBuyNow(product, quantity); }}
                    disabled={product.inStock === false}
                    className={`flex-1 py-4 font-semibold text-lg rounded-lg transition-all ${product.inStock !== false ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    Satın Al
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
