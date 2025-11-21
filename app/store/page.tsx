'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import ProductModal, { type ModalProduct } from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';

export default function StorePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  interface Product {
    id: number;
    name: string;
    price: number | string;
    image: string;
    backImage?: string;
    category: string;
    description?: string;
    features?: string[];
    badge?: string;
    inStock?: boolean;
  }
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(149);
  const [maxPrice, setMaxPrice] = useState(1499);
  const [realMinPrice, setRealMinPrice] = useState(149);
  const [realMaxPrice, setRealMaxPrice] = useState(1499);
  const [sortBy, setSortBy] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const openCart = () => {
    setIsCartVisible(true);
  };

  const closeCart = () => {
    setIsCartVisible(false);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleBuyNow = (product: ModalProduct, qty: number = 1) => {
    // Ürünü sepete ekle (zaten sepette varsa miktarı artırır)
    addToCart(product as unknown as Product, qty);
    // Modal'ı kapat
    closeProductModal();
    // Checkout sayfasına yönlendir
    router.push('/checkout');
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

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'metal', name: 'Metal Kartlar' },
    { id: 'wood', name: 'Ahşap Kartlar' },
    { id: 'premium', name: 'Premium' },
    { id: 'accessories', name: 'Aksesuarlar' }
  ];

  // DB row type for sales_cards
  type SalesCardRow = {
    id: string;
    name: string;
    price: number;
    currency: string;
    category: string;
    badge?: string | null;
    description?: string | null;
    features?: string[] | null;
    image_front?: string | null;
    image_back?: string | null;
    stock_count?: number | null;
    in_stock?: boolean | null;
    created_at?: string;
  };

  // Load products from Supabase sales_cards
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sales_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Sales cards fetch error:', error.message);
        setIsLoading(false);
        return;
      }
      if (!cancelled) {
        const mapped: Product[] = (data as SalesCardRow[] | null | undefined || []).map((row, idx) => ({
          id: idx + 1,
          name: row.name,
          price: row.currency === 'TRY' ? `₺${row.price}` : `${row.price} ${row.currency}`,
          category: row.category,
          image: row.image_front || '/card.png',
          backImage: row.image_back || undefined,
          description: row.description || '',
          features: row.features || undefined,
          badge: row.badge || undefined,
          inStock: row.in_stock !== null ? row.in_stock : true,
        }));
        setProducts(mapped);
        // Dinamik min/max fiyatı hesapla
        const prices = mapped.map(p => typeof p.price === 'number' ? p.price : parseInt(p.price.replace(/[^0-9]/g, '')));
        const min = prices.length ? Math.min(...prices) : 149;
        const max = prices.length ? Math.max(...prices) : 1499;
        setRealMinPrice(min);
        setRealMaxPrice(max);
        setMinPrice(min);
        setMaxPrice(max);
        setIsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // Filter by category and price
  const toNumberPrice = (p: string | number) => (typeof p === 'number' ? p : parseInt(p.replace(/[₺,.]/g, '')));
  const filteredProductsBase = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Filter by price range
  const filteredProducts = filteredProductsBase.filter(p => {
    const price = toNumberPrice(p.price);
    return price >= minPrice && price <= maxPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = toNumberPrice(a.price);
    const priceB = toNumberPrice(b.price);
    
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
    setAddedToCart(product.id);
    // Sepeti otomatik aç
    setIsCartVisible(true);
    setTimeout(() => setAddedToCart(null), 2500);
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
      <div className="flex flex-col lg:flex-row">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-16 bg-white z-30">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="4" y1="21" y2="14"/>
              <line x1="4" x2="4" y1="10" y2="3"/>
              <line x1="12" x2="12" y1="21" y2="12"/>
              <line x1="12" x2="12" y1="8" y2="3"/>
              <line x1="20" x2="20" y1="21" y2="16"/>
              <line x1="20" x2="20" y1="12" y2="3"/>
              <line x1="1" x2="7" y1="14" y2="14"/>
              <line x1="9" x2="15" y1="8" y2="8"/>
              <line x1="17" x2="23" y1="16" y2="16"/>
            </svg>
            Filtrele
          </button>
          <span className="text-sm text-gray-500">{sortedProducts.length} ürün</span>
        </div>

        {/* Sidebar - Filters */}
        <div className={`
          fixed inset-0 z-50 bg-white lg:static lg:z-auto lg:w-80 lg:shrink-0 lg:border-r lg:border-gray-200 lg:min-h-screen lg:sticky lg:top-20 lg:block
          ${isMobileFiltersOpen ? 'block' : 'hidden'}
        `}>
          {/* Mobile Filter Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Filtreler</h2>
            <button 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6 h-full overflow-y-auto pb-24 lg:pb-6">
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
                          left: `${((minPrice - realMinPrice) / (realMaxPrice - realMinPrice)) * 100}%`,
                          right: `${100 - ((maxPrice - realMinPrice) / (realMaxPrice - realMinPrice)) * 100}%`
                        }}
                      ></div>
                      <input 
                        type="range" 
                        min={realMinPrice}
                        max={realMaxPrice}
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ top: '0' }}
                      />
                      <input 
                        type="range" 
                        min={realMinPrice}
                        max={realMaxPrice}
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                        style={{ top: '0' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                    <span>₺{realMinPrice}</span>
                    <span>₺{realMaxPrice.toLocaleString('tr-TR')}</span>
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
            <div className="mb-8 px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 hidden lg:block">
                <span className="font-semibold text-gray-900">{sortedProducts.length}</span> ürün gösteriliyor
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sıralama:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 bg-white text-sm text-gray-900"
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
            
            {isLoading ? (
              // Skeleton Loader - Ürünler yüklenene kadar göster
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-8">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-gray-50 flex flex-col animate-pulse">
                    {/* Image Skeleton */}
                    <div className="w-full h-80 bg-gray-200"></div>
                    
                    {/* Content Skeleton */}
                    <div className="p-6 bg-white space-y-3 flex-1 flex flex-col">
                      {/* Title Skeleton */}
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      
                      {/* Price Skeleton */}
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      
                      {/* Description Skeleton */}
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      
                      {/* Buttons Skeleton */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-8 pb-12">
                {sortedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    className="bg-gray-50 hover:shadow-2xl transition-all duration-300 group text-left flex flex-col"
                  >
              {/* Product Image (Flip on hover) */}
              <div className="relative w-full h-80 overflow-hidden perspective">
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
                <div className="absolute inset-0 preserve-3d flip-inner">
                  {/* Front side */}
                  <div className="flip-face">
                    <Image 
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  {/* Back side */}
                  <div className="flip-face flip-back">
                    <Image 
                      src={product.backImage || (product.image === '/kartön.png' ? '/kartarka.png' : product.image)}
                      alt={`${product.name} arka yüz`}
                      fill
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      addedToCart === product.id
                        ? 'text-white scale-110 shadow-lg animate-pulse'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                    style={addedToCart === product.id ? { backgroundColor: '#325E5F' } : {}}
                  >
                    {addedToCart === product.id ? (
                      <>
                        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-bold">Eklendi!</span>
                      </>
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                  </button>
                </div>
              </div>
            </button>
          ))}
              </div>
            )}
          </div>
        </div>

      {/* Product Detail Modal - using shared component */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={selectedProduct as unknown as ModalProduct}
        onClose={closeProductModal}
        onAddToCart={(p, qty) => {
          handleAddToCart(p as unknown as Product, qty);
        }}
        onCartOpen={openCart}
        onBuyNow={handleBuyNow}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
