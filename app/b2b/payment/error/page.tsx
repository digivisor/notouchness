'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function B2BPaymentErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const errorCode = searchParams.get('errorCode');
  const errorMessage = searchParams.get('errorMessage');

  const getErrorMessage = () => {
    if (errorMessage) {
      try {
        return decodeURIComponent(errorMessage);
      } catch {
        return errorMessage;
      }
    }
    
    switch (reason) {
      case '3ds_failed':
        return '3D Secure doğrulaması başarısız oldu. Lütfen tekrar deneyin.';
      case 'insufficient_funds':
        return 'Kartınızda yeterli bakiye bulunmamaktadır.';
      case 'invalid_card':
        return 'Geçersiz kart bilgileri. Lütfen kontrol edip tekrar deneyin.';
      case 'expired_card':
        return 'Kartınızın son kullanma tarihi geçmiş.';
      case 'general_error':
      default:
        return 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h1>
          <p className="text-gray-600 mb-4">
            {getErrorMessage()}
          </p>
          {errorCode && (
            <p className="text-xs text-gray-500">Hata Kodu: {errorCode}</p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/b2b/dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Geri Dön
          </button>
          <p className="text-xs text-gray-500">
            Sorun devam ederse lütfen destek ekibimizle iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}

