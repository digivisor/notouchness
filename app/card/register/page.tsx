'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useCard } from '../../context/CardContext';

export default function CardRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createCard, getCardByHash, loginToCard } = useCard();
  const hash = searchParams.get('hash');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });

  useEffect(() => {
    const checkCard = async () => {
      if (!hash) {
        router.push('/');
        return;
      }
      
      const card = await getCardByHash(hash);
      if (!card) {
        setError('Geçersiz kart kodu. Lütfen kartınızı kontrol edin.');
      } else if (card.isActive) {
        // Kart zaten aktif, profile git
        router.push(`/${card.username}`);
      }
    };
    checkCard();
  }, [hash, getCardByHash, router]);

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
    
    const success = await createCard(hash, formData.email, formData.password);
    if (success) {
      // Kart oluşturuldu, şimdi login yap (güvenli olması için)
      const loginSuccess = await loginToCard(formData.email, formData.password);
      if (loginSuccess) {
        // Login başarılı, setup'a git
        router.push('/card/setup');
      } else {
        // Login başarısız ama kart oluşturuldu, yine de setup'a git
        setTimeout(() => {
          router.push('/card/setup');
        }, 500);
      }
    } else {
      setError('Kart kaydı oluşturulamadı. Kart zaten aktif olabilir.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Ana Sayfaya Dön
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-light">N</span>
            </div>
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
                  <a href="#" className="text-black hover:underline">Kullanım Koşulları</a> ve{' '}
                  <a href="#" className="text-black hover:underline">Gizlilik Politikası</a>&apos;nı okudum, kabul ediyorum.
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
    </div>
  );
}
