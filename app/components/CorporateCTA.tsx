'use client';

interface CorporateCTAProps {
  onOpenModal: () => void;
}

export default function CorporateCTA({ onOpenModal }: CorporateCTAProps) {
  return (
    <section className="w-full bg-gradient-to-r from-gray-900 to-gray-800 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Kurumsal Çözümler
        </h2>
        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Ekibiniz için toplu sipariş mi vermek istiyorsunuz? Özel tasarım ve indirimli fiyatlardan yararlanın.
        </p>
        <button 
          onClick={onOpenModal}
          className="px-10 py-4 rounded-xl font-semibold text-gray-900 bg-white hover:bg-gray-100 transition-all text-lg hover:shadow-xl"
        >
          Kurumsal Teklif Alın
        </button>
      </div>
    </section>
  );
}
