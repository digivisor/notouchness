'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function B2BPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // 3 saniye sonra dashboard'a yönlendir
    const timer = setTimeout(() => {
      router.push('/b2b/dashboard?tab=my-cards');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h1>
          <p className="text-gray-600">
            Satın alma işleminiz başarıyla tamamlandı.
          </p>
          {orderNumber && (
            <p className="text-sm text-gray-500 mt-2">Sipariş No: {orderNumber}</p>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Satın aldığınız kart "Kartlarım" sekmesinde görüntülenebilir.
          </p>
          <button
            onClick={() => router.push('/b2b/dashboard?tab=my-cards')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Kartlarımı Görüntüle
            <ArrowRight size={18} />
          </button>
          <p className="text-xs text-gray-500 mt-4">
            3 saniye içinde otomatik olarak yönlendirileceksiniz...
          </p>
        </div>
      </div>
    </div>
  );
}

