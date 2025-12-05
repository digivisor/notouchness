    'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CreditCard, Shield, ArrowLeft, Wallet } from 'lucide-react';
import B2BSidebar from '../components/B2BSidebar';

type Dealer = {
  id: string;
  name: string;
  email: string;
  username: string;
  logo_url?: string | null;
};

type B2BCartItem = {
  dealerCardId: string;
  salesCardId: string;
  name: string;
  price: number;
  currency: string;
  image_front?: string | null;
  quantity: number;
};

export default function B2BCheckoutPage() {
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [cart, setCart] = useState<B2BCartItem[]>([]);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'account'>('card');
  const [formData, setFormData] = useState({
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

  const [orderNumber] = useState(() => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `B2B-${dateStr}-${random}`;
  });

  // Load dealer & cart from localStorage
  useEffect(() => {
    const session = localStorage.getItem('b2b_session');
    if (!session) {
      router.push('/b2b/login');
      return;
    }
    try {
      const parsed = JSON.parse(session) as { dealer?: Dealer };
      if (parsed.dealer) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDealer(parsed.dealer);
        void loadAccountBalance(parsed.dealer.id);
      } else {
        router.push('/b2b/login');
      }
    } catch {
      router.push('/b2b/login');
    }

    const storedCart = localStorage.getItem('b2b_cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as B2BCartItem[];
        setCart(parsedCart.filter(item => item.quantity > 0));
      } catch {
        setCart([]);
      }
    }
  }, [router]);

  // If cart empty, redirect back
  useEffect(() => {
    if (cart.length === 0) return;
  }, [cart]);

  const loadAccountBalance = async (dealerId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('dealer_accounts')
        .select('balance')
        .eq('dealer_id', dealerId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Hesap yoksa 0 olarak ayarla
          setAccountBalance(0);
        } else {
          console.error('Hesap bakiyesi yüklenirken hata:', fetchError);
          setAccountBalance(0);
        }
      } else {
        setAccountBalance(data?.balance || 0);
      }
    } catch (err) {
      console.error('Hesap bakiyesi yüklenirken hata:', err);
      setAccountBalance(0);
    }
  };

  const updateCartQuantity = (dealerCardId: string, quantity: number) => {
    setCart(prev => {
      const updated = prev
        .map(item =>
          item.dealerCardId === dealerCardId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter(item => item.quantity > 0);
      localStorage.setItem('b2b_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (dealerCardId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.dealerCardId !== dealerCardId);
      localStorage.setItem('b2b_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Luhn
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
          setCardErrors(prev => ({
            ...prev,
            expiryDate: 'Geçersiz veya geçmiş tarih',
          }));
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
      cvv: '123',
    });
    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer || cart.length === 0) return;

    if (!deliveryAddress.trim()) {
      alert('Lütfen kart teslim adresini girin.');
      return;
    }

    // Cari hesap ödemesi kontrolü
    if (paymentMethod === 'account') {
      if (accountBalance === null) {
        alert('Hesap bakiyesi yükleniyor, lütfen bekleyin...');
        return;
      }
      if (accountBalance < totalAmount) {
        alert(`Yetersiz bakiye! Mevcut bakiye: ${accountBalance.toFixed(2)} TRY, Gerekli: ${totalAmount.toFixed(2)} TRY`);
        return;
      }
    } else {
      // Kart ödemesi validasyonları
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
    }

    setIsSubmitting(true);

    try {
      // Cari hesap ödemesi
      if (paymentMethod === 'account') {
        // Purchase'ları oluştur
        const purchaseIds: string[] = [];
        for (const item of cart) {
          const { data: purchase, error: purchaseError } = await supabase
            .from('dealer_purchases')
            .insert({
              dealer_id: dealer.id,
              sales_card_id: item.salesCardId,
              dealer_price: item.price,
              currency: item.currency,
              quantity: item.quantity,
              total_amount: item.price * item.quantity,
              status: 'completed',
              notes: `Order: ${orderNumber} | Address: ${deliveryAddress}`,
            })
            .select('id')
            .single();

          if (purchaseError) {
            throw purchaseError;
          }
          if (purchase) {
            purchaseIds.push(purchase.id);
          }
        }

        // Hesaptan düş (API route üzerinden)
        const payResponse = await fetch('/api/b2b/pay-from-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dealerId: dealer.id,
            amount: totalAmount,
            description: `Sipariş: ${orderNumber}`,
            referenceId: purchaseIds[0] || null,
          }),
        });

        const payData = await payResponse.json();

        if (!payResponse.ok) {
          throw new Error(payData.error || 'Hesaptan ödeme yapılamadı');
        }

        // Sepeti temizle
        localStorage.removeItem('b2b_cart');
        setCart([]);

        // Başarı sayfasına yönlendir
        router.push(`/b2b/dashboard?tab=my-cards&payment=success&order=${orderNumber}`);
        return;
      }

      // Kart ödemesi
      const [expMonth, expYear] = formData.expiryDate.split('/');
      const cardNumber = formData.cardNumber.replace(/\s/g, '');

      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          orderNumber,
          customerEmail: dealer.email,
          customerName: dealer.name,
          customerPhone: '',
          billingAddress: 'B2B Satın Alma',
          cardNumber,
          cardHolderName: formData.cardName,
          expireMonth: expMonth,
          expireYear: expYear,
          cvc: formData.cvv,
          installment: 1,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || paymentData.error) {
        alert(paymentData.error || 'Ödeme başlatılamadı');
        setIsSubmitting(false);
        return;
      }

      if (paymentData.threeDSHtmlContent) {
        // Pending purchases
        for (const item of cart) {
          await supabase.from('dealer_purchases').insert({
            dealer_id: dealer.id,
            sales_card_id: item.salesCardId,
            dealer_price: item.price,
            currency: item.currency,
            quantity: item.quantity,
            total_amount: item.price * item.quantity,
            status: 'pending',
            notes: `Order: ${orderNumber} | Address: ${deliveryAddress}`,
          });
        }

        let html = paymentData.threeDSHtmlContent || '';
        try {
          const looksBase64 =
            /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
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

  // 3DS auto-submit
  useEffect(() => {
    if (!threeDSContent) return;
    const t = setTimeout(() => {
      const container = document.getElementById('three-ds-container');
      if (!container) return;
      const form = container.querySelector('form');
      if (form) {
        try {
          form.submit();
        } catch {
          const submitBtn = form.querySelector(
            'input[type="submit"], button[type="submit"]'
          ) as HTMLElement;
          if (submitBtn) submitBtn.click();
        }
      }
    }, 300);
    return () => clearTimeout(t);
  }, [threeDSContent]);

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (threeDSContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div
          className="w-full max-w-xl"
          id="three-ds-container"
          dangerouslySetInnerHTML={{ __html: threeDSContent }}
        />
        <p className="mt-6 text-sm text-gray-500">
          3D Secure sayfasına yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }


  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <B2BSidebar dealer={dealer} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-[60]">
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => router.push('/b2b/dashboard')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-2"
            >
              <ArrowLeft size={20} />
              Geri
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Ödeme</h1>
            <p className="text-sm text-gray-600 mt-1">Sepetinizdeki kartları satın alın</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ödeme Bilgileri
                  </h2>
                </div>

                {/* Ödeme Yöntemi Seçimi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ödeme Yöntemi
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('account')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'account'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet size={24} className={paymentMethod === 'account' ? 'text-blue-600' : 'text-gray-600'} />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Cari Hesap</p>
                          <p className="text-xs text-gray-500">
                            {accountBalance !== null ? `Bakiye: ${accountBalance.toFixed(2)} TRY` : 'Yükleniyor...'}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={24} className={paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'} />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Kredi Kartı</p>
                          <p className="text-xs text-gray-500">3D Secure ile ödeme</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'account' && accountBalance !== null && accountBalance < totalAmount && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Yetersiz Bakiye
                    </p>
                    <p className="text-xs text-red-700">
                      Mevcut bakiye: {accountBalance.toFixed(2)} TRY, Gerekli: {totalAmount.toFixed(2)} TRY
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <Shield className="text-gray-600" size={20} />
                      <span className="text-sm text-gray-700">
                        Ödemeniz SSL ile güvenli şekilde işlenir
                      </span>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        iyzico Test Modu (Sandbox)
                      </p>
                      <p className="text-xs text-yellow-700">
                        Bu bir test ortamıdır. Gerçek ödeme yapılmaz. Test kartları
                        ile ödeme simüle edilir.
                      </p>
                    </div>
                  </>
                )}

                {paymentMethod === 'card' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={fillTestCard}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-300"
                      >
                        Test Kartı Doldur
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kart Numarası
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                            cardErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {cardErrors.cardNumber && (
                          <p className="text-sm text-red-600 mt-1">
                            {cardErrors.cardNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kart Üzerindeki İsim
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="AD SOYAD"
                          className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Son Kullanma Tarihi (SKT)
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                              cardErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          {cardErrors.expiryDate && (
                            <p className="text-sm text-red-600 mt-1">
                              {cardErrors.expiryDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength={3}
                            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                              cardErrors.cvv ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required
                          />
                          {cardErrors.cvv && (
                            <p className="text-sm text-red-600 mt-1">
                              {cardErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/b2b/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? 'Ödeme İşleniyor...'
                    : `Siparişi Tamamla (${totalAmount.toFixed(2)} TRY)`}
                </button>
              </div>
            </form>
          </div>

          {/* Right - Cart Summary + Teslim Adresi */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Sepetiniz
                </h2>

                {cart.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Sepetiniz boş. Kart satın almak için geri dönün.
                  </p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4">
                      {cart.map((item) => (
                        <div
                          key={item.dealerCardId}
                          className="border border-gray-200 rounded-lg p-3 flex gap-3"
                        >
                          {item.image_front && (
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image_front}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCartQuantity(
                                      item.dealerCardId,
                                      item.quantity - 1
                                    )
                                  }
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                  -
                                </button>
                                <span className="min-w-[1.5rem] text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateCartQuantity(
                                      item.dealerCardId,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.dealerCardId)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Kaldır
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-700">
                              {item.price.toFixed(2)} {item.currency} x{' '}
                              {item.quantity} ={' '}
                              <span className="font-semibold">
                                {(item.price * item.quantity).toFixed(2)}{' '}
                                {item.currency}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span className="font-medium text-gray-900">
                          {totalAmount.toFixed(2)} TRY
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kargo</span>
                        <span className="font-medium text-green-600">
                          Ücretsiz
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Toplam</span>
                        <span className="font-bold text-xl text-gray-900">
                          {totalAmount.toFixed(2)} TRY
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-semibold">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">
                    Kart Teslim Adresi
                  </h2>
                </div>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={4}
                  placeholder="Kartların teslim edileceği açık adresi yazınız"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}
