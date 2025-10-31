'use client';

import Image from 'next/image';

export default function About() {
  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol taraf - Mockup Görseli */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg">
              <Image
                src="/mockup.png"
                alt="Notouchness Digital NFC Card"
                width={900}
                height={900}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Sağ taraf - Başlık ve Özellikler */}
          <div className="space-y-8">
            {/* Başlık */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Neden Notouchness{' '}
              <span style={{ color: '#4BA3A2' }}>Dijital NFC Kartvizit?</span>
            </h2>

            {/* Özellikler */}
            <div className="space-y-6">
              {/* Özellik 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4BA3A2', opacity: 1 }}>
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tüm Cihazlarla Uyumlu
                  </h3>
                  <p className="text-gray-600">
                    iOS ve Android cihazlarla sorunsuz çalışır. NFC destekli tüm telefonlarla anında paylaşım yapın.
                  </p>
                </div>
              </div>

              {/* Özellik 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4BA3A2', opacity: 1 }}>
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    NFC & QR Sınırsız Paylaşım
                  </h3>
                  <p className="text-gray-600">
                    Hem NFC hem QR kod ile sınırsız paylaşım imkanı. İstediğiniz yöntemi seçin, anında bağlantı kurun.
                  </p>
                </div>
              </div>

              {/* Özellik 3 */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4BA3A2', opacity: 1 }}>
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Yapay Zeka Teknolojisi
                  </h3>
                  <p className="text-gray-600">
                    AI destekli akıllı profil önerileri ve otomatik optimizasyon ile her zaman en iyi görünümü yakalayın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
