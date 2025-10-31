'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartModal from '../components/CartModal';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: Bilgiler, 2: Ödeme, 3: Onay

  // Form states
  const [formData, setFormData] = useState({
    // Kişisel Bilgiler
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Teslimat Adresi
    address: '',
    city: '',
    district: '',
    postalCode: '',
    
    // Fatura
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    
    // Ödeme
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Diğer
    orderNote: '',
    sameAsBilling: true,
    saveInfo: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Sipariş tamamlandı
      alert('Siparişiniz başarıyla alındı!');
      clearCart();
      window.location.href = '/';
    }
  };

  const shippingCost = 0; // Ücretsiz kargo
  const totalPrice = getTotalPrice();
  const grandTotal = totalPrice + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onCartClick={() => setIsCartVisible(true)} />
        <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 mt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">Checkout yapmak için sepetinize ürün eklemelisiniz.</p>
            <a 
              href="/store"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Mağazaya Git
            </a>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="max-w-7xl mx-auto px-6 py-12 mt-20">
        {/* Back Button */}
        <a 
          href="/store"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft size={20} />
          Alışverişe Devam Et
        </a>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    step > s ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-4">
            <span className={`text-sm ${step >= 1 ? 'text-black font-medium' : 'text-gray-400'}`}>Bilgiler</span>
            <span className={`text-sm ${step >= 2 ? 'text-black font-medium' : 'text-gray-400'}`}>Ödeme</span>
            <span className={`text-sm ${step >= 3 ? 'text-black font-medium' : 'text-gray-400'}`}>Onay</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Bilgiler */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">İletişim Bilgileri</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0555 555 55 55"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teslimat Adresi */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Teslimat Adresi</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fatura Bilgileri (Opsiyonel) */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Fatura Bilgileri (İsteğe Bağlı)</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
                        <input
                          type="text"
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Dairesi</label>
                        <input
                          type="text"
                          name="taxOffice"
                          value={formData.taxOffice}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sipariş Notu */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Notu (İsteğe Bağlı)</h2>
                    <textarea
                      name="orderNote"
                      value={formData.orderNote}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Siparişiniz hakkında özel bir notunuz varsa buraya yazabilirsiniz..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    Ödeme Adımına Geç
                  </button>
                </div>
              )}

              {/* Step 2: Ödeme */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Ödeme Bilgileri</h2>
                    
                    {/* Güvenlik Badge */}
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <Shield className="text-green-600" size={20} />
                      <span className="text-sm text-green-800">Ödemeniz SSL ile güvenli şekilde işlenir</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kart Üzerindeki İsim</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="AD SOYAD"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma Tarihi</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="AA/YY"
                            maxLength={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kabul Edilen Kartlar */}
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600 mb-3">Kabul Edilen Kartlar</p>
                      <div className="flex gap-3">
                        <div className="px-3 py-2 border rounded text-xs font-semibold">VISA</div>
                        <div className="px-3 py-2 border rounded text-xs font-semibold">MasterCard</div>
                        <div className="px-3 py-2 border rounded text-xs font-semibold">Troy</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                      Siparişi Onayla
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Onay */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h2>
                    <p className="text-gray-600 mb-6">Sipariş numaranız: <strong>#NT{Math.floor(Math.random() * 100000)}</strong></p>
                    <p className="text-gray-600 mb-8">
                      Siparişiniz başarıyla oluşturuldu. Kısa süre içinde kargo takip numaranız e-posta adresinize gönderilecektir.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <a
                        href="/"
                        className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                      >
                        Ana Sayfaya Dön
                      </a>
                      <a
                        href="/store"
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        Alışverişe Devam Et
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Sipariş Özeti</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-900">₺{totalPrice.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium text-green-600">Ücretsiz</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-xl text-gray-900">₺{grandTotal.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={20} className="shrink-0" />
                  <span>Ücretsiz kargo</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={20} className="shrink-0" />
                  <span>Güvenli ödeme</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard size={20} className="shrink-0" />
                  <span>Tüm kartlar kabul edilir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
