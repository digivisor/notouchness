'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../../lib/supabase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartModal from '../../components/CartModal';
import { ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart, isLoaded } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // localStorage'dan gelecek
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
    // Ödeme bilgileri
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
    return `ORD-${dateStr}-${random}`;
  });

  // localStorage'dan form verilerini yükle
  useEffect(() => {
    const savedFormData = localStorage.getItem('checkout_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Form data parse error:', e);
        router.push('/checkout');
      }
    } else {
      // Form verisi yoksa bilgiler sayfasına yönlendir
      router.push('/checkout');
    }
  }, [router]);

  // Sepet yüklenene kadar bekle, sonra boşsa mağazaya yönlendir
  useEffect(() => {
    if (isLoaded && cartItems.length === 0) {
      router.push('/store');
    }
  }, [cartItems, router, isLoaded]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    try {
      const totalPrice = getTotalPrice();
      const shippingCost = 0;
      const grandTotal = totalPrice + shippingCost;

      // Sipariş verisini hazırla
      const orderData = {
        order_number: orderNumber,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: `${formData.address}, ${formData.district}, ${formData.city} ${formData.postalCode}`,
        items: cartItems.map(item => {
          const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[₺,.]/g, ''))
            : item.price;
          
          return {
            id: item.id,
            name: item.name,
            price: price,
            quantity: item.quantity,
            image: item.image,
            total: price * item.quantity
          };
        }),
        subtotal: totalPrice,
        shipping_cost: shippingCost,
        tax: 0,
        total: grandTotal,
        payment_method: 'credit_card',
        payment_status: 'pending',
        order_status: 'pending',
        customer_note: formData.orderNote || null,
        admin_note: null,
      };

      // Supabase'e kaydet
      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (orderError) {
        console.error('Sipariş kaydedilemedi:', orderError);
        alert('Sipariş kaydedilirken bir hata oluştu!');
        setIsSubmitting(false);
        return;
      }

      // iyzico 3D Secure Payment oluştur
      const [expMonth, expYear] = formData.expiryDate.split('/');
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: grandTotal,
          orderNumber: orderNumber,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          billingAddress: `${formData.address}, ${formData.district}, ${formData.city} ${formData.postalCode}`,
          cardNumber: cardNumber,
          cardHolderName: formData.cardName,
          expireMonth: expMonth,
          expireYear: expYear,
          cvc: formData.cvv,
          installment: 1
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        if (!paymentData.testMode) {
          alert(paymentData.error || 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
          setIsSubmitting(false);
          return;
        }
      }

      // Test modunda başarılı
      if (paymentData.testMode) {
        // Payment status'u paid yap
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('order_number', orderNumber);

        // Email gönder
        try {
          await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              orderNumber: orderNumber,
              orderDate: new Date().toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              items: orderData.items,
              subtotal: orderData.subtotal,
              shippingCost: orderData.shipping_cost,
              total: orderData.total,
              shippingAddress: orderData.customer_address,
            }),
          });
        } catch (emailError) {
          console.error('Email gönderilemedi:', emailError);
        }

        // Sepeti 2 saniye sonra boşalt
        setTimeout(() => {
          clearCart();
        }, 2000);

        // Onay sayfasına yönlendir
        router.push(`/checkout/onay?order=${orderNumber}`);
        return;
      } else {
        // Production modunda 3D Secure HTML content'i varsa state'e kaydet
        if (paymentData.threeDSHtmlContent) {
          let html = paymentData.threeDSHtmlContent || '';
          
          // Base64 decode kontrolü
          try {
            const looksBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
            if (looksBase64 && typeof atob !== 'undefined') {
              const decoded = atob(html);
              if (decoded.includes('<form')) {
                html = decoded;
              }
            }
          } catch (e) {
            console.warn('[3DS] Decode başarısız, raw içerik kullanılacak');
          }
          
          setThreeDSContent(html);
          // Clear sensitive fields
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
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      alert('Bir hata oluştu, lütfen tekrar deneyin.');
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
        } catch (e) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-20">
        {/* Back Button */}
        <Link 
          href="/checkout"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Geri
        </Link>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${
                  s <= 2 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {s < 2 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    s < 2 ? 'bg-gray-900' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className="text-sm text-gray-900 font-medium">Bilgiler</span>
            <span className="text-sm text-gray-900 font-medium">Ödeme</span>
            <span className="text-sm text-gray-400">Onay</span>
          </div>
        </div>

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
                        Bu bir test ortamıdır. Gerçek ödeme yapılmaz. Test kartları ile ödeme simüle edilir ve Supabase&apos;e kaydedilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Kartı Doldur Butonu */}
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="w-full mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-300"
                >
                  Test Kartı Doldur
                </button>

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
                <Link
                  href="/checkout"
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
                >
                  Geri
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sipariş Oluşturuluyor...
                    </span>
                  ) : (
                    'Siparişi Onayla'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => {
                  const numericPrice = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[₺,.]/g, ''))
                    : item.price;
                  const displayPrice = typeof item.price === 'string' ? item.price : `₺${item.price}`;
                  const itemTotal = numericPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900">
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
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

