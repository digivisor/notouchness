'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { supabase } from '../../lib/supabase';
import Toast from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: Bilgiler, 2: Ödeme, 3: Onay
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [orderPrices, setOrderPrices] = useState<{ subtotal: number; total: number } | null>(null);
  const [orderItems, setOrderItems] = useState<typeof cartItems>([]);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
  
  // Validation states
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

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

  // SKT (Son Kullanma Tarihi) kontrolü
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

  // Order number'ı useState ile oluştur (sadece bir kez)
  const [orderNumber] = useState(() => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${dateStr}-${random}`;
  });

  // Form states
  const [formData, setFormData] = useState({
    // Kişisel Bilgiler
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Teslimat Adresi
    address: '',
    city: '',
    district: '',
    postalCode: '',
    
    // Fatura
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    
    // Ödeme
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Diğer
    orderNote: '',
    sameAsBilling: true,
    saveInfo: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let formattedValue = value;
    
    // Kart numarası formatla (4'er haneli gruplar)
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      formattedValue = formatted.substring(0, 19);
      
      // Real-time validation
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
    
    // SKT formatla (MM/YY)
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }
      formattedValue = formatted.substring(0, 5);
      
      // Real-time validation
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
    
    // CVV formatla (sadece rakam, max 3)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
      
      // Real-time validation
      if (formattedValue.length === 3) {
        setCardErrors(prev => ({ ...prev, cvv: '' }));
      } else if (formattedValue.length > 0) {
        setCardErrors(prev => ({ ...prev, cvv: 'CVV 3 haneli olmalıdır' }));
      } else {
        setCardErrors(prev => ({ ...prev, cvv: '' }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
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
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Step 2 validasyonları
    if (step === 2) {
      // Kart numarası kontrolü
      if (!validateCardNumber(formData.cardNumber)) {
        setToast({ message: 'Geçersiz kart numarası!', type: 'error' });
        return;
      }
      
      // SKT kontrolü
      if (!validateExpiryDate(formData.expiryDate)) {
        setToast({ message: 'Geçersiz veya geçmiş son kullanma tarihi!', type: 'error' });
        return;
      }
      
      // CVV kontrolü
      if (formData.cvv.length !== 3) {
        setToast({ message: 'CVV 3 haneli olmalıdır!', type: 'error' });
        return;
      }
    }

    // Step 2'den sonra: iyzico Payment oluştur
    setIsSubmitting(true);

    try {
      // Fiyatları kaydet (clearCart'tan önce)
      const prices = {
        subtotal: totalPrice,
        total: grandTotal
      };
      setOrderPrices(prices);

      // Sipariş verisini hazırla (3D Secure'dan önce kaydet)
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
        payment_status: 'pending', // 3D Secure tamamlanana kadar pending
        order_status: 'pending',
        customer_note: formData.orderNote || null,
        admin_note: null,
      };

      // Supabase'e kaydet (3D Secure'dan önce)
      const { data: savedOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Sipariş kaydedilemedi:', orderError);
        setToast({ message: 'Sipariş kaydedilirken bir hata oluştu!', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      // iyzico 3D Secure Payment oluştur
      try {
        // Kart bilgilerini parse et
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
            // 3D Secure için kart bilgileri
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
          // Production modunda API hatası varsa sipariş kaydını durdur
          if (!paymentData.testMode) {
            setToast({ 
              message: paymentData.error || 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.', 
              type: 'error' 
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Test modunda başarılı - direkt sipariş kaydına geç ve email gönder
        if (paymentData.testMode) {
          console.log('iyzico Test Modu - Payment simüle edildi:', paymentData);
          
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

          // Başarılı
          setToast({ message: 'Siparişiniz başarıyla alındı!', type: 'success' });
          setIsSubmitting(false);
          
          // Step 3'e geç
          setStep(3);
          setOrderPrices({
            subtotal: totalPrice,
            total: grandTotal
          });
          // Ürünleri kaydet
          setOrderItems([...cartItems]);
          
          // Sepeti 2 saniye sonra boşalt
          setTimeout(() => {
            clearCart();
          }, 2000);
          return;
        } else {
          // Production modunda 3D Secure HTML content'i varsa state'e kaydet
          if (paymentData.threeDSHtmlContent) {
            console.log('iyzico 3D Secure başlatıldı');
            let html = paymentData.threeDSHtmlContent || '';
            
            // Base64 decode kontrolü
            try {
              const looksBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
              if (looksBase64 && typeof atob !== 'undefined') {
                const decoded = atob(html);
                if (decoded.includes('<form')) {
                  html = decoded;
                  console.log('[3DS] Base64 decode başarılı');
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
      } catch (paymentError: any) {
        console.error('Payment oluşturulamadı:', paymentError);
        setToast({ 
          message: 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.', 
          type: 'error' 
        });
        setIsSubmitting(false);
        return;
      }

    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setToast({ message: 'Bir hata oluştu, lütfen tekrar deneyin.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  const shippingCost = 0; // Ücretsiz kargo
  const totalPrice = getTotalPrice();
  const grandTotal = totalPrice + shippingCost;

  // Ödeme başarılı olduğunda siparişi kontrol et ve step 3'e geç
  const handlePaymentSuccess = async (orderNumberFromUrl: string) => {
    try {
      // Siparişi kontrol et
      const { data: existingOrder, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumberFromUrl)
        .single();

      if (orderError || !existingOrder) {
        console.error('Sipariş bulunamadı:', orderError);
        setToast({ 
          message: 'Sipariş bulunamadı. Lütfen destek ekibiyle iletişime geçin.', 
          type: 'error' 
        });
        setStep(2);
        return;
      }

      // Payment status'u paid yap
      await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('order_number', orderNumberFromUrl);

      // Email gönder
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: existingOrder.customer_name,
            customerEmail: existingOrder.customer_email,
            orderNumber: orderNumberFromUrl,
            orderDate: new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            items: existingOrder.items,
            subtotal: existingOrder.subtotal,
            shippingCost: existingOrder.shipping_cost,
            total: existingOrder.total,
            shippingAddress: existingOrder.customer_address,
          }),
        });
      } catch (emailError) {
        console.error('Email gönderilemedi:', emailError);
      }

      // Sipariş var, step 3'e geç
      setStep(3);
      // Fiyatları set et
      setOrderPrices({
        subtotal: existingOrder.subtotal,
        total: existingOrder.total
      });
      // Ürünleri kaydet (items JSON string olabilir)
      const items = typeof existingOrder.items === 'string' 
        ? JSON.parse(existingOrder.items) 
        : existingOrder.items;
      setOrderItems(items || []);
      // Sepeti 2 saniye sonra boşalt (kullanıcı sipariş numarasını görsün)
      setTimeout(() => {
        clearCart();
      }, 2000);
    } catch (error) {
      console.error('Payment success error:', error);
      setToast({ 
        message: 'Sipariş kontrol edilirken bir hata oluştu.', 
        type: 'error' 
      });
      setStep(2);
    }
  };

  // Payment callback kontrolü - URL parametrelerinden ödeme sonucunu kontrol et
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const orderNumberFromUrl = searchParams.get('order');

    if (paymentStatus === 'success' && orderNumberFromUrl) {
      // Ödeme başarılı - siparişi kontrol et ve step 3'e geç
      handlePaymentSuccess(orderNumberFromUrl);
    } else if (paymentStatus === 'error') {
      // Ödeme başarısız - hata mesajı göster
      setToast({ 
        message: 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.', 
        type: 'error' 
      });
      setStep(2); // Ödeme adımına geri dön
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 3DS form auto-submit
  useEffect(() => {
    if (!threeDSContent) return;

    // Biraz bekle DOM yerleşsin
    const t = setTimeout(() => {
      const container = document.getElementById('three-ds-container');
      if (!container) {
        console.warn('[3DS] container bulunamadı');
        return;
      }

      // Form'u bul
      const form = container.querySelector('form') as HTMLFormElement | null;
      if (form) {
        try {
          console.log('[3DS] form bulundu, submit ediliyor');
          form.submit();
        } catch (e) {
          console.warn('[3DS] form.submit hata', e);
          // Alternatif: submit button'a tıkla
          const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLElement;
          if (submitBtn) {
            submitBtn.click();
          }
        }
      } else {
        // Form yoksa, belki direkt script var veya iframe var
        console.warn('[3DS] form bulunamadı, HTML içeriği:', container.innerHTML.substring(0, 200));
        // Belki de HTML içeriği zaten otomatik submit olacak, bir şey yapmaya gerek yok
      }
    }, 300); // Biraz daha uzun bekle

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

  // Step 3'te sepet boş olsa bile göster (ödeme tamamlandı)
  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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

        {/* Progress Steps - Eski Tasarım */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 ${
                  step >= s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {step > s ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    step > s ? 'bg-gray-900' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className={`text-sm ${step >= 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Bilgiler</span>
            <span className={`text-sm ${step >= 2 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Ödeme</span>
            <span className={`text-sm ${step >= 3 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Onay</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Bilgiler */}
              {step === 1 && (
                <div className="space-y-6">
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
                </div>
              )}

              {/* Step 2: Ödeme */}
              {step === 2 && (
                <div className="space-y-6">
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
                            Bu bir test ortamıdır. Gerçek ödeme yapılmaz. Test kartları ile ödeme simüle edilir ve Supabase'e kaydedilir.
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

                    {/* Kabul Edilen Kartlar */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Kabul Edilen Kartlar</p>
                      <div className="flex gap-3">
                        <div className="px-3 py-2 border rounded text-xs font-semibold">VISA</div>
                        <div className="px-3 py-2 border rounded text-xs font-semibold">MasterCard</div>
                        <div className="px-3 py-2 border rounded text-xs font-semibold">Troy</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Geri
                    </button>
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
                </div>
              )}

              {/* Step 3: Onay */}
              {step === 3 && (
                <div className="flex justify-center">
                  <div className="max-w-2xl w-full space-y-6">
                    {/* Success Card - Minimalist */}
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                      <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-900">Siparişiniz Tamamlandı</h2>
                      <p className="text-gray-600 mb-6">
                        Sipariş onay maili <strong>{formData.email}</strong> adresinize gönderildi.
                      </p>
                    </div>

                    {/* Order Info Card - Minimalist */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Sipariş Numarası</span>
                          <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Toplam Tutar</span>
                          <span className="font-semibold text-gray-900">₺{(orderPrices?.total || grandTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Ödeme Durumu</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">Ödendi</span>
                        </div>
                      </div>
                    </div>

                    {/* Track Order Card - Minimalist */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Siparişinizi Takip Edin</h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Sipariş durumunuzu takip etmek için aşağıdaki sayfadan sipariş numaranızı girebilirsiniz.
                      </p>
                      <Link
                        href={`/siparis-takip?order=${orderNumber}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                      >
                        <Truck className="w-4 h-4" />
                        Siparişimi Takip Et
                      </Link>
                    </div>

                    {/* Action Buttons - Minimalist */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                          href="/"
                          className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-center"
                        >
                          Ana Sayfaya Dön
                        </Link>
                        <Link
                          href="/store"
                          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-center"
                        >
                          Alışverişe Devam Et
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Özeti</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {(step === 3 ? orderItems : cartItems).map((item) => {
                  // Debug: Price parsing
                  const numericPrice = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[₺,.]/g, ''))
                    : item.price;
                  const displayPrice = typeof item.price === 'string' ? item.price : `₺${item.price}`;
                  const itemTotal = numericPrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
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
                  <span className="font-medium text-gray-900">₺{(orderPrices?.subtotal || totalPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium text-green-600">Ücretsiz</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-xl text-gray-900">₺{(orderPrices?.total || grandTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
