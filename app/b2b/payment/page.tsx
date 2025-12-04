'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CreditCard, Shield, ArrowLeft, X } from 'lucide-react';

type Dealer = {
  id: string;
  name: string;
  email: string;
  username: string;
  logo_url?: string | null;
};

type SalesCard = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  image_front: string;
  image_back?: string | null;
  description?: string | null;
};

type DealerCard = {
  id: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  is_active: boolean;
  sales_card: SalesCard;
};

export default function B2BPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const salesCardId = searchParams.get('cardId');
  
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [dealerCard, setDealerCard] = useState<DealerCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [orderNumber] = useState(() => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `B2B-${dateStr}-${random}`;
  });

  useEffect(() => {
    const session = localStorage.getItem('b2b_session');
    if (!session) {
      router.push('/b2b/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      if (parsed.dealer) {
        setDealer(parsed.dealer);
        if (salesCardId) {
          void loadDealerCard(parsed.dealer.id, salesCardId);
        } else {
          setError('Kart ID bulunamadı');
          setLoading(false);
        }
      } else {
        router.push('/b2b/login');
      }
    } catch (e) {
      router.push('/b2b/login');
    }
  }, [router, salesCardId]);

  const loadDealerCard = async (dealerId: string, cardId: string) => {
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
        .eq('sales_card_id', cardId)
        .eq('is_active', true)
        .single();

      if (fetchError || !data) {
        throw new Error('Kart bulunamadı');
      }

      setDealerCard({
        ...data,
        sales_card: data.sales_card,
      } as DealerCard);
    } catch (err: any) {
      setError(err.message || 'Kart yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Luhn algoritması ile kart numarası kontrolü
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

  // SKT kontrolü
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
    
    // Kart numarası formatla
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
    
    // SKT formatla
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
    
    // CVV formatla
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

  // Test kartı doldur
  const fillTestCard = () => {
    setFormData(prev => ({
      ...prev,
      cardNumber: '5528 7900 0000 0008',
      cardName: 'TEST KARTI',
      expiryDate: '12/25',
      cvv: '123'
    }));
    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  // Başarısız test kartı doldur
  const fillFailedTestCard = () => {
    setFormData(prev => ({
      ...prev,
      cardNumber: '4125 1111 1111 1115',
      cardName: 'TEST KARTI',
      expiryDate: '12/25',
      cvv: '123'
    }));
    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dealer || !dealerCard) {
      setError('Dealer veya kart bilgisi bulunamadı');
      return;
    }
    
    // Validasyonlar
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

    setIsSubmitting(true);
    setError(null);

    try {
      const totalAmount = dealerCard.dealer_price;
      
      // Önce iyzico 3D Secure Payment oluştur
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
          customerPhone: '', // B2B için telefon opsiyonel
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
        const errorParams = new URLSearchParams({
          reason: paymentData.reason || 'general_error',
          ...(paymentData.errorCode && { errorCode: paymentData.errorCode }),
          ...(paymentData.error && { errorMessage: encodeURIComponent(paymentData.error) })
        });
        router.push(`/b2b/payment/error?${errorParams.toString()}`);
        setIsSubmitting(false);
        return;
      }

      // 3D Secure HTML content geldiyse (ödeme intent başarılı)
      if (paymentData.threeDSHtmlContent) {
        // Satın alma kaydını hazırla (pending olarak)
        const purchaseData = {
          dealer_id: dealer.id,
          sales_card_id: dealerCard.sales_card_id,
          dealer_price: dealerCard.dealer_price,
          currency: dealerCard.currency,
          quantity: 1,
          total_amount: totalAmount,
          status: 'pending', // Ödeme tamamlanınca completed olacak
          notes: `Order: ${orderNumber}`,
        };

        // Supabase'e kaydet
        const { error: purchaseError } = await supabase
          .from('dealer_purchases')
          .insert([purchaseData]);

        if (purchaseError) {
          console.error('Purchase kaydedilemedi:', purchaseError);
          setError('Satın alma kaydı oluşturulamadı');
          setIsSubmitting(false);
          return;
        }

        // 3DS HTML content'i decode et ve state'e yaz
        let html = paymentData.threeDSHtmlContent || '';
        try {
          const looksBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
          if (looksBase64 && typeof atob !== 'undefined') {
            const decoded = atob(html);
            if (decoded.includes('<form')) html = decoded;
          }
        } catch {
          console.warn('[3DS] Decode başarısız, raw içerik kullanılacak');
        }
        setThreeDSContent(html);
        setFormData(prev => ({
          ...prev,
          cardNumber: '',
          cardName: '',
          expiryDate: '',
          cvv: ''
        }));
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
      setIsSubmitting(false);
    }
  };

  // 3D Secure form auto-submit
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
          const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLElement;
          if (submitBtn) {
            submitBtn.click();
          }
        }
      }
    }, 300);
    
    return () => clearTimeout(t);
  }, [threeDSContent]);

  // 3D Secure HTML content varsa sadece onu göster
  if (threeDSContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-xl" id="three-ds-container" dangerouslySetInnerHTML={{ __html: threeDSContent }} />
        <p className="mt-6 text-sm text-gray-500">3D Secure sayfasına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  if (loading || !dealer || !dealerCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push('/b2b/dashboard')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">Ödeme Bilgileri</h2>
                </div>
                
                {/* Güvenlik Badge */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <Shield className="text-gray-600" size={20} />
                  <span className="text-sm text-gray-700">Ödemeniz SSL ile güvenli şekilde işlenir</span>
                </div>

                {/* iyzico Test Modu Bilgisi */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">iyzico Test Modu (Sandbox)</p>
                      <p className="text-xs text-gray-600">
                        Bu bir test ortamıdır. Gerçek ödeme yapılmaz. Test kartları ile ödeme simüle edilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Kartı Doldur Butonları */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={fillTestCard}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-300"
                  >
                    Test Kartı Doldur
                  </button>
                  <button
                    type="button"
                    onClick={fillFailedTestCard}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition border border-red-300"
                  >
                    Başarısız Test Kartı Doldur
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
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
                      <p className="text-sm text-red-600 mt-1">{cardErrors.cardNumber}</p>
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
                      className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma Tarihi (SKT)</label>
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
                        <p className="text-sm text-red-600 mt-1">{cardErrors.expiryDate}</p>
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
                        className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
                          cardErrors.cvv ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {cardErrors.cvv && (
                        <p className="text-sm text-red-600 mt-1">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* iyzico ile Öde */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <Image 
                      src="/iyzico_ile_ode_colored_horizontal.png" 
                      alt="iyzico ile Öde" 
                      width={200} 
                      height={60}
                      className="h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/b2b/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ödeme İşleniyor...
                    </span>
                  ) : (
                    'Ödemeyi Tamamla'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Özeti</h2>
              
              {dealerCard.sales_card.image_front && (
                <div className="mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dealerCard.sales_card.image_front}
                    alt={dealerCard.sales_card.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{dealerCard.sales_card.name}</h3>
                  {dealerCard.sales_card.description && (
                    <p className="text-sm text-gray-600 mb-2">{dealerCard.sales_card.description}</p>
                  )}
                  {dealerCard.sales_card.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {dealerCard.sales_card.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Birim Fiyat</span>
                  <span className="font-medium text-gray-900">
                    {dealerCard.dealer_price} {dealerCard.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Miktar</span>
                  <span className="font-medium text-gray-900">1</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-xl text-gray-900">
                    {dealerCard.dealer_price} {dealerCard.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

