'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  Package
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartModal from '../../components/CartModal';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useUser();
  const { cartItems } = useCart();
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/user/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const stats = [
    { label: 'Toplam Sipariş', value: '3', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Sepetteki Ürün', value: cartItems.length.toString(), icon: Package, color: 'bg-green-500' },
    { label: 'Favoriler', value: '5', icon: Heart, color: 'bg-red-500' },
    { label: 'Aktif Kart', value: '2', icon: CreditCard, color: 'bg-purple-500' },
  ];

  const recentOrders = [
    { id: '#NT12345', date: '25 Ekim 2025', status: 'Teslim Edildi', total: '₺2,699', items: 'Notouchness Black Card x2' },
    { id: '#NT12344', date: '20 Ekim 2025', status: 'Kargoda', total: '₺1,499', items: 'Notouchness Gold Card' },
    { id: '#NT12343', date: '15 Ekim 2025', status: 'Teslim Edildi', total: '₺899', items: 'Notouchness White Card' },
  ];

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: User },
    { id: 'orders', label: 'Siparişlerim', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorilerim', icon: Heart },
    { id: 'addresses', label: 'Adreslerim', icon: MapPin },
    { id: 'cards', label: 'Kartlarım', icon: CreditCard },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartVisible(true)} />
      <CartModal isOpen={isCartVisible} onClose={() => setIsCartVisible(false)} />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Hoş Geldin, {user.firstName}!
                  </h1>
                  <p className="text-white/70">
                    Hesap durumunu ve siparişlerini buradan takip edebilirsin
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Sidebar Menu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                          activeTab === item.id
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {activeTab === 'overview' && (
                <>
                  {/* Profile Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profil Bilgileri</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ad Soyad</p>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">E-posta</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Phone className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Telefon</p>
                            <p className="font-medium text-gray-900">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Üyelik Tarihi</p>
                          <p className="font-medium text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                      Profili Düzenle
                    </button>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Son Siparişler</h2>
                      <button className="text-sm text-black hover:underline">
                        Tümünü Gör
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">{order.id}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'Teslim Edildi' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{order.items}</p>
                            <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{order.total}</p>
                            <button className="text-sm text-black hover:underline mt-1">
                              Detaylar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Tüm Siparişler</h2>
                  <p className="text-gray-600">Sipariş geçmişiniz burada görüntülenecek.</p>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Favori Ürünlerim</h2>
                  <p className="text-gray-600">Favorilerinize eklediğiniz ürünler burada görüntülenecek.</p>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Kayıtlı Adreslerim</h2>
                  <p className="text-gray-600">Teslimat adresleriniz burada görüntülenecek.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Hesap Ayarları</h2>
                  <p className="text-gray-600">Hesap ayarlarınızı buradan düzenleyebilirsiniz.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
