'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useCard } from '../../context/CardContext';
import Image from 'next/image';
import { X, FileText, ShieldCheck } from 'lucide-react';

function CardRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createCard, getCardByHash, loginToCard } = useCard();
  const hash = searchParams.get('hash');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });
  const [modalContent, setModalContent] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    // Sadece form submit edilmediğinde kontrol et
    if (isSubmitting) return;
    
    const checkCard = async () => {
      if (!hash) {
        router.push('/');
        return;
      }
      
      const card = await getCardByHash(hash);
      if (!card) {
        setError('Geçersiz kart kodu. Lütfen kartınızı kontrol edin.');
      } else if (card.isActive && card.username) {
        // Kart zaten aktif ve username var, profile git
        router.push(`/${card.username}`);
      } else if (card.isActive && !card.username) {
        // Kart aktif ama username yok, setup'a git
        router.push('/card/setup');
      }
    };
    checkCard();
  }, [hash, getCardByHash, router, isSubmitting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz!');
      return;
    }
    
    if (!hash) {
      setError('Kart kodu bulunamadı!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await createCard(hash, formData.email, formData.password);
      if (success) {
        // Kart oluşturuldu, şimdi login yap (güvenli olması için)
        const loginSuccess = await loginToCard(formData.email, formData.password);
        if (loginSuccess) {
          // Login başarılı, setup'a git
          router.push('/card/setup');
        } else {
          // Login başarısız, login sayfasına yönlendir
          router.push(`/card/login?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        setIsSubmitting(false);
        setError('Kart kaydı oluşturulamadı. Kart zaten aktif olabilir.');
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Registration error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        
        {/* Back Button */}
        {/* <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Ana Sayfaya Dön
        </Link> */}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Logo */}
          <div className="text-center mb-8">
             <div className="w-80 h-24 flex items-center justify-center mx-auto mb-4 ">
              <Image src="/notouchness1.png" alt="Logo" width={250} height={250}  />
            </div>
            {/* <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-light">N</span>
            </div> */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              NFC Kartını Aktifleştir
            </h1>
            <p className="text-gray-600 text-sm">
              Kartın için hesap oluştur ve profilini özelleştir
            </p>
          </div>

          {/* Card Hash Info */}
          {hash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Kart Kodu:</strong> {hash}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Adınız"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Soyadınız"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Bu e-posta ile giriş yapacaksın</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="En az 6 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Şifreni tekrar gir"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mt-1"
                  required
                />
                <span className="text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => setModalContent('terms')}
                    className="text-black hover:underline"
                  >
                    Kullanım Koşulları
                  </button>
                  {' '}ve{' '}
                  <button
                    type="button"
                    onClick={() => setModalContent('privacy')}
                    className="text-black hover:underline"
                  >
                    Gizlilik Politikası
                  </button>
                  &apos;nı okudum, kabul ediyorum.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mt-6"
            >
              Hesabı Oluştur ve Devam Et
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Zaten hesabın var mı?{' '}
            <Link href="/card/login" className="text-black font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🎉 Hoş geldin! Kartını aktifleştirdikten sonra profilini özelleştirebileceksin.
          </p>
        </div>
      </div>

      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalContent(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setModalContent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                {modalContent === 'terms' ? <FileText size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalContent === 'terms' ? 'Kullanım Koşulları' : 'Gizlilik Politikası'}
                </h2>
                <p className="text-sm text-gray-600">
                  Kartını güvenle kullanman için bilmen gereken önemli bilgiler.
                </p>
              </div>
            </div>

            {modalContent === 'terms' ? (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Notouchness dijital kartvizit hizmetini kullanarak, NFC ve QR kod teknolojileri üzerinden profil
                  paylaşımını sağlar, fiziksel kartlara modern ve sürdürülebilir bir alternatif sunar. Hizmeti kullanman
                  için oluşturduğun hesabın güvenliğinden sen sorumlusun; giriş bilgilerini üçüncü kişilerle paylaşmamalısın.
                </p>
                <p>
                  Platformu kötüye kullanmak, izinsiz veri paylaşımı yapmak veya yanlış bilgi vermek hesabının askıya
                  alınmasına neden olabilir. Sunulan içerik ve hizmetler zaman zaman güncellenebilir; önemli değişiklikler
                  olduğunda sana haber verilir.
                </p>
                <p>
                  Kartıyla yapılan paylaşımlardan doğan tüm etkileşimler kullanıcı sorumluluğundadır. Ürün ve servislerimizi
                  en kaliteli şekilde sunmak için gereken bakımı yaparız; ancak sistem bakım veya üçüncü taraf kesintilerinde
                  kısa süreli erişim sorunları yaşanabileceğini kabul etmiş olursun.
                </p>
                <p>
                  Notouchness, <a href="/hakkimizda" className="text-black font-semibold hover:underline">hakkımızda </a>
                  sayfasında paylaştığı misyon ve değerler doğrultusunda hizmet verir ve bu koşullara uyum sağlaman beklenir.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Notouchness, kartını aktifleştirirken paylaştığın kişisel verileri (ad-soyad, iletişim bilgileri, profil
                  içerikleri) sadece kart vizit hizmetini sunmak ve geliştirmek için kullanır. Verilerin, kartını paylaştığın
                  kişilerle dilediğin ölçüde ortaya çıkar; profilinde hangi bilgileri göstereceğine sen karar verirsin.
                </p>
                <p>
                  Hesabına ait bilgiler, yetkisiz erişimlere karşı SSL ve benzeri güvenlik önlemleriyle korunur. Yetkisiz
                  giriş veya veri ihlali şüphesi olduğunda destek ekibimizle iletişime geçebilirsin; 7/24 destek sunuyoruz.
                </p>
                <p>
                  Verilerini istediğin zaman güncelleyebilir veya hesabını kapatabilirsin. Hesap kapatma işlemlerinde yasal
                  yükümlülükler nedeniyle bazı veriler belirli süre saklanabilir; bu süreçler ilgili mevzuata uygundur.
                </p>
                <p>
                  Daha detaylı bilgi için <a href="/gizlilik-sozlesmesi" className="text-black font-semibold hover:underline">Gizlilik Sözleşmesi </a>
                  sayfamızı ziyaret edebilirsin. Hizmeti kullanmaya devam ederek bu politikayı kabul etmiş sayılırsın.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CardRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <CardRegisterContent />
    </Suspense>
  );
}
