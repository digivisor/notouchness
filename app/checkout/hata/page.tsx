'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CartModal from '@/app/components/CartModal';
import { XCircle, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';

// iyzico hata mesajları mapping
const errorMessages: Record<string, { title: string; message: string }> = {
  '3ds_failed': {
    title: '3D Secure Doğrulama Başarısız',
    message: 'Kartınızın 3D Secure doğrulaması tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.'
  },
  'missing_params': {
    title: 'Ödeme Bilgileri Eksik',
    message: 'Ödeme işlemi için gerekli bilgiler eksik. Lütfen tekrar deneyin.'
  },
  'server_error': {
    title: 'Sunucu Hatası',
    message: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
  },
  'insufficient_funds': {
    title: 'Yetersiz Bakiye',
    message: 'Kartınızda yeterli bakiye bulunmamaktadır. Lütfen bakiyenizi kontrol edip tekrar deneyin.'
  },
  'invalid_card': {
    title: 'Geçersiz Kart',
    message: 'Kart bilgileriniz geçersiz. Lütfen kart numaranızı, son kullanma tarihini ve CVV kodunu kontrol edin.'
  },
  'expired_card': {
    title: 'Süresi Dolmuş Kart',
    message: 'Kartınızın son kullanma tarihi geçmiş. Lütfen geçerli bir kart kullanın.'
  },
  'stolen_card': {
    title: 'Kart Güvenlik Uyarısı',
    message: 'Kartınız güvenlik nedeniyle reddedildi. Lütfen bankanızla iletişime geçin.'
  },
  'lost_card': {
    title: 'Kart Güvenlik Uyarısı',
    message: 'Kartınız güvenlik nedeniyle reddedildi. Lütfen bankanızla iletişime geçin.'
  },
  'fraud_suspect': {
    title: 'Güvenlik Uyarısı',
    message: 'İşlem güvenlik nedeniyle reddedildi. Lütfen bankanızla iletişime geçin.'
  },
  'do_not_honour': {
    title: 'İşlem Reddedildi',
    message: 'Kartınız bu işlemi onaylamadı. Lütfen bankanızla iletişime geçin.'
  },
  'invalid_transaction': {
    title: 'Geçersiz İşlem',
    message: 'İşlem geçersiz. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.'
  },
  'not_permitted': {
    title: 'İşlem İzni Yok',
    message: 'Bu işlem için izniniz bulunmamaktadır. Lütfen bankanızla iletişime geçin.'
  },
  'general_error': {
    title: 'Genel Hata',
    message: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
  },
  'default': {
    title: 'Ödeme Başarısız',
    message: 'Ödeme işlemi tamamlanamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.'
  }
};

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCartVisible, setIsCartVisible] = useState(false);
  
  const reason = searchParams.get('reason') || 'default';
  const errorCode = searchParams.get('errorCode');
  const errorMessage = searchParams.get('errorMessage');
  
  const errorInfo = errorMessages[reason] || errorMessages['default'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-2xl mx-auto px-6 py-20 mt-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
            {errorInfo.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            {errorInfo.message}
          </p>

          {/* Additional Error Details */}
          {(errorCode || errorMessage) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Teknik Detaylar:</p>
                  {errorCode && (
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Hata Kodu:</span> {errorCode}
                    </p>
                  )}
                  {errorMessage && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Hata Mesajı:</span> {errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/checkout/odeme"
              className="flex-1 bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition text-center flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Tekrar Dene
            </Link>
            <Link
              href="/checkout"
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Ödeme Bilgilerine Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Sorun devam ederse lütfen{' '}
              <Link href="/iletisim" className="text-black font-semibold hover:underline">
                bizimle iletişime geçin
              </Link>
              {' '}veya{' '}
              <Link href="/siparis-takip" className="text-black font-semibold hover:underline">
                siparişinizi takip edin
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

