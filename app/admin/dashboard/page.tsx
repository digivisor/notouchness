'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, Copy, Download, ExternalLink, CheckCircle, XCircle, 
  LogOut, Home, LayoutDashboard, CreditCard, Users, Settings,
  TrendingUp, Eye, Calendar, Search, Filter
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { createCardByAdmin, getAllCards } = useCard();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [customHash, setCustomHash] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
  });

  useEffect(() => {
    // Admin session kontrolü
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    loadCards();
    const interval = setInterval(loadCards, 5000); // 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [router]);

  const loadCards = async () => {
    const allCards = await getAllCards();
    setCards(allCards);
    
    // İstatistikleri hesapla
    setStats({
      total: allCards.length,
      active: allCards.filter(c => c.isActive).length,
      inactive: allCards.filter(c => !c.isActive).length,
      totalViews: allCards.reduce((sum, c) => sum + (c.viewCount || 0), 0),
    });
  };

  const handleCreateCard = async () => {
    const newCard = await createCardByAdmin(customHash || undefined);
    if (newCard) {
      setCustomHash('');
      await loadCards();
      setSelectedCard(newCard);
    } else {
      alert('❌ Kart oluşturulamadı!');
    }
  };

  const getCardUrl = (hash: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/card/${hash}`;
    }
    return '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Kopyalandı!');
  };

  const downloadQRCode = (hash: string) => {
    const svg = document.getElementById(`qr-${hash}`)?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${hash}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Filtreleme
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.username && card.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.fullName && card.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.email && card.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && card.isActive) ||
      (filterStatus === 'inactive' && !card.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const activeCards = filteredCards.filter(c => c.isActive);
  const inactiveCards = filteredCards.filter(c => !c.isActive);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePage="dashboard" />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Kart</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktif Kartlar</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pasif Kartlar</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Görüntüleme</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Yeni Kart Oluştur */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Kart Oluştur</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Hash (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={customHash}
                  onChange={(e) => setCustomHash(e.target.value)}
                  placeholder="Örn: abc123xyz (boş bırakılırsa otomatik üretilir)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreateCard}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Kart Oluştur
                </button>
              </div>
            </div>
          </div>

          {/* Filtre ve Arama */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kart ID, username, isim veya email ile ara..."
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle size={16} />
                  Aktif
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterStatus === 'inactive'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <XCircle size={16} />
                  Pasif
                </button>
              </div>
            </div>
          </div>

          {/* Kart Listesi */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Kartlar ({filteredCards.length})</h2>
            </div>
            
            {filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Kart bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Aktif Kartlar */}
                {activeCards.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      Aktif Kartlar ({activeCards.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeCards.map((card) => (
                        <CardItem
                          key={card.id}
                          card={card}
                          getCardUrl={getCardUrl}
                          copyToClipboard={copyToClipboard}
                          downloadQRCode={downloadQRCode}
                          isSelected={selectedCard?.id === card.id}
                          onSelect={() => setSelectedCard(card)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pasif Kartlar */}
                {inactiveCards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle size={20} className="text-orange-600" />
                      Pasif Kartlar ({inactiveCards.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {inactiveCards.map((card) => (
                        <CardItem
                          key={card.id}
                          card={card}
                          getCardUrl={getCardUrl}
                          copyToClipboard={copyToClipboard}
                          downloadQRCode={downloadQRCode}
                          isSelected={selectedCard?.id === card.id}
                          onSelect={() => setSelectedCard(card)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Seçili Kart Detayları Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          getCardUrl={getCardUrl}
          copyToClipboard={copyToClipboard}
          downloadQRCode={downloadQRCode}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

function CardItem({ card, getCardUrl, copyToClipboard, downloadQRCode, isSelected, onSelect }: any) {
  return (
    <div
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-gray-900">{card.id}</span>
            {card.isActive ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                Aktif
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                Pasif
              </span>
            )}
          </div>
          {card.username && (
            <p className="text-sm text-gray-600">@{card.username}</p>
          )}
          {card.fullName && (
            <p className="text-sm font-medium text-gray-900">{card.fullName}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-3 p-2 bg-gray-50 rounded-lg">
        <QRCodeSVG value={getCardUrl(card.id)} size={100} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(getCardUrl(card.id));
          }}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Copy size={14} />
          Kopyala
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadQRCode(card.id);
          }}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          title="QR İndir"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
}

function CardDetailModal({ card, getCardUrl, copyToClipboard, downloadQRCode, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Kart Detayları</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart ID</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={card.id}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(card.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Kopyala"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kart URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={getCardUrl(card.id)}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(getCardUrl(card.id))}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Kopyala"
              >
                <Copy size={18} />
              </button>
              <a
                href={`/card/${card.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Aç"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">QR Kod</label>
            <div id={`qr-${card.id}`} className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
              <QRCodeSVG value={getCardUrl(card.id)} size={256} />
            </div>
            <button
              onClick={() => downloadQRCode(card.id)}
              className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              QR Kodu İndir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                card.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {card.isActive ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oluşturulma</label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm">
                {new Date(card.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>

          {card.username && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg font-mono">
                {card.username}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

