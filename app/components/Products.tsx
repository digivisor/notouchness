'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Toast from './Toast';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import ProductModal, { type ModalProduct } from './ProductModal';

interface Product {
  id: number;
  name: string;
  price: string | number;
  image: string;
  backImage?: string;
  features: string[];
  badge?: string;
  description?: string;
  inStock?: boolean;
}

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  // DB row type for sales_cards (minimal fields used here)
  type SalesCardRow = {
    id: string;
    name: string;
    price: number;
    currency: string;
    features?: string[] | null;
    description?: string | null;
    in_stock?: boolean | null;
    image_front?: string | null;
    image_back?: string | null;
    badge?: string | null;
    created_at?: string;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('sales_cards')
          .select('id,name,price,currency,features,description,in_stock,image_front,image_back,badge,created_at')
          .order('created_at', { ascending: false })
          .limit(12);
        if (error) {
          console.error('Homepage products fetch error:', error.message);
          return;
        }
        if (!cancelled) {
          const mapped: Product[] = (data as SalesCardRow[] | null | undefined || []).map((row, idx) => ({
            id: idx + 1,
            name: row.name,
            price: row.currency === 'TRY' ? `₺${row.price}` : `${row.price} ${row.currency}`,
            image: row.image_front || '/card-black.png',
            backImage: row.image_back || undefined,
            features: row.features && row.features.length ? row.features : ['NFC & QR', 'Sınırsız Paylaşım'],
            badge: row.badge || undefined,
            description: row.description || undefined,
            inStock: row.in_stock !== null ? row.in_stock : true,
          }));
          setProducts(mapped);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

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
            {(loading ? Array.from({ length: 5 }).map((_, i) => ({ id: i + 1, name: 'Yükleniyor…', price: '—', image: '/card-black.png', backImage: undefined, features: ['—'], badge: undefined })) : products).map((product) => (
              <div 
                key={product.id}
                className="group shrink-0 w-80 bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 snap-start flex flex-col"
                onClick={() => {
                  setSelectedProduct(product);
                  setIsProductModalOpen(true);
                }}
              >
                {/* Üst - Kart Görseli (Gerçek görseller + flip) */}
                <div className="relative w-full h-72 overflow-hidden bg-gray-50 perspective">
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10 rounded px-3 py-1 bg-black/90 text-white text-xs font-semibold">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute inset-0 preserve-3d flip-inner">
                    {/* Front */}
                    <div className="flip-face">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                    {/* Back */}
                    <div className="flip-face flip-back">
                      <Image
                        src={product.backImage || product.image}
                        alt={`${product.name} arka yüz`}
                        fill
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  </div>
                  {/* Price pill */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="inline-block rounded-full bg-black text-white shadow-lg px-3 py-1 text-base font-semibold">
                      {product.price}
                    </span>
                  </div>
                </div>

                {/* Alt - Detaylar */}
                <div className="p-5 bg-white space-y-3 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-11">{product.name}</h3>

                  {/* Açıklama */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-10">
                    {product.features.join(' • ')}
                  </p>

                  {/* Satın Al Butonu */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      addToCart(product); 
                      setAddedToCart(product.id);
                      setTimeout(() => setAddedToCart(null), 2000);
                    }}
                    className={`w-full mt-auto py-3 font-semibold transition-all rounded-lg ${
                      addedToCart === product.id
                        ? 'bg-gray-900 text-white scale-105'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {addedToCart === product.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Eklendi!
                      </span>
                    ) : (
                      'Sepete Ekle'
                    )}
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
          <Link 
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white bg-black rounded-full transition-all hover:shadow-xl hover:-translate-y-0.5 text-lg"
          >
            Mağaza
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
      {/* Product Detail Modal (same style as store) */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={selectedProduct ? {
          ...selectedProduct,
          description: selectedProduct.description,
          inStock: selectedProduct.inStock
        } as unknown as ModalProduct : null}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={(p, qty) => {
          addToCart(p as unknown as { id: number; name: string; price: string | number; image: string }, qty);
          setAddedToCart(p.id);
          setTimeout(() => setAddedToCart(null), 2000);
        }}
        onBuyNow={() => {
          window.location.href = '/checkout';
        }}
      />
    </section>
  );
}

// Modal usage at bottom to keep file tidy
export function ProductsModalHost() {
  return null;
}
