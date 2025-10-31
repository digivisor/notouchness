'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { useCart } from '../context/CartContext';

export default function StorePage() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartVisible, setIsCartVisible] = useState(false);
  interface Product {
    id: number;
    name: string;
    price: number | string;
    image: string;
    category: string;
    description?: string;
  }
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(149);
  const [maxPrice, setMaxPrice] = useState(1499);
  const [sortBy, setSortBy] = useState('recommended');
  const [quantity, setQuantity] = useState(1);

  const openCart = () => {
    setIsCartVisible(true);
  };

  const closeCart = () => {
    setIsCartVisible(false);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    setQuantity(1);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleBuyNow = () => {
    // Satın alma sayfasına yönlendir
    window.location.href = '/checkout';
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value <= maxPrice) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= minPrice) {
      setMaxPrice(value);
    }
  };

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'metal', name: 'Metal Kartlar' },
    { id: 'wood', name: 'Ahşap Kartlar' },
    { id: 'premium', name: 'Premium' },
    { id: 'accessories', name: 'Aksesuarlar' }
  ];

  const products = [
    {
      id: 1,
      name: 'Notouchness Black Card',
      price: '₺899',
      category: 'metal',
      image: '/card.png',
      description: 'Premium Metal • NFC & QR • Sınırsız Paylaşım • Özel Tasarım',
      inStock: true
    },
    {
      id: 2,
      name: 'Notouchness White Card',
      price: '₺899',
      category: 'metal',
      image: '/card.png',
      description: 'Premium Metal • NFC & QR • Sınırsız Paylaşım • Özel Tasarım',
      inStock: true
    },
    {
      id: 3,
      name: 'Notouchness Wood Card',
      price: '₺1,299',
      category: 'wood',
      image: '/card.png',
      description: 'Doğal Ahşap • NFC & QR • Sınırsız Paylaşım • Eşsiz Doku',
      badge: 'Premium',
      inStock: true
    },
    {
      id: 4,
      name: 'Notouchness Gold Card',
      price: '₺1,499',
      category: 'premium',
      image: '/card.png',
      description: '24K Gold Plated • NFC & QR • Sınırsız Paylaşım • Lüks Tasarım',
      badge: 'Lüks',
      inStock: true
    },
    {
      id: 5,
      name: 'Notouchness Carbon Card',
      price: '₺1,099',
      category: 'premium',
      image: '/card.png',
      description: 'Carbon Fiber • NFC & QR • Sınırsız Paylaşım • Spor Tasarım',
      inStock: true
    },
    {
      id: 6,
      name: 'Kart Tutucu',
      price: '₺149',
      category: 'accessories',
      image: '/card.png',
      description: 'Deri Kart Tutucu • Premium Kalite • Şık Tasarım',
      inStock: true
    }
  ];

  // Filter by category and price
  let filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Filter by price range
  filteredProducts = filteredProducts.filter(p => {
    const price = parseInt(p.price.replace(/[₺,.]/g, ''));
    return price >= minPrice && price <= maxPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseInt(a.price.replace(/[₺,.]/g, ''));
    const priceB = parseInt(b.price.replace(/[₺,.]/g, ''));
    
    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name-asc':
        return a.name.localeCompare(b.name, 'tr');
      case 'name-desc':
        return b.name.localeCompare(a.name, 'tr');
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product, qty: number = 1) => {
    addToCart(product, qty);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header onCartClick={openCart} />

      {/* Cart Modal */}
      <CartModal isOpen={isCartVisible} onClose={closeCart} />

      {/* Hero Section */}
      <div className="bg-black text-white py-32 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Mağaza</h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Profesyonel dijital kartvizit çözümlerimizi keşfedin. Premium metal, ahşap ve özel tasarım seçenekleri.
          </p>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Left Sidebar - Filters (Full Height, Sticky) */}
        <div className="w-80 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-20 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="border-b border-gray-200 pb-6">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Kategoriler</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 font-medium transition-all rounded-lg ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Fiyat</h3>
                  <button className="text-sm text-gray-500 hover:text-gray-900">—</button>
                </div>
                <div className="space-y-6 price-range-container">
                  {/* Slider container with double range effect */}
                  <div className="relative">
                    <div className="relative h-2 bg-gray-300 rounded-full">
                      {/* Active range bar */}
                      <div 
                        className="absolute h-2 bg-black rounded-full" 
                        style={{ 
                          left: `${((minPrice - 149) / (1499 - 149)) * 100}%`,
                          right: `${100 - ((maxPrice - 149) / (1499 - 149)) * 100}%`
                        }}
                      ></div>
                      <input 
                        type="range" 
                        min="149" 
                        max="1499" 
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ top: '0' }}
                      />
                      <input 
                        type="range" 
                        min="149" 
                        max="1499" 
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ top: '0' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>₺{minPrice}</span>
                    <span>₺{maxPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Stok Durumu</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-black" />
                    <span className="text-gray-700">Stokta Olanlar</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-black" />
                    <span className="text-gray-700">Tükenenler</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Products */}
        <div className="flex-1">
            {/* Product Count & Sort */}
            <div className="mb-8 px-8 py-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedProducts.length}</span> ürün gösteriliyor
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sıralama:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 bg-white text-sm text-gray-900"
                >
                  <option value="recommended" className="text-gray-900">Önerilen</option>
                  <option value="price-asc" className="text-gray-900">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc" className="text-gray-900">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name-asc" className="text-gray-900">İsim: A-Z</option>
                  <option value="name-desc" className="text-gray-900">İsim: Z-A</option>
                  <option value="newest" className="text-gray-900">En Yeni</option>
                </select>
              </div>
            </div>
            
            {sortedProducts.length === 0 ? (
              <div className="px-8 py-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.3-4.3"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h3>
                  <p className="text-gray-600 mb-6">
                    Seçtiğiniz kriterlere uygun ürün bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setMinPrice(149);
                      setMaxPrice(1499);
                      setSortBy('recommended');
                    }}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                {sortedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    className="bg-gray-50 hover:shadow-2xl transition-all duration-300 group text-left flex flex-col"
                  >
              {/* Product Image */}
              <div className="relative w-full h-80 overflow-hidden">
                {product.badge && (
                  <div 
                    className="absolute top-2 left-2 px-3 py-1 bg-black text-white text-xs font-semibold z-10 rounded"
                  >
                    {product.badge}
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-lg">Stokta Yok</span>
                  </div>
                )}
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Product Details */}
              <div className="p-6 bg-white space-y-3 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                
                <p className="text-2xl font-bold text-gray-900">{product.price}</p>

                {/* Description */}
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 flex-1">
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                    <span>Detayları Gör</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product, 1);
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </button>
          ))}
              </div>
            )}
          </div>
        </div>

      {/* Product Detail Modal */}
      {isProductModalOpen && selectedProduct && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeProductModal}
          ></div>
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl relative">
              {/* Close Button */}
              <button 
                onClick={closeProductModal}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition z-10"
              >
                <X size={24} className="text-gray-600" />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-10">
                {/* Left - Product Image */}
                <div className="relative rounded-xl overflow-hidden">
                  {selectedProduct.badge && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-black text-white text-sm font-semibold z-10 rounded-lg">
                      {selectedProduct.badge}
                    </div>
                  )}
                  <div className="relative w-full h-[500px]">
                    <Image 
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Right - Product Details */}
                <div className="space-y-6 flex flex-col justify-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                    <p className="text-4xl font-bold text-gray-900">{selectedProduct.price}</p>
                  </div>

                  <div className="border-t border-b border-gray-200 py-4">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Ürün Özellikleri</h3>
                    <ul className="space-y-2">
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
                    </ul>
                  </div>

                  {/* Stock Status */}
                  <div className={`px-4 py-2 rounded-lg inline-block ${
                    selectedProduct.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.inStock ? '✓ Stokta Var' : '✗ Stokta Yok'}
                  </div>

                  {/* Quantity and Buttons */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700 font-medium">Adet:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-semibold"
                        >
                          -
                        </button>
                        <span className="px-6 py-2 border-x border-gray-300 text-gray-900 font-medium min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(selectedProduct, quantity);
                          closeProductModal();
                        }}
                        disabled={!selectedProduct.inStock}
                        className={`flex-1 py-4 font-semibold text-lg rounded-lg transition-all border-2 ${
                          selectedProduct.inStock 
                            ? 'bg-white text-black border-black hover:bg-gray-50' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                        }`}
                      >
                        Sepete Ekle
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow();
                        }}
                        disabled={!selectedProduct.inStock}
                        className={`flex-1 py-4 font-semibold text-lg rounded-lg transition-all ${
                          selectedProduct.inStock 
                            ? 'bg-black text-white hover:bg-gray-800' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
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
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
