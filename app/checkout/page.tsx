'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import CardSVG from '../components/CardSVG';
import { ArrowLeft, Truck, Shield, CreditCard, Settings } from 'lucide-react';
import { CardData } from '../components/ProductModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getTotalPrice, isLoaded, updateCartItemCardsData } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<{ [itemId: number]: number }>({});
  const [localCardsData, setLocalCardsData] = useState<{ [itemId: number]: CardData[] }>({});
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<{ [key: string]: boolean }>({});
  const logoDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    orderNote: '',
  });

  // localStorage'dan form verilerini yükle
  useEffect(() => {
    const savedFormData = localStorage.getItem('checkout_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Form data parse error:', e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(logoDropdownRefs.current).forEach(key => {
        const ref = logoDropdownRefs.current[key];
        if (ref && !ref.contains(event.target as Node)) {
          setIsLogoModalOpen(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    if (Object.values(isLogoModalOpen).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLogoModalOpen]);

  // Tüm kartların dolu olup olmadığını kontrol et
  const allCardsValid = () => {
    return Object.values(localCardsData).every(cards => {
      if (!cards || cards.length === 0) return false;
      return cards.every(card => card.name && card.logo);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kart validasyonu
    if (!allCardsValid()) {
      alert('Lütfen tüm kartlar için logo ve isim bilgilerini doldurun!');
      return;
    }
    
    // Form verilerini localStorage'a kaydet
    localStorage.setItem('checkout_form_data', JSON.stringify(formData));
    
    // Ödeme sayfasına yönlendir
    router.push('/checkout/odeme');
  };

  // İlk item için aktif tab'ı ayarla ve localCardsData'yı başlat
  useEffect(() => {
    if (cartItems.length > 0) {
      const newActiveTabs: { [itemId: number]: number } = {};
      const newLocalCardsData: { [itemId: number]: CardData[] } = {};
      
      cartItems.forEach(item => {
        // Önce localCardsData'dan, yoksa item.cardsData'dan al
        const existingCards = localCardsData[item.id] || item.cardsData || [];
        const requiredCards = item.quantity;
        
        // Her zaman quantity kadar kart olmalı - quantity kontrolü yap
        let finalCards: CardData[];
        let needsUpdate = false;
        
        if (existingCards.length < requiredCards) {
          // Eksik kartları ekle
          finalCards = [...existingCards];
          for (let i = existingCards.length; i < requiredCards; i++) {
            finalCards.push({
              name: '',
              subtitle: '',
              logo: null,
              logoSize: 80,
              logoX: 10,
              logoY: 12,
              logoInverted: false,
            });
          }
          needsUpdate = true;
        } else if (existingCards.length > requiredCards) {
          // Fazla kartları kaldır
          finalCards = existingCards.slice(0, requiredCards);
          needsUpdate = true;
        } else if (existingCards.length === 0) {
          // Hiç kart yoksa, quantity kadar oluştur
          finalCards = Array.from({ length: requiredCards }, () => ({
            name: '',
            subtitle: '',
            logo: null,
            logoSize: 80,
            logoX: 10,
            logoY: 12,
            logoInverted: false,
          }));
          needsUpdate = true;
        } else {
          // Mevcut kartları kullan (zaten doğru sayıda)
          finalCards = [...existingCards];
        }
        
        // Eğer değişiklik varsa güncelle
        if (needsUpdate) {
          updateCartItemCardsData(item.id, finalCards);
        }
        
        newLocalCardsData[item.id] = finalCards;
        
        if (!activeCardTab[item.id] && finalCards.length > 0) {
          newActiveTabs[item.id] = 0;
        }
      });
      
      if (Object.keys(newActiveTabs).length > 0) {
        setActiveCardTab(prev => ({ ...prev, ...newActiveTabs }));
      }
      if (Object.keys(newLocalCardsData).length > 0) {
        setLocalCardsData(prev => ({ ...prev, ...newLocalCardsData }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Kart verilerini güncelle
  const updateCardData = (itemId: number, cardIndex: number, updates: Partial<CardData>) => {
    setLocalCardsData(prev => {
      const itemCards = prev[itemId] || [];
      const newCards = [...itemCards];
      if (newCards[cardIndex]) {
        newCards[cardIndex] = { ...newCards[cardIndex], ...updates };
        // CartContext'e de kaydet
        updateCartItemCardsData(itemId, newCards);
      }
      return { ...prev, [itemId]: newCards };
    });
  };

  const shippingCost = 0;
  const totalPrice = getTotalPrice();
  const grandTotal = totalPrice + shippingCost;

  // Sepet yüklenene kadar loading göster
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartVisible(true)} />
        <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Sepet boşsa mağazaya yönlendir (sadece yüklendikten sonra kontrol et)
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartVisible(true)} />
        <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">Checkout yapmak için sepetinize ürün eklemelisiniz.</p>
            <Link 
              href="/store"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Mağazaya Git
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-20">
        {/* Back Button */}
        <Link 
          href="/store"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Alışverişe Devam Et
        </Link>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${
                  s === 1 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    s === 1 ? 'bg-gray-200' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className="text-sm text-gray-900 font-medium">Bilgiler</span>
            <span className="text-sm text-gray-400">Ödeme</span>
            <span className="text-sm text-gray-400">Onay</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kart Bilgileri - İletişim Bilgilerinin Üstünde */}
              {cartItems.map((item) => {
                const itemCards = localCardsData[item.id] || item.cardsData || [];
                // Quantity kadar kart olmalı
                const requiredCards = item.quantity;
                const displayCards = itemCards.length >= requiredCards 
                  ? itemCards.slice(0, requiredCards)
                  : itemCards;
                
                if (displayCards.length === 0) return null;
                
                const currentTab = activeCardTab[item.id] || 0;
                const currentCard = displayCards[currentTab] || {
                  name: '',
                  subtitle: '',
                  logo: null,
                  logoSize: 80,
                  logoX: 10,
                  logoY: 12,
                  logoInverted: false,
                };
                
                const logoModalKey = `${item.id}-${currentTab}`;
                
                return (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">{item.name}</h2>
                    
                    {/* Tabs - Eğer birden fazla kart varsa */}
                    {displayCards.length > 1 && (
                      <div className="border-b border-gray-200 mb-4">
                        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide">
                          {displayCards.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setActiveCardTab(prev => ({ ...prev, [item.id]: index }))}
                              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                                currentTab === index
                                  ? 'border-b-2 border-black text-black'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Kart {index + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* İsim ve Logo Input'ları */}
                    <div className="space-y-3">
                      {/* Ad Soyad ve Alt Başlık - Yan Yana */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Ad Soyad Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Ad Soyad {displayCards.length > 1 && `(Kart ${currentTab + 1})`}
                          </label>
                          <input
                            type="text"
                            value={currentCard.name || ''}
                            onChange={(e) => updateCardData(item.id, currentTab, { name: e.target.value })}
                            placeholder="Adınızı ve soyadınızı girin"
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          />
                        </div>

                        {/* Alt Başlık Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Alt Başlık {displayCards.length > 1 && `(Kart ${currentTab + 1})`}
                          </label>
                          <input
                            type="text"
                            value={currentCard.subtitle || ''}
                            onChange={(e) => updateCardData(item.id, currentTab, { subtitle: e.target.value })}
                            placeholder="Örn: Altensis, Yönetici Ortağı"
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>

                      {/* Logo Input */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Logo {displayCards.length > 1 && `(Kart ${currentTab + 1})`}
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateCardData(item.id, currentTab, { logo: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id={`logo-input-${item.id}-${currentTab}`}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById(`logo-input-${item.id}-${currentTab}`)?.click()}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                          >
                            {currentCard.logo ? 'Değiştir' : 'Yükle'}
                          </button>
                          {currentCard.logo && (
                            <>
                              <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden">
                                <img src={currentCard.logo} alt="Logo" className="w-full h-full object-contain" />
                              </div>
                              <button
                                type="button"
                                onClick={() => updateCardData(item.id, currentTab, { logo: null })}
                                className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800"
                              >
                                Kaldır
                              </button>
                              <div className="relative" ref={(el) => { logoDropdownRefs.current[logoModalKey] = el; }}>
                                <button
                                  type="button"
                                  onClick={() => setIsLogoModalOpen(prev => ({ ...prev, [logoModalKey]: !prev[logoModalKey] }))}
                                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-1"
                                >
                                  <Settings size={12} />
                                  Logo Ayarları
                                </button>
                                {isLogoModalOpen[logoModalKey] && (
                                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]">
                                    <div className="space-y-4">
                                      {/* Logo Boyutu */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                          Logo Boyutu: {currentCard.logoSize}px
                                        </label>
                                        <input
                                          type="range"
                                          min="20"
                                          max="120"
                                          value={currentCard.logoSize}
                                          onChange={(e) => updateCardData(item.id, currentTab, { logoSize: Number(e.target.value) })}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                      </div>

                                      {/* Logo Yeri - X */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                          Yatay Konum (X): {currentCard.logoX}px
                                        </label>
                                        <input
                                          type="range"
                                          min="0"
                                          max="200"
                                          value={currentCard.logoX}
                                          onChange={(e) => updateCardData(item.id, currentTab, { logoX: Number(e.target.value) })}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                      </div>

                                      {/* Logo Yeri - Y */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                          Dikey Konum (Y): {currentCard.logoY}px
                                        </label>
                                        <input
                                          type="range"
                                          min="0"
                                          max="200"
                                          value={currentCard.logoY}
                                          onChange={(e) => updateCardData(item.id, currentTab, { logoY: Number(e.target.value) })}
                                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                        />
                                      </div>

                                      {/* Logoyu Beyaz Yap */}
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => updateCardData(item.id, currentTab, { logoInverted: !currentCard.logoInverted })}
                                          className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                                            currentCard.logoInverted
                                              ? 'bg-black text-white hover:bg-gray-800'
                                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                          }`}
                                        >
                                          {currentCard.logoInverted ? 'Logoyu Normal Yap' : 'Logoyu Beyaz Yap'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Kişisel Bilgiler */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">İletişim Bilgileri</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0555 555 55 55"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Teslimat Adresi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fatura Bilgileri (Opsiyonel) */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Fatura Bilgileri (İsteğe Bağlı)</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
                    <input
                      type="text"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Dairesi</label>
                    <input
                      type="text"
                      name="taxOffice"
                      value={formData.taxOffice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sipariş Notu */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Notu (İsteğe Bağlı)</h2>
                <textarea
                  name="orderNote"
                  value={formData.orderNote}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Siparişiniz hakkında özel bir notunuz varsa buraya yazabilirsiniz..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Ödeme Adımına Geç
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Özeti</h2>
              
              {/* Cart Items - Tab Sistemi ile Kartlar */}
              <div className="space-y-6 mb-4">
                {cartItems.map((item) => {
                  const itemCards = localCardsData[item.id] || item.cardsData || [];
                  // Quantity kadar kart olmalı
                  const requiredCards = item.quantity;
                  const displayCards = itemCards.length >= requiredCards 
                    ? itemCards.slice(0, requiredCards)
                    : itemCards;
                  
                  if (displayCards.length === 0) return null;
                  
                  const numericPrice = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[₺,.]/g, ''))
                    : item.price;
                  const displayPrice = typeof item.price === 'string' ? item.price : `₺${item.price}`;
                  const itemTotal = numericPrice * item.quantity;
                  
                  const itemActiveTab = activeCardTab[item.id] || 0;
                  const currentCard = displayCards[itemActiveTab] || {
                    name: '',
                    logo: null,
                    logoSize: 80,
                    logoX: 10,
                    logoY: 12,
                    logoInverted: false,
                  };
                  
                  return (
                    <div key={item.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-3">{item.name}</h4>
                      
                      {/* Tabs - Eğer birden fazla kart varsa */}
                      {displayCards.length > 1 && (
                        <div className="border-b border-gray-200 mb-3">
                          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {displayCards.map((_, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setActiveCardTab(prev => ({ ...prev, [item.id]: index }))}
                                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                                  itemActiveTab === index
                                    ? 'border-b-2 border-black text-black'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Kart {index + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Aktif Tab'ın Kart SVG'si */}
                      <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="relative w-full max-w-[200px] aspect-[240.9/153.1]">
                          <CardSVG
                            name={currentCard.name}
                            subtitle={currentCard.subtitle}
                            logo={currentCard.logo}
                            logoSize={currentCard.logoSize}
                            logoX={currentCard.logoX}
                            logoY={currentCard.logoY}
                            logoInverted={currentCard.logoInverted}
                          />
                        </div>
                      </div>
                      
                      {/* Kart Durumu */}
                      <div className="text-xs text-gray-600 mb-2">
                        {currentCard.name && currentCard.logo ? (
                          <span className="text-green-600">✓ Hazır</span>
                        ) : (
                          <span className="text-orange-600">⚠ Eksik bilgi</span>
                        )}
                        {currentCard.name && (
                          <span className="ml-2 text-gray-600">- {currentCard.name}</span>
                        )}
                      </div>
                      
                      {/* Açıklama */}
                      <p className="text-xs text-gray-600 mb-3">
                        Profesyonel dijital kartvizit: NFC ve QR ile hızlı paylaşım, sınırsız güncelleme ve şık tasarım.
                      </p>
                      
                      {/* Fiyat Bilgisi */}
                      <div className="text-xs text-gray-600">
                        <p>Adet: {item.quantity}</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {displayPrice} x {item.quantity} = ₺{itemTotal.toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-900">₺{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium text-green-600">Ücretsiz</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-xl text-gray-900">₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={20} className="shrink-0" />
                  <span>Ücretsiz kargo</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={20} className="shrink-0" />
                  <span>Güvenli ödeme</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard size={20} className="shrink-0" />
                  <span>Tüm kartlar kabul edilir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
