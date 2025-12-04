'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Package, DollarSign, Store, CreditCard, ShoppingCart, X, Plus, Minus, Shield } from 'lucide-react';
import Image from 'next/image';

type Dealer = {
  id: string;
  name: string;
  email: string;
  username: string;
  logo_url?: string | null;
};

type DealerCard = {
  id: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  is_active: boolean;
  sales_card: {
    id: string;
    name: string;
    price: number;
    currency: string;
    category: string;
    image_front: string;
    image_back?: string | null;
    description?: string | null;
  };
};

type DealerPurchase = {
  id: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
  status: string;
  notes?: string | null;
  sales_card: {
    id: string;
    name: string;
    price: number;
    currency: string;
    category: string;
    image_front: string;
    image_back?: string | null;
    description?: string | null;
  };
};

type CartItem = {
  dealerCard: DealerCard;
  quantity: number;
};

export default function B2BDashboardPage() {
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [dealerCards, setDealerCards] = useState<DealerCard[]>([]);
  const [purchasedCards, setPurchasedCards] = useState<DealerPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'my-cards'>('buy');
  const [selectedPurchase, setSelectedPurchase] = useState<DealerPurchase | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('b2b_session');
    if (!session) {
      router.push('/b2b/login');
      return;
    }

    try {
      const parsed = JSON.parse(session) as { dealer?: Dealer };
      if (parsed.dealer) {
        setDealer(parsed.dealer);
        void loadDealerCards(parsed.dealer.id);
        void loadPurchasedCards(parsed.dealer.id);
      } else {
        router.push('/b2b/login');
      }
    } catch (e) {
      router.push('/b2b/login');
    }

    // URL'den tab ve payment parametrelerini kontrol et
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const paymentParam = urlParams.get('payment');
      const orderParam = urlParams.get('order');
      if (tabParam === 'my-cards') {
        setActiveTab('my-cards');
      }
      if (paymentParam === 'success') {
        setActiveTab('my-cards');
        setSuccess('Ödeme başarılı! Kartlarınız Kartlarım sayfasında tanımlandı.');
        if (orderParam) {
          setLastOrderNumber(orderParam);
          setShowOrderSuccessModal(true);
        }
        // URL'yi temizle
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, [router]);

  // Sepeti localStorage'a yaz (checkout sayfasında kullanılacak)
  useEffect(() => {
    if (cart.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('b2b_cart');
      }
      return;
    }
    try {
      const payload = cart.map((item) => ({
        dealerCardId: item.dealerCard.id,
        salesCardId: item.dealerCard.sales_card_id,
        name: item.dealerCard.sales_card.name,
        price: item.dealerCard.dealer_price,
        currency: item.dealerCard.currency,
        image_front: item.dealerCard.sales_card.image_front,
        quantity: item.quantity,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('b2b_cart', JSON.stringify(payload));
      }
    } catch {
      // ignore
    }
  }, [cart]);

  const loadDealerCards = async (dealerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('dealer_cards')
        .select(`
          *,
          sales_card:sales_cards(*)
        `)
        .eq('dealer_id', dealerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const cards = (data ?? []) as DealerCard[];
      setDealerCards(cards);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kartlar yüklenirken hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchasedCards = async (dealerId: string) => {
    setLoadingPurchases(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('dealer_purchases')
        .select(`
          *,
          sales_card:sales_cards(*)
        `)
        .eq('dealer_id', dealerId)
        .eq('status', 'completed')
        .order('purchase_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const purchases = (data ?? []) as DealerPurchase[];
      setPurchasedCards(purchases);
    } catch (err) {
      console.error('Purchases fetch error:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const addToCart = (dealerCard: DealerCard) => {
    setCart(prev => {
      const existing = prev.find(item => item.dealerCard.id === dealerCard.id);
      if (existing) {
        return prev.map(item =>
          item.dealerCard.id === dealerCard.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dealerCard, quantity: 1 }];
    });
  };

  const removeFromCart = (dealerCardId: string) => {
    setCart(prev => prev.filter(item => item.dealerCard.id !== dealerCardId));
  };

  const updateCartQuantity = (dealerCardId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dealerCardId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.dealerCard.id === dealerCardId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.dealerCard.dealer_price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePurchase = () => {
    if (cart.length === 0) return;
    router.push('/b2b/checkout');
  };

  const handleLogout = () => {
    localStorage.removeItem('b2b_session');
    router.push('/b2b/login');
  };

  const totalValue = useMemo(
    () => dealerCards.reduce((sum, card) => sum + card.dealer_price, 0),
    [dealerCards]
  );

  const averagePrice = useMemo(
    () =>
      dealerCards.length > 0
        ? Math.round(
            dealerCards.reduce((sum, card) => sum + card.dealer_price, 0) /
              dealerCards.length
          )
        : 0,
    [dealerCards]
  );

  const lastOrderPurchases = useMemo(
    () =>
      lastOrderNumber
        ? purchasedCards.filter(
            (p) => p.notes && p.notes.includes(lastOrderNumber)
          )
        : [],
    [lastOrderNumber, purchasedCards]
  );

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
        
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex flex-col items-center">
          <div className="w-32 h-12 mb-3 flex items-center justify-center">
   
            {dealer.logo_url ? (
              <img
                src={dealer.logo_url}
                alt={dealer.name}
                className="object-contain w-full h-full"
              />
            ) : (
              <img
                src="/notouchness1.png"
                alt="Logo"
                className="object-contain w-full h-full"
              />
            )}
          </div>
          <p className="text-sm text-gray-300 font-medium text-center">
            {dealer.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">B2B Bayi Paneli</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <ShoppingCart size={18} />
                <span>Kart Satın Al</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('my-cards')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'my-cards'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <CreditCard size={18} />
                <span>Kartlarım</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'buy' ? 'Kart Satın Al' : 'Kartlarım'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'buy'
                  ? 'Size tanımlanan kartları ve bayi fiyatlarını görüntüleyin.'
                  : 'Satın aldığınız kartları burada göreceksiniz.'}
              </p>
            </div>
            {activeTab === 'buy' && cart.length > 0 && (
              <button
                type="button"
                onClick={handlePurchase}
                className="relative px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
              >
                <ShoppingCart size={20} />
                <span>Sepet ({getCartCount()})</span>
                <span className="ml-2 px-2 py-1 bg-blue-700 rounded text-sm">
                  {getCartTotal().toFixed(2)} TRY
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Kart</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dealerCards.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ortalama Fiyat</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {averagePrice} TRY
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Değer</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalValue} TRY
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Tabs content */}
          {activeTab === 'buy' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Kart Satın Al
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Size tanımlanan kartları görüntüleyin ve satış fiyatlarını kullanın.
                </p>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
                  <p className="mt-4">Yükleniyor...</p>
                </div>
              ) : dealerCards.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Henüz size özel kart eklenmemiş</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dealerCards.map((dealerCard) => (
                      <div
                        key={dealerCard.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
                      >
                        {dealerCard.sales_card.image_front && (
                          <div className="relative w-full h-48 bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={dealerCard.sales_card.image_front}
                              alt={dealerCard.sales_card.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {dealerCard.sales_card.name}
                          </h3>
                          {dealerCard.sales_card.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {dealerCard.sales_card.description}
                            </p>
                          )}
                          <div className="mt-auto">
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-500">Normal Fiyat</p>
                                <p className="text-sm text-gray-600 line-through">
                                  {dealerCard.sales_card.price}{' '}
                                  {dealerCard.sales_card.currency}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Bayi Fiyatı</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {dealerCard.dealer_price} {dealerCard.currency}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              {dealerCard.sales_card.category && (
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {dealerCard.sales_card.category}
                                </span>
                              )}
                              {cart.find(item => item.dealerCard.id === dealerCard.id) ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(dealerCard.id, (cart.find(item => item.dealerCard.id === dealerCard.id)?.quantity || 0) - 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                                    {cart.find(item => item.dealerCard.id === dealerCard.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addToCart(dealerCard)}
                                    className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToCart(dealerCard)}
                                  className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Sepete Ekle
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'my-cards' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} />
                  Kartlarım
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Satın aldığınız kartlar ve detayları
                </p>
              </div>

              <div className="p-6">
                {loadingPurchases ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
                    <p className="mt-4">Yükleniyor...</p>
                  </div>
                ) : purchasedCards.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Henüz satın aldığınız kart yok</p>
                    <p className="text-sm mt-2">&quot;Kart Satın Al&quot; sekmesinden kart satın alabilirsiniz</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedCards.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        <div className="flex">
                          {purchase.sales_card.image_front && (
                            <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={purchase.sales_card.image_front}
                                alt={purchase.sales_card.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                  {purchase.sales_card.name}
                                </h3>
                                {purchase.sales_card.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {purchase.sales_card.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-6 text-sm">
                                  <div>
                                    <span className="text-gray-500">Miktar: </span>
                                    <span className="font-medium">{purchase.quantity}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Birim Fiyat: </span>
                                    <span className="font-medium">
                                      {purchase.dealer_price} {purchase.currency}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Toplam: </span>
                                    <span className="font-bold text-blue-600">
                                      {purchase.total_amount} {purchase.currency}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Tarih: </span>
                                    <span className="font-medium">
                                      {new Date(purchase.purchase_date).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {purchase.sales_card.category && (
                                <span className="ml-4 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded h-fit">
                                  {purchase.sales_card.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Purchase Detail Modal */}
          {selectedPurchase && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedPurchase(null)}
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Kart Detayları</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedPurchase(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6">
                  {selectedPurchase.sales_card.image_front && (
                    <div className="mb-6">
                      <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPurchase.sales_card.image_front}
                          alt={selectedPurchase.sales_card.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedPurchase.sales_card.name}
                      </h3>
                      {selectedPurchase.sales_card.description && (
                        <p className="text-gray-600">{selectedPurchase.sales_card.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Miktar</p>
                        <p className="font-semibold">{selectedPurchase.quantity} adet</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Birim Fiyat</p>
                        <p className="font-semibold">
                          {selectedPurchase.dealer_price} {selectedPurchase.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Toplam Tutar</p>
                        <p className="font-bold text-blue-600 text-lg">
                          {selectedPurchase.total_amount} {selectedPurchase.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Satın Alma Tarihi</p>
                        <p className="font-semibold">
                          {new Date(selectedPurchase.purchase_date).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Durum</p>
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                          {selectedPurchase.status === 'completed' ? 'Tamamlandı' : selectedPurchase.status}
                        </span>
                      </div>
                      {selectedPurchase.sales_card.category && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Kategori</p>
                          <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {selectedPurchase.sales_card.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Son sipariş başarılı modalı */}
          {showOrderSuccessModal && lastOrderNumber && lastOrderPurchases.length > 0 && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
              onClick={() => setShowOrderSuccessModal(false)}
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Satın Alma Başarılı
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      {lastOrderNumber} numaralı siparişte eklenen kartlar aşağıdadır.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOrderSuccessModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  {lastOrderPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                    >
                      {purchase.sales_card.image_front && (
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={purchase.sales_card.image_front}
                            alt={purchase.sales_card.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {purchase.sales_card.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {purchase.quantity} adet •{' '}
                          {purchase.total_amount} {purchase.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          cart={cart}
          dealer={dealer}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setThreeDSContent(null);
            setPaymentFormData({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
            setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
          }}
          onSuccess={() => {
            setCart([]);
            setIsPaymentModalOpen(false);
            setActiveTab('my-cards');
            setSuccess('Ödeme başarılı! Kartlarınız Kartlarım sayfasında tanımlandı.');
            setTimeout(() => setSuccess(null), 5000);
            void loadPurchasedCards(dealer!.id);
          }}
          threeDSContent={threeDSContent}
          setThreeDSContent={setThreeDSContent}
          formData={paymentFormData}
          setFormData={setPaymentFormData}
          cardErrors={cardErrors}
          setCardErrors={setCardErrors}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      )}
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  cart,
  dealer,
  onClose,
  onSuccess,
  threeDSContent,
  setThreeDSContent,
  formData,
  setFormData,
  cardErrors,
  setCardErrors,
  isSubmitting,
  setIsSubmitting,
}: {
  cart: CartItem[];
  dealer: Dealer | null;
  onClose: () => void;
  onSuccess: () => void;
  threeDSContent: string | null;
  setThreeDSContent: (content: string | null) => void;
  formData: { cardNumber: string; cardName: string; expiryDate: string; cvv: string };
  setFormData: React.Dispatch<React.SetStateAction<{ cardNumber: string; cardName: string; expiryDate: string; cvv: string }>>;
  cardErrors: { cardNumber: string; expiryDate: string; cvv: string };
  setCardErrors: React.Dispatch<React.SetStateAction<{ cardNumber: string; expiryDate: string; cvv: string }>>;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}) {
  const [orderNumber] = useState(() => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `B2B-${dateStr}-${random}`;
  });

  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateExpiryDate = (expiryDate: string): boolean => {
    if (!expiryDate || expiryDate.length !== 5) return false;
    const [month, year] = expiryDate.split('/');
    const expMonth = parseInt(month);
    const expYear = parseInt('20' + year);
    if (expMonth < 1 || expMonth > 12) return false;
    const now = new Date();
    const expDate = new Date(expYear, expMonth - 1);
    const currentDate = new Date(now.getFullYear(), now.getMonth());
    return expDate >= currentDate;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      formattedValue = formatted.substring(0, 19);
      if (formattedValue.replace(/\s/g, '').length >= 13) {
        if (!validateCardNumber(formattedValue)) {
          setCardErrors(prev => ({ ...prev, cardNumber: 'Geçersiz kart numarası' }));
        } else {
          setCardErrors(prev => ({ ...prev, cardNumber: '' }));
        }
      } else {
        setCardErrors(prev => ({ ...prev, cardNumber: '' }));
      }
    }

    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }
      formattedValue = formatted.substring(0, 5);
      if (formattedValue.length === 5) {
        if (!validateExpiryDate(formattedValue)) {
          setCardErrors(prev => ({ ...prev, expiryDate: 'Geçersiz veya geçmiş tarih' }));
        } else {
          setCardErrors(prev => ({ ...prev, expiryDate: '' }));
        }
      } else {
        setCardErrors(prev => ({ ...prev, expiryDate: '' }));
      }
    }

    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
      if (formattedValue.length === 3) {
        setCardErrors(prev => ({ ...prev, cvv: '' }));
      } else if (formattedValue.length > 0) {
        setCardErrors(prev => ({ ...prev, cvv: 'CVV 3 haneli olmalıdır' }));
      } else {
        setCardErrors(prev => ({ ...prev, cvv: '' }));
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const fillTestCard = () => {
    setFormData({
      cardNumber: '5528 7900 0000 0008',
      cardName: 'TEST KARTI',
      expiryDate: '12/25',
      cvv: '123'
    });
    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCardNumber(formData.cardNumber)) {
      alert('Geçersiz kart numarası!');
      return;
    }

    if (!validateExpiryDate(formData.expiryDate)) {
      alert('Geçersiz veya geçmiş son kullanma tarihi!');
      return;
    }

    if (formData.cvv.length !== 3) {
      alert('CVV 3 haneli olmalıdır!');
      return;
    }

    if (!dealer) return;

    setIsSubmitting(true);

    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.dealerCard.dealer_price * item.quantity, 0);
      const [expMonth, expYear] = formData.expiryDate.split('/');
      const cardNumber = formData.cardNumber.replace(/\s/g, '');

      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          orderNumber: orderNumber,
          customerEmail: dealer.email,
          customerName: dealer.name,
          customerPhone: '',
          billingAddress: 'B2B Satın Alma',
          cardNumber: cardNumber,
          cardHolderName: formData.cardName,
          expireMonth: expMonth,
          expireYear: expYear,
          cvc: formData.cvv,
          installment: 1
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || paymentData.error) {
        alert(paymentData.error || 'Ödeme başlatılamadı');
        setIsSubmitting(false);
        return;
      }

      if (paymentData.threeDSHtmlContent) {
        // Sepetteki tüm kartları pending olarak kaydet
        const { supabase } = await import('@/lib/supabase');
        for (const item of cart) {
          await supabase.from('dealer_purchases').insert({
            dealer_id: dealer.id,
            sales_card_id: item.dealerCard.sales_card_id,
            dealer_price: item.dealerCard.dealer_price,
            currency: item.dealerCard.currency,
            quantity: item.quantity,
            total_amount: item.dealerCard.dealer_price * item.quantity,
            status: 'pending',
            notes: `Order: ${orderNumber}`,
          });
        }

        let html = paymentData.threeDSHtmlContent || '';
        try {
          const looksBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
          if (looksBase64 && typeof atob !== 'undefined') {
            const decoded = atob(html);
            if (decoded.includes('<form')) html = decoded;
          }
        } catch {
          console.warn('[3DS] Decode başarısız');
        }
        setThreeDSContent(html);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  // 3D Secure form auto-submit
  useEffect(() => {
    if (!threeDSContent) return;
    const t = setTimeout(() => {
      const container = document.getElementById('three-ds-container-modal');
      if (!container) return;
      const form = container.querySelector('form');
      if (form) {
        try {
          form.submit();
        } catch {
          const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLElement;
          if (submitBtn) submitBtn.click();
        }
      }
    }, 300);
    return () => clearTimeout(t);
  }, [threeDSContent]);

  // Payment callback listener - URL'den kontrol et
  useEffect(() => {
    const checkPaymentSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        onSuccess();
        // URL'yi temizle
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    checkPaymentSuccess();
    const interval = setInterval(checkPaymentSuccess, 1000);
    return () => clearInterval(interval);
  }, [onSuccess]);

  if (threeDSContent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">3D Secure Doğrulama</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <div id="three-ds-container-modal" dangerouslySetInnerHTML={{ __html: threeDSContent }} />
            <p className="mt-4 text-sm text-gray-500 text-center">
              3D Secure sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.dealerCard.dealer_price * item.quantity, 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Ödeme</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-gray-900" />
                    <h3 className="text-xl font-bold text-gray-900">Ödeme Bilgileri</h3>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 mb-4">
                    <Shield className="text-gray-600" size={18} />
                    <span className="text-xs text-gray-700">Ödemeniz SSL ile güvenli şekilde işlenir</span>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">iyzico Test Modu (Sandbox)</p>
                    <p className="text-xs text-yellow-700">
                      Bu bir test ortamıdır. Gerçek ödeme yapılmaz.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
                    >
                      Test Kartı Doldur
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                          cardErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {cardErrors.cardNumber && (
                        <p className="text-xs text-red-600 mt-1">{cardErrors.cardNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kart Üzerindeki İsim</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="AD SOYAD"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma Tarihi</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                            cardErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {cardErrors.expiryDate && (
                          <p className="text-xs text-red-600 mt-1">{cardErrors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                            cardErrors.cvv ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {cardErrors.cvv && (
                          <p className="text-xs text-red-600 mt-1">{cardErrors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center">
                      <Image 
                        src="/iyzico_ile_ode_colored_horizontal.png" 
                        alt="iyzico ile Öde" 
                        width={150} 
                        height={45}
                        className="h-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Ödeme İşleniyor...' : `Ödemeyi Tamamla (${totalAmount.toFixed(2)} TRY)`}
                  </button>
                </div>
              </form>
            </div>

            {/* Right - Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.dealerCard.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      {item.dealerCard.sales_card.image_front && (
                        <div className="w-full h-24 bg-gray-100 rounded mb-2 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.dealerCard.sales_card.image_front}
                            alt={item.dealerCard.sales_card.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        {item.dealerCard.sales_card.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Adet: {item.quantity}</span>
                        <span className="font-semibold">
                          {item.dealerCard.dealer_price} {item.dealerCard.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Toplam</span>
                    <span>{totalAmount.toFixed(2)} TRY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  