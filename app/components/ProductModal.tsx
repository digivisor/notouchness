"use client";

import Image from 'next/image';
import { X, Check, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import CardSVG from './CardSVG';

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
  onAddToCart: (product: ModalProduct, qty: number, cardsData?: CardData[]) => void;
  onBuyNow: (product: ModalProduct, qty: number, cardsData?: CardData[]) => void;
  onCartOpen?: () => void; // Sepet modal'ını açmak için callback
}

export interface CardData {
  name: string;
  subtitle: string;
  logo: string | null;
  logoSize: number;
  logoX: number;
  logoY: number;
  logoInverted: boolean;
  svgOutput?: string;
  cardHash?: string; // QR kod için kart hash'i
  nameFontWeight?: number; // Ad soyad yazı kalınlığı (100-900)
  subtitleFontWeight?: number; // Alt başlık yazı kalınlığı (100-900)
  nameFontSize?: number; // Ad soyad font boyutu
  subtitleFontSize?: number; // Alt başlık font boyutu
}

export default function ProductModal({ isOpen, product, onClose, onAddToCart, onBuyNow, onCartOpen }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDropdownRef = useRef<HTMLDivElement>(null);
  const svgRefs = useRef<{ [key: number]: SVGSVGElement | null }>({});

  // Initialize cards when quantity changes
  useEffect(() => {
    setCards(Array(quantity).fill(null).map(() => ({
      name: '',
      subtitle: '',
      logo: null,
      logoSize: 80,
      logoX: 10,
      logoY: 12,
      logoInverted: false,
    })));
    if (activeTab >= quantity) {
      setActiveTab(Math.max(0, quantity - 1));
    }
  }, [quantity]);

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity(1);
      setIsAdded(false);
      setActiveTab(0);
      setIsLogoModalOpen(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoDropdownRef.current && !logoDropdownRef.current.contains(event.target as Node)) {
        setIsLogoModalOpen(false);
      }
    };

    if (isLogoModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLogoModalOpen]);

  // SVG ref'lerini güncelle
  useEffect(() => {
    cards.forEach((_, index) => {
      const svgElement = document.querySelector(`[data-card-index="${index}"] svg`) as SVGSVGElement;
      if (svgElement) {
        svgRefs.current[index] = svgElement;
      }
    });
  }, [cards]);

  if (!isOpen || !product) return null;

  const currentCard = cards[activeTab] || {
    name: '',
    logo: null,
    logoSize: 80,
    logoX: 10,
    logoY: 12,
    logoInverted: false,
  };

  const updateCard = (updates: Partial<CardData>) => {
    const newCards = [...cards];
    newCards[activeTab] = { ...newCards[activeTab], ...updates };
    setCards(newCards);
  };

  // SVG'yi string'e çeviren fonksiyon - CardSVG component'ini kullanarak
  const generateSVGString = (cardData: CardData, index: number): string => {
    // SVG ref'inden string al
    const svgElement = svgRefs.current[index];
    if (svgElement) {
      // SVG element'ini klonla ve string'e çevir
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      // Namespace'leri düzelt
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      return new XMLSerializer().serializeToString(clonedSvg);
    }
    // Fallback: Manuel SVG oluştur
    const logoImage = cardData.logo 
      ? `<image href="${cardData.logo}" x="${cardData.logoX}" y="${cardData.logoY}" width="${cardData.logoSize}" height="${cardData.logoSize}" preserveAspectRatio="xMinYMin meet"${cardData.logoInverted ? ' filter="url(#invert-filter)"' : ''} />`
      : '';
    
    const nameText = cardData.name 
      ? `<text x="10" y="138" class="name-text" textAnchor="start">${cardData.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
      : '';

    // CardSVG'nin tam içeriğini buraya eklemek yerine, ref kullanarak alacağız
    return '';
  };

  const allCardsFilled = cards.length > 0 && cards.every(card => card.name && card.logo);

  // Kart verilerini SVG çıktılarıyla birlikte hazırla
  const prepareCardsData = (): CardData[] => {
    // SVG'lerin render edilmesini bekle
    return cards.map((card, index) => {
      // Önce ref'ten almayı dene
      let svgElement = svgRefs.current[index];
      
      // Eğer ref'te yoksa, DOM'dan al
      if (!svgElement) {
        const domElement = document.querySelector(`[data-card-index="${index}"] svg`) as SVGSVGElement;
        if (domElement) {
          svgElement = domElement;
          svgRefs.current[index] = domElement;
        }
      }
      
      let svgOutput = '';
      
      if (svgElement) {
        const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
        // Namespace'leri düzelt
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        // ID'leri unique yap (her kart için farklı ID'ler)
        const uniqueId = `card-${index}-${Date.now()}`;
        clonedSvg.setAttribute('id', `Layer_1_${uniqueId}`);
        // Filter ve gradient ID'lerini unique yap
        const defs = clonedSvg.querySelector('defs');
        if (defs) {
          const filter = defs.querySelector('#invert-filter');
          if (filter) {
            filter.setAttribute('id', `invert-filter-${uniqueId}`);
            // Image element'lerindeki filter referansını güncelle
            const images = clonedSvg.querySelectorAll('image');
            images.forEach(img => {
              const filterAttr = img.getAttribute('filter');
              if (filterAttr && filterAttr.includes('invert-filter')) {
                img.setAttribute('filter', `url(#invert-filter-${uniqueId})`);
              }
            });
          }
          
          // Font-family'yi düzelt - CSS variable'ları 'Montserrat' ile değiştir ve @font-face ekle
          const styleElement = defs.querySelector('style');
          if (styleElement && styleElement.textContent) {
            let styleContent = styleElement.textContent;
            // var(--font-montserrat) yerine 'Montserrat' kullan
            styleContent = styleContent.replace(/var\(--font-montserrat\)/g, "'Montserrat'");
            styleContent = styleContent.replace(/var\(--font-montserrat\),/g, "'Montserrat',");
            // Eğer @font-face yoksa ekle
            if (!styleContent.includes('@font-face')) {
              const fontFace = `@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2) format('woff2');
}
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v26/JTUFjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2) format('woff2');
}
`;
              styleContent = `${fontFace}\n${styleContent}`;
            }
            styleElement.textContent = styleContent;
          }
        }
        
        // Text element'lerindeki font-family'yi de düzelt
        const textElements = clonedSvg.querySelectorAll('text');
        textElements.forEach(text => {
          const className = text.getAttribute('class');
          if (className === 'name-text' || className === 'subtitle-text') {
            // Font-family'yi doğrudan ayarla
            text.setAttribute('font-family', "'Montserrat', sans-serif");
            text.setAttribute('fontFamily', "'Montserrat', sans-serif");
            if (className === 'name-text') {
              text.setAttribute('font-style', 'italic');
              text.setAttribute('fontStyle', 'italic');
              text.setAttribute('font-weight', '700');
              text.setAttribute('fontWeight', '700');
              text.setAttribute('font-size', '14');
              text.setAttribute('fontSize', '14');
            } else if (className === 'subtitle-text') {
              text.setAttribute('font-weight', '300');
              text.setAttribute('fontWeight', '300');
              text.setAttribute('font-size', '10');
              text.setAttribute('fontSize', '10');
            }
            text.setAttribute('fill', '#fff');
          }
        });
        
        svgOutput = new XMLSerializer().serializeToString(clonedSvg);
      }
      
      return {
        ...card,
        svgOutput
      };
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal - Tam Ekran */}
      <div className="fixed inset-0 z-50 bg-white overflow-hidden">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10">
          <X size={20} className="text-gray-600" />
        </button>

        <div className="h-full flex flex-col">
          <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-4 lg:gap-6 p-4 md:p-6 lg:p-8 overflow-hidden min-h-0 h-full">
            {/* Left - SVG Card with 3D Flip Animation */}
            <div className="relative overflow-visible flex items-center justify-center bg-white min-h-0 perspective-1000">
              <div className="relative w-full h-full max-w-full md:max-w-[400px] aspect-[240.9/153.1] mx-auto card-flip-container group cursor-pointer">
                {/* Front - CardSVG */}
                <div className="card-front absolute inset-0 w-full h-full">
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
                {/* Back - arka.svg */}
                <div className="card-back absolute inset-0 w-full h-full">
                  <img 
                    src="/arka.svg" 
                    alt="Kart Arka Yüzü" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Hidden SVG elements for export - Her kart için */}
            <div className="hidden">
              {cards.map((card, index) => (
                <div key={index} data-card-index={index}>
                  <CardSVG 
                    name={card.name}
                    subtitle={card.subtitle}
                    logo={card.logo} 
                    logoSize={card.logoSize}
                    logoX={card.logoX}
                    logoY={card.logoY}
                    logoInverted={card.logoInverted}
                  />
                </div>
              ))}
            </div>

            {/* Right - Product Details */}
            <div className="flex flex-col h-full overflow-y-auto min-h-0 max-w-full">
              <div className="flex-shrink-0 space-y-2 md:space-y-2.5 lg:space-y-3">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight">{product.name}</h2>
                  <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.price}</p>
                </div>

                {/* Tabs */}
                {quantity > 1 && (
                  <div className="border-b border-gray-200">
                    <div 
                      className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                      style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db transparent',
                        msOverflowStyle: 'auto'
                      }}
                    >
                      {cards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTab(index)}
                          className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                            activeTab === index
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

                {/* Ad Soyad ve Alt Başlık - Yan Yana */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                  {/* Ad Soyad Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                      Ad Soyad {quantity > 1 && `(Kart ${activeTab + 1})`}
                    </label>
                    <input
                      type="text"
                      value={currentCard.name}
                      onChange={(e) => updateCard({ name: e.target.value })}
                      placeholder="Adınızı ve soyadınızı girin"
                      className="w-full px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  {/* Alt Başlık Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 sm:mb-1.5">
                      Alt Başlık {quantity > 1 && `(Kart ${activeTab + 1})`}
                    </label>
                    <input
                      type="text"
                      value={currentCard.subtitle || ''}
                      onChange={(e) => updateCard({ subtitle: e.target.value })}
                      placeholder="Örn: Altensis, Yönetici Ortağı"
                      className="w-full px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Logo Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateCard({ logo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 whitespace-nowrap"
                    >
                      {currentCard.logo ? 'Değiştir' : 'Yükle'}
                    </button>
                    {currentCard.logo && (
                      <>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={currentCard.logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <button
                          onClick={() => updateCard({ logo: null })}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:text-red-800 whitespace-nowrap"
                        >
                          Kaldır
                        </button>
                        <div className="relative" ref={logoDropdownRef}>
                          <button
                            onClick={() => setIsLogoModalOpen(!isLogoModalOpen)}
                            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-1 whitespace-nowrap"
                          >
                            <Settings size={12} className="flex-shrink-0" />
                            <span className="hidden sm:inline">Logo Ayarları</span>
                            <span className="sm:hidden">Ayarlar</span>
                          </button>
                        {isLogoModalOpen && (
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
                                  onChange={(e) => updateCard({ logoSize: Number(e.target.value) })}
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
                                  onChange={(e) => updateCard({ logoX: Number(e.target.value) })}
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
                                  onChange={(e) => updateCard({ logoY: Number(e.target.value) })}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                />
                              </div>

                              {/* Logoyu Beyaz Yap */}
                              <div>
                                <button
                                  onClick={() => updateCard({ logoInverted: !currentCard.logoInverted })}
                                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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

                <div className="border-t border-gray-200 pt-2 pb-1.5 sm:pb-2">
                  <p className="text-gray-600 text-xs sm:text-xs md:text-sm leading-relaxed">
                    {product.description || 'Profesyonel dijital kartvizit: NFC ve QR ile hızlı paylaşım, sınırsız güncelleme ve şık tasarım.'}
                  </p>
                </div>

                {/* Features - Compact */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-1.5 text-xs sm:text-xs md:text-sm">Özellikler</h3>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {product.features && product.features.length > 0 ? (
                      product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-sm">
                          <span className="text-black mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-sm">
                          <span className="text-black mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-600">NFC ve QR kod teknolojisi</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-sm">
                          <span className="text-black mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-600">Sınırsız paylaşım ve güncelleme</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs md:text-sm">
                          <span className="text-black mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-600">Özel tasarım ve baskı seçenekleri</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Stock Status */}
                <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg inline-block text-xs sm:text-xs md:text-sm ${product.inStock !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.inStock !== false ? '✓ Stokta Var' : '✗ Stokta Yok'}
                </div>
              </div>

              {/* Quantity and Buttons */}
              <div className="flex-shrink-0 space-y-2 sm:space-y-2.5 md:space-y-3 mt-auto pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">Adet:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-100 text-gray-900 font-semibold text-xs sm:text-sm">-</button>
                    <span className="px-3 sm:px-4 py-1 sm:py-1.5 border-x border-gray-300 text-gray-900 font-medium min-w-[40px] sm:min-w-[50px] text-center text-xs sm:text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-100 text-gray-900 font-semibold text-xs sm:text-sm">+</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="relative group">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (!allCardsFilled) return;
                        const cardsData = prepareCardsData();
                        onAddToCart(product, quantity, cardsData);
                        setIsAdded(true);
                        // Sepeti aç
                        if (onCartOpen) {
                          setTimeout(() => onCartOpen(), 300);
                        }
                        setTimeout(() => {
                          setIsAdded(false);
                          onClose();
                        }, 2000);
                      }}
                      disabled={product.inStock === false || isAdded || !allCardsFilled}
                      className={`w-full py-2 sm:py-2.5 md:py-3 font-semibold text-sm sm:text-base md:text-lg rounded-lg transition-all border-2 flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-[48px] md:min-h-[52px] box-border ${
                        isAdded
                          ? 'text-white shadow-lg'
                          : product.inStock !== false && allCardsFilled
                            ? 'bg-white text-black border-black hover:bg-gray-50' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                      }`}
                      style={isAdded ? { backgroundColor: '#325E5F', borderColor: '#325E5F' } : {}}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="text-sm sm:text-base md:text-lg font-bold">Eklendi!</span>
                        </>
                      ) : (
                        'Sepete Ekle'
                      )}
                    </button>
                    {!allCardsFilled && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                        Tüm kartlar için logo ve isim yükleyin
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (!allCardsFilled) return;
                        const cardsData = prepareCardsData();
                        onBuyNow(product, quantity, cardsData);
                      }}
                      disabled={product.inStock === false || !allCardsFilled}
                      className={`w-full py-2 sm:py-2.5 md:py-3 font-semibold text-sm sm:text-base md:text-lg rounded-lg transition-all border-2 flex items-center justify-center min-h-[44px] sm:min-h-[48px] md:min-h-[52px] box-border ${product.inStock !== false && allCardsFilled ? 'bg-black text-white border-black hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'}`}
                    >
                      Satın Al
                    </button>
                    {!allCardsFilled && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                        Tüm kartlar için logo ve isim yükleyin
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
