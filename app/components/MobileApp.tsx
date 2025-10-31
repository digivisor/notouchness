'use client';

import Image from 'next/image';

export default function MobileApp() {
  return (
    <section className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol taraf - Mockup */}
          <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-md">
              <Image
                src="/mockup.png"
                alt="Notouchness Mobile App"
                width={600}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Sağ taraf - İçerik */}
          <div className="text-white space-y-8 order-1 lg:order-2">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#4BA3A2' }}>
              Yakında
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Notouchness Mobil Uygulaması
              <br />
              <span style={{ color: '#4BA3A2' }}>Yakında!</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Kartınızı daha kolay yönetin, anlık güncellemeler yapın ve istatistiklerinizi takip edin. 
              iOS ve Android için yakında mağazalarda.
            </p>

            {/* Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* App Store */}
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-xl hover:bg-gray-100 transition group"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-600">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>

              {/* Play Store */}
              <a 
                href="#" 
                className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-xl hover:bg-gray-100 transition group"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-600">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
