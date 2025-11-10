'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Smartphone, QrCode, X } from 'lucide-react';
import { useCard } from '../../context/CardContext';
import Image from 'next/image';

export default function CardLoginPage() {
  const router = useRouter();
  const { loginToCard } = useCard();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await loginToCard(formData.email, formData.password);
    if (success) {
      router.push('/card/setup');
    } else {
      setError('E-posta veya şifre hatalı! Demo: fazilcanakbas5@gmail.com / demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Ana Sayfaya Dön
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/notouchness1.png"
                alt="Notouchness Logo"
                width={160}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-2">
              Kartına Giriş Yap
            </h1>
            <p className="text-gray-600 text-sm">
              Profilini düzenlemek için giriş yap
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

        
          <form onSubmit={handleSubmit} className="space-y-4">
            
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
            </div>

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
                  placeholder="••••••••"
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

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mt-6"
            >
              Giriş Yap
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Kartını henüz aktifleştirmedin mi?{' '}
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              className="text-black font-semibold hover:underline"
            >
              Kartını Tarat
            </button>
          </p>
        </div>
      </div>

      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsScanModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
            <button
              type="button"
              onClick={() => setIsScanModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kartını Nasıl Taratacaksın?</h2>
                <p className="text-sm text-gray-600">NFC veya QR kod ile profilini hızlıca aç.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                  <span className="font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">NFC ile hızlı eşleştir</h3>
                  <p className="text-sm text-gray-600">
                    Telefonunun NFC özelliğini aç, kartını arka kamera hizasına yaklaştır. Ekranda çıkan bildirime dokunarak kartını aktifleştir.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                  <span className="font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">QR kod ile tara</h3>
                  <p className="text-sm text-gray-600">
                    Kartının arkasındaki QR kodu telefon kamerasıyla okut. Yönlendirdiği sayfada kartını kişiselleştirmek için gerekli adımları izle.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                  <span className="font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Profili oluştur</h3>
                  <p className="text-sm text-gray-600">
                    Açılan ekrandan ad-soyad, iletişim bilgileri ve dilediğin bağlantıları ekleyerek kartını tamamla. Artık paylaşmaya hazırsın!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <QrCode size={18} className="text-gray-500" />
                <span>QR okutmada sorun mu yaşıyorsun? Ekran parlaklığını artırmayı dene.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
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
