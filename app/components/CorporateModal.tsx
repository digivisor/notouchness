'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CorporateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CorporateModal({ isOpen, onClose }: CorporateModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderme işlemi burada yapılacak
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
            <h2 className="text-3xl font-bold text-gray-900">Kurumsal Teklif Alın</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <p className="text-gray-600 mb-6">
              Ekibiniz için özel fiyat teklifi almak için formu doldurun. En kısa sürede sizinle iletişime geçeceğiz.
            </p>

            {/* Şirket Adı */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Şirket Adı *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition"
                placeholder="Şirketinizin adını girin"
              />
            </div>

            {/* İletişim Kişisi */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                İletişim Kişisi *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            {/* Email ve Telefon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition"
                  placeholder="ornek@sirket.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition"
                  placeholder="+90 (5xx) xxx xx xx"
                />
              </div>
            </div>

            {/* Adet */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tahmini Kart Adedi *
              </label>
              <input
                type="number"
                required
                min="10"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition"
                placeholder="Minimum 10 adet"
              />
            </div>

            {/* Mesaj */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ek Notlar (Opsiyonel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent outline-none transition resize-none"
                placeholder="Özel tasarım talepleriniz veya sorularınız..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:shadow-lg text-lg"
              style={{ backgroundColor: '#4BA3A2' }}
            >
              Teklif Talebi Gönder
            </button>

            <p className="text-xs text-gray-500 text-center">
              Form göndererek <a href="#" className="underline">gizlilik politikamızı</a> kabul etmiş olursunuz.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
