  'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, Plus, X, CreditCard, Shield } from 'lucide-react';
import B2BSidebar from '../components/B2BSidebar';

type Dealer = {
  id: string;
  name: string;
  email: string;
  logo_url?: string | null;
};

type AccountTransaction = {
  id: string;
  dealer_id: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
};

type DealerAccount = {
  id: string;
  dealer_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export default function B2BAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [threeDSContent, setThreeDSContent] = useState<string | null>(null);
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
  const getOrderNumber = (dealerId: string, amount: number) => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    // Ayırıcı olarak alt çizgi kullan (UUID tire içerdiği için)
    return `DEPOSIT_${dealerId}_${amount.toFixed(2).replace('.', '')}_${dateStr}_${random}`;
  };

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
        void loadAccount(parsed.dealer.id);
        void loadTransactions(parsed.dealer.id);
      } else {
        router.push('/b2b/login');
      }
    } catch (e) {
      router.push('/b2b/login');
    }

    // URL'den payment success parametresini kontrol et
    const paymentParam = searchParams.get('payment');
    const amountParam = searchParams.get('amount');
    
    if (paymentParam === 'success') {
      if (amountParam) {
        setSuccessMessage(`${amountParam} TRY hesabınıza başarıyla yüklendi!`);
      } else {
        setSuccessMessage('Para yükleme işlemi başarıyla tamamlandı!');
      }
      setShowSuccessModal(true);
      
      // URL'yi temizle
      window.history.replaceState({}, '', window.location.pathname);
      
      // Hesabı ve işlemleri yeniden yükle (biraz gecikmeli, DB replikasyonu için)
      const parsed = JSON.parse(session) as { dealer?: Dealer };
      if (parsed.dealer) {
        const dealerId = parsed.dealer.id;
        setTimeout(() => {
          void loadAccount(dealerId);
          void loadTransactions(dealerId);
        }, 1000);
      }
    } else if (paymentParam === 'error') {
      const reason = searchParams.get('reason');
      let msg = 'Ödeme işlemi başarısız oldu.';
      if (reason === 'config_error_key') msg += ' (API Anahtarı Eksik)';
      else if (reason === 'config_error_amount') msg += ' (Geçersiz Tutar)';
      else if (reason === 'dealer_not_found') msg += ' (Bayi Bulunamadı)';
      else if (reason === 'update_failed') msg += ' (Bakiye Güncellenemedi)';
      else if (reason === 'invalid_order') msg += ' (Geçersiz Sipariş)';
      else if (reason) msg += ` (Kod: ${reason})`;
      
      setErrorMessage(msg);
      setShowErrorModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [router, searchParams]);

  // 3DS auto-submit (güçlendirilmiş retry mekanizması ile)
  useEffect(() => {
    if (!threeDSContent) return;

    const submitForm = () => {
      const container = document.getElementById('three-ds-container');
      if (!container) return false;

      const form = container.querySelector('form');
      if (form) {
        try {
          console.log('3DS Form bulundu, submit ediliyor...');
          form.submit();
          return true;
        } catch (e) {
          console.error('Form submit hatası:', e);
          // Fallback: submit butonuna tıkla
          const submitBtn = form.querySelector(
            'input[type="submit"], button[type="submit"]'
          ) as HTMLElement;
          if (submitBtn) {
            submitBtn.click();
            return true;
          }
        }
      }
      return false;
    };

    // İlk deneme
    if (!submitForm()) {
      // Başarısızsa interval ile dene
      const interval = setInterval(() => {
        if (submitForm()) {
          clearInterval(interval);
        }
      }, 1000); // Her 1 saniyede bir dene

      // 15 saniye sonra durdur
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 15000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [threeDSContent]);

  const loadAccount = async (dealerId: string) => {
    try {
      setIsLoading(true);
      // Önce mevcut hesabı kontrol et
      const { data: existingAccount, error: fetchError } = await supabase
        .from('dealer_accounts')
        .select('*')
        .eq('dealer_id', dealerId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Hesap yoksa upsert ile oluştur (duplicate key hatasını önlemek için)
        const { data: newAccount, error: upsertError } = await supabase
          .from('dealer_accounts')
          .upsert({
            dealer_id: dealerId,
            balance: 0,
          }, {
            onConflict: 'dealer_id',
          })
          .select()
          .single();

        if (upsertError) {
          throw upsertError;
        }
        setAccount(newAccount as DealerAccount);
      } else if (fetchError) {
        throw fetchError;
      } else {
        setAccount(existingAccount as DealerAccount);
      }
    } catch (err: any) {
      console.error('Hesap yüklenirken hata:', err);
      setError(err.message || 'Hesap bilgileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async (dealerId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('dealer_account_transactions')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setTransactions((data || []) as AccountTransaction[]);
    } catch (err: any) {
      console.error('İşlemler yüklenirken hata:', err);
    }
  };

  // Luhn algoritması ile kart numarası validasyonu
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

  // Tutar formatlama
  const formatCurrency = (value: string) => {
    if (!value) return '';
    // Sadece rakamları al ve nokta koy
    return parseFloat(value).toLocaleString('tr-TR');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece rakamları al
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue) {
      setDepositAmount(rawValue);
    } else {
      setDepositAmount('');
    }
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

  const handleDeposit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!dealer || !depositAmount) {
      setError('Lütfen tutarı girin.');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Geçerli bir tutar girin.');
      return;
    }

    // Kart bilgileri validasyonu
    if (!validateCardNumber(formData.cardNumber)) {
      setError('Geçersiz kart numarası!');
      return;
    }
    if (!validateExpiryDate(formData.expiryDate)) {
      setError('Geçersiz veya geçmiş son kullanma tarihi!');
      return;
    }
    if (formData.cvv.length !== 3) {
      setError('CVV 3 haneli olmalıdır!');
      return;
    }
    if (!formData.cardName.trim()) {
      setError('Kart üzerindeki isim gereklidir!');
      return;
    }

    setDepositing(true);
    setError(null);

    try {
      // Kart bilgilerini iyzico ile ödeme yap
      const [expMonth, expYear] = formData.expiryDate.split('/');
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const depositOrderNumber = getOrderNumber(dealer.id, amount);

      let paymentResponse: Response;
      try {
        paymentResponse = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            orderNumber: depositOrderNumber,
            customerEmail: dealer.email,
            customerName: dealer.name,
            customerPhone: '',
            billingAddress: 'B2B Cari Hesap Yükleme',
            cardNumber,
            cardHolderName: formData.cardName,
            expireMonth: expMonth,
            expireYear: expYear,
            cvc: formData.cvv,
            installment: 1,
          }),
        });
      } catch (fetchError: any) {
        console.error('Fetch hatası:', fetchError);
        throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
      }

      let paymentData: any;
      try {
        paymentData = await paymentResponse.json();
      } catch (jsonError) {
        console.error('JSON parse hatası:', jsonError);
        throw new Error('Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.');
      }

      if (!paymentResponse.ok || paymentData.error) {
        throw new Error(paymentData.error || 'Ödeme başlatılamadı');
      }

      // 3D Secure kontrolü
      if (paymentData.threeDSHtmlContent) {
        let html = paymentData.threeDSHtmlContent || '';
        try {
          const looksBase64 =
            /^[A-Za-z0-9+/=\n\r]+$/.test(html) && !html.includes('<form');
          if (looksBase64 && typeof atob !== 'undefined') {
            const decoded = atob(html);
            if (decoded.includes('<form')) html = decoded;
          }
        } catch {
          // Base64 decode başarısız olursa olduğu gibi kullan
        }

        // 3D Secure formunu otomatik submit et (checkout sayfasındaki gibi)
        setThreeDSContent(html);
        setDepositing(false);
        return;
      }

      // 3D Secure yoksa direkt para yükle
      if (paymentData.status === 'success') {
        // API route üzerinden para yükle
        let response: Response;
        try {
          response = await fetch('/api/b2b/deposit-to-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dealerId: dealer.id,
              amount: amount,
              description: depositDescription || `Para yükleme - Sipariş: ${depositOrderNumber}`,
              paymentReference: paymentData.paymentId || depositOrderNumber,
            }),
          });
        } catch (fetchError: any) {
          console.error('Deposit fetch hatası:', fetchError);
          throw new Error('Para yükleme işlemi sırasında bağlantı hatası oluştu. Lütfen tekrar deneyin.');
        }

        let data: any;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Deposit JSON parse hatası:', jsonError);
          throw new Error('Para yükleme yanıtı işlenirken hata oluştu. Lütfen tekrar deneyin.');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Para yükleme sırasında hata oluştu');
        }

        // Hesabı ve işlemleri yeniden yükle
        await loadAccount(dealer.id);
        await loadTransactions(dealer.id);

        setSuccess(`${amount.toFixed(2)} TRY hesabınıza yüklendi! Yeni bakiye: ${data.newBalance.toFixed(2)} TRY`);
        setShowDepositModal(false);
        setDepositAmount('');
        setDepositDescription('');
        setFormData({
          cardNumber: '',
          cardName: '',
          expiryDate: '',
          cvv: '',
        });
        setCardErrors({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
        });
      } else {
        throw new Error('Ödeme başarısız oldu');
      }
    } catch (err: any) {
      console.error('Para yükleme hatası:', err);
      const errorMessage = err.message || 'Para yükleme sırasında hata oluştu';
      setError(errorMessage);
      // Hata modalını da göster
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setDepositing(false);
    }
  };

  if (isLoading && !dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!dealer) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <B2BSidebar dealer={dealer} activeTab="account" />

      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-[40]">
          <div className="px-6 py-4">
            <button
              onClick={() => router.push('/b2b/dashboard')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-2"
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Cari Hesap</h1>
            <p className="text-sm text-gray-600 mt-1">Hesap bakiyeniz ve işlem geçmişiniz</p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
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

          {/* Bakiye Kartı ve Hızlı İşlemler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Ana Bakiye Kartı - Geniş */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 opacity-90">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-wide uppercase">Mevcut Bakiye</span>
                </div>
                
                <div className="flex items-end gap-2 mb-8">
                  <h2 className="text-5xl font-bold tracking-tight">
                    {account ? account.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                  </h2>
                  <span className="text-2xl font-medium mb-1 opacity-80">TRY</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus size={20} />
                    Para Yükle
                  </button>
                </div>
              </div>
            </div>

            {/* Yan İstatistik Kartı (Örn: Son Harcama) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-4">Son İşlem</h3>
              {transactions.length > 0 ? (
                <div>
                  <div className={`text-2xl font-bold mb-1 ${transactions[0].type === 'deposit' || transactions[0].type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                    {transactions[0].type === 'deposit' || transactions[0].type === 'refund' ? '+' : '-'}
                    {transactions[0].amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(transactions[0].created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Henüz işlem yok</p>
              )}
            </div>
          </div>

          {/* İşlem Geçmişi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">İşlem Geçmişi</h2>
                  <p className="text-sm text-gray-500">Son hesap hareketleriniz</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Clock size={32} className="opacity-50" />
                  </div>
                  <p>Henüz işlem geçmişiniz bulunmuyor.</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          transaction.type === 'deposit'
                            ? 'bg-green-100 text-green-600'
                            : transaction.type === 'refund'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'deposit' ? (
                          <TrendingUp size={24} />
                        ) : transaction.type === 'refund' ? (
                          <TrendingUp size={24} />
                        ) : (
                          <TrendingDown size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {transaction.type === 'deposit'
                            ? 'Bakiye Yükleme'
                            : transaction.type === 'refund'
                            ? 'İade'
                            : 'Kart Satın Alma'}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {transaction.description || (transaction.type === 'deposit' ? 'Kredi Kartı ile Yükleme' : 'Bakiyeden Harcama')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 block md:hidden">
                          {new Date(transaction.created_at).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <p
                        className={`font-bold text-xl ${
                          transaction.type === 'deposit' || transaction.type === 'refund'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'deposit' || transaction.type === 'refund'
                          ? '+'
                          : '-'}
                        {transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TRY
                      </p>
                      <p className="text-sm text-gray-400 mt-1 hidden md:block">
                        {new Date(transaction.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Para Yükleme Modalı */}
      {showDepositModal && !threeDSContent && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[100] p-6" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDepositModal(false);
            setDepositAmount('');
            setDepositDescription('');
            setFormData({
              cardNumber: '',
              cardName: '',
              expiryDate: '',
              cvv: '',
            });
            setCardErrors({
              cardNumber: '',
              expiryDate: '',
              cvv: '',
            });
            setError(null);
            setSuccess(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full relative">
            {/* Kapat Butonu */}
            <button
              onClick={() => {
                setShowDepositModal(false);
                setDepositAmount('');
                setDepositDescription('');
                setFormData({
                  cardNumber: '',
                  cardName: '',
                  expiryDate: '',
                  cvv: '',
                });
                setCardErrors({
                  cardNumber: '',
                  expiryDate: '',
                  cvv: '',
                });
                setError(null);
                setSuccess(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleDeposit} className="p-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Sol Taraf - Tutar ve Kart Bilgileri */}
                <div className="space-y-6">
                  {/* Tutar */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Yüklenecek Tutar (TRY) *
                    </label>
                    <input
                      type="text"
                      value={depositAmount ? parseFloat(depositAmount).toLocaleString('tr-TR') : ''}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold text-gray-900"
                      required
                    />
                  </div>

                  {/* Test Kartı Doldur */}
                  <div>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200"
                    >
                      Test Kartı Doldur
                    </button>
                  </div>

                  {/* Kart Bilgileri */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kart Bilgileri</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Numarası *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          cardErrors.cardNumber ? 'border-red-300' : 'border-gray-200'
                        }`}
                        required
                      />
                      {cardErrors.cardNumber && (
                        <p className="text-xs text-red-600 mt-1">{cardErrors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Üzerindeki İsim *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="AD SOYAD"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Son Kullanma *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            cardErrors.expiryDate ? 'border-red-300' : 'border-gray-200'
                          }`}
                          required
                        />
                        {cardErrors.expiryDate && (
                          <p className="text-xs text-red-600 mt-1">{cardErrors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            cardErrors.cvv ? 'border-red-300' : 'border-gray-200'
                          }`}
                          required
                        />
                        {cardErrors.cvv && (
                          <p className="text-xs text-red-600 mt-1">{cardErrors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf - Özet ve Güvenlik */}
                <div className="space-y-6">
                  {/* Özet */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Ödeme Özeti</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Yüklenecek Tutar:</span>
                        <span className="font-semibold text-gray-900">
                          {depositAmount ? parseFloat(depositAmount).toFixed(2) : '0.00'} TRY
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Toplam:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {depositAmount ? parseFloat(depositAmount).toFixed(2) : '0.00'} TRY
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Güvenlik Badge */}
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Shield className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Güvenli Ödeme</p>
                      <p className="text-xs text-blue-700">Ödemeniz SSL ile güvenli şekilde işlenir. Kart bilgileriniz saklanmaz.</p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Butonlar */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDepositModal(false);
                        setDepositAmount('');
                        setDepositDescription('');
                        setFormData({
                          cardNumber: '',
                          cardName: '',
                          expiryDate: '',
                          cvv: '',
                        });
                        setCardErrors({
                          cardNumber: '',
                          expiryDate: '',
                          cvv: '',
                        });
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition flex-1"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={depositing || !depositAmount}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition flex-1"
                    >
                      {depositing ? 'İşleniyor...' : `Yükle ${depositAmount ? parseFloat(depositAmount).toFixed(2) : '0.00'} TRY`}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">İşlem Başarılı!</h3>
            <p className="text-gray-600 mb-8">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition transform hover:-translate-y-0.5 shadow-lg"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">İşlem Başarısız</h3>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition transform hover:-translate-y-0.5 shadow-lg"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* 3D Secure Yönlendirme Ekranı */}
      {threeDSContent && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
          
          {/* Gizli Form Container */}
          <div id="three-ds-container" style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'hidden' }}>
            <div dangerouslySetInnerHTML={{ __html: threeDSContent }} />
          </div>
        </div>
      )}
    </div>
  );
}


