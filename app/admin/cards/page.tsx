'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCard, CardProfile } from '../../context/CardContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { CreditCard, Search, Edit } from 'lucide-react';

export default function AdminCardsPage() {
  const router = useRouter();
  const { getAllCardsPaginated, loginToCard } = useCard();
  const [cards, setCards] = useState<CardProfile[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const result = await getAllCardsPaginated(currentPage, PAGE_SIZE, {
        searchTerm: searchTerm.trim() || undefined,
        filterStatus: filterStatus
      });
      setCards(result.cards);
      setTotalCards(result.total);
    } catch (error) {
      console.error('Kartlar yüklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAllCardsPaginated, searchTerm, filterStatus]);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // İlk yükleme
    loadCards(page);
  }, [router, loadCards, page]);

  // Pagination - server-side sayfalama
  const totalPages = Math.max(1, Math.ceil(totalCards / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  // Arama veya filtre değiştiğinde sayfa 1'e dön ve yeniden yükle
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  // Sayfa değiştiğinde veya arama/filtre değiştiğinde yükle
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) return;
    
    loadCards(page);
  }, [page, searchTerm, filterStatus, loadCards]);

  const handleEditCard = async (card: CardProfile) => {
    if (!card.isActive) {
      alert('Sadece aktif kartlar düzenlenebilir!');
      return;
    }

    if (!card.ownerEmail || !card.hashedPassword) {
      alert('Bu kart için giriş bilgileri bulunamadı!');
      return;
    }

    setIsEditing(card.id);
    
    try {
      const success = await loginToCard(card.ownerEmail, card.hashedPassword);
      if (success) {
        router.push('/card/setup');
      } else {
        alert('Karta giriş yapılamadı!');
      }
    } catch (error) {
      console.error('Edit card error:', error);
      alert('Bir hata oluştu!');
    } finally {
      setIsEditing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePage="cards" />
      
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kartlar</h1>
            <p className="text-gray-600">Tüm kartları görüntüle ve yönet</p>
          </div>

          {/* Filtre ve Arama */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-0">
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
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'inactive'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pasif
                </button>
              </div>
            </div>
          </div>

          {/* Kartlar Tablosu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görüntüleme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturulma</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Kartlar yükleniyor...</p>
                      </td>
                    </tr>
                  ) : cards.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">Kart bulunamadı</p>
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-gray-900 break-all">{card.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          {card.username ? (
                            <a href={`/${card.username}`} target="_blank" className="text-blue-600 hover:underline break-all">
                              @{card.username}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-[150px] truncate">
                          {card.fullName || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                          {card.email || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {card.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                              Pasif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {card.viewCount || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(card.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <a
                              href={`/card/${card.id}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Görüntüle
                            </a>
                            {card.isActive && (
                              <button
                                onClick={() => handleEditCard(card)}
                                disabled={isEditing === card.id}
                                className="flex items-center gap-1 text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Kartı Düzenle"
                              >
                                <Edit size={16} />
                                {isEditing === card.id ? 'Giriş yapılıyor...' : 'Düzenle'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {!isLoading && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? `Filtrelenmiş: ${totalCards} kart` 
                  : `Toplam ${totalCards} kart`} · Sayfa {currentPage}/{totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

