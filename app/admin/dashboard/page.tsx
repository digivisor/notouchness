'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCard, CardProfile } from '../../context/CardContext';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { 
  Plus, Copy, Download, ExternalLink, CheckCircle, XCircle, 
  CreditCard, Eye, Search, Folder, FileDown, Trash2, Edit
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import Toast from '../../components/Toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { createCardByAdmin, getAllCards, deleteCard, deleteMultipleCards, deleteGroup, loginToCard } = useCard();
  const [cards, setCards] = useState<CardProfile[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardProfile | null>(null);
  const [customHash, setCustomHash] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cardType, setCardType] = useState<'nfc' | 'comment'>('nfc');
  const [quantity, setQuantity] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<Array<{ name: string; count: number }>>([]);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isCreatingCards, setIsCreatingCards] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'multiple' | 'group'; id?: string; groupName?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
  });

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const allCards = await getAllCards();
      setCards(allCards);
      
      // Grupları hesapla
      const groupMap = new Map<string, number>();
      allCards.forEach(card => {
        if (card.groupName) {
          console.log('Grup bulundu:', card.groupName, 'Kart ID:', card.id);
          groupMap.set(card.groupName, (groupMap.get(card.groupName) || 0) + 1);
        }
      });
      const groupList = Array.from(groupMap.entries()).map(([name, count]) => ({ name, count }));
      console.log('Toplam grup sayısı:', groupList.length, 'Gruplar:', groupList);
      setGroups(groupList);
      
      // İstatistikleri hesapla
      setStats({
        total: allCards.length,
        active: allCards.filter(c => c.isActive).length,
        inactive: allCards.filter(c => !c.isActive).length,
        totalViews: allCards.reduce((sum, c) => sum + (c.viewCount || 0), 0),
      });
    } catch (error) {
      console.error('Kartlar yüklenirken hata oluştu:', error);
      setToast({ message: 'Kartlar yüklenirken bir hata oluştu!', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getAllCards]);

  useEffect(() => {
    // Admin session kontrolü
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // İlk yükleme
    loadCards();
    
    // 5 saniyede bir güncelle
    const interval = setInterval(() => {
      loadCards();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router, loadCards]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditCard = async (card: CardProfile) => {
    if (!card.isActive) {
      showToast('Sadece aktif kartlar düzenlenebilir!', 'error');
      return;
    }

    if (!card.ownerEmail || !card.hashedPassword) {
      showToast('Bu kart için giriş bilgileri bulunamadı!', 'error');
      return;
    }

    setIsEditing(card.id);
    
    try {
      const success = await loginToCard(card.ownerEmail, card.hashedPassword);
      if (success) {
        router.push('/card/setup');
      } else {
        showToast('Karta giriş yapılamadı!', 'error');
      }
    } catch (error) {
      console.error('Edit card error:', error);
      showToast('Bir hata oluştu!', 'error');
    } finally {
      setIsEditing(null);
    }
  };

  const handleCreateCard = async () => {
    if (cardType === 'comment') {
      showToast('Yorum kartı özelliği henüz aktif değil. Lütfen NFC kart seçin.', 'info');
      return;
    }

    setIsCreatingCards(true);
    setCreatingProgress({ current: 0, total: quantity });

    // NFC kart oluşturma
    const createdCards = [];
    for (let i = 0; i < quantity; i++) {
      // Tek kart ise custom hash kullan, birden fazla ise sadece ilkinde kullan
      const hashToUse = (i === 0 && quantity === 1) ? (customHash || undefined) : undefined;
      const newCard = await createCardByAdmin(hashToUse, groupName || undefined, cardType);
      if (newCard) {
        createdCards.push(newCard);
        setCreatingProgress({ current: i + 1, total: quantity });
      }
    }

    if (createdCards.length > 0) {
      setCustomHash('');
      setGroupName('');
      setQuantity(1);
      setIsCreateModalOpen(false);
      await loadCards();
      setSelectedCard(createdCards[0]);
      showToast(`${createdCards.length} adet kart başarıyla oluşturuldu!${groupName ? ` 📁 Grup: ${groupName}` : ''}`, 'success');
    } else {
      showToast('Kart oluşturulamadı!', 'error');
    }

    setIsCreatingCards(false);
    setCreatingProgress({ current: 0, total: 0 });
  };

  const getCardUrl = (hash: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/card/${hash}`;
    }
    return '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Kopyalandı!', 'success');
  };

  const downloadQRCode = (hash: string) => {
    const svg = document.getElementById(`qr-${hash}`)?.querySelector('svg');
    if (!svg) return;

    // SVG'yi string olarak al
    const svgData = new XMLSerializer().serializeToString(svg);
    
    // SVG'yi blob olarak indir
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.download = `qr-${hash}.svg`;
    downloadLink.href = url;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  // Grup bazlı işlemler
  const getGroupCards = (groupName: string) => {
    return cards.filter(c => c.groupName === groupName);
  };

  const downloadGroupQRCodes = async (groupName: string) => {
    const groupCards = getGroupCards(groupName);
    if (groupCards.length === 0) {
      showToast('Bu grupta kart bulunamadı!', 'error');
      return;
    }

    showToast(`${groupCards.length} adet QR kod ZIP'e ekleniyor...`, 'info');

    const zip = new JSZip();

    // Her QR'ı SVG olarak ZIP'e ekle
    for (const card of groupCards) {
      const svg = document.getElementById(`qr-${card.id}`)?.querySelector('svg');
      if (!svg) continue;

      // SVG'yi string olarak al
      const svgData = new XMLSerializer().serializeToString(svg);
      
      // SVG dosyasını ZIP'e ekle
      zip.file(`${card.username || card.id}.svg`, svgData);
    }

    // ZIP'i indir
    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groupName.replace(/\s+/g, '_')}_QR_Kodlari.zip`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast(`${groupCards.length} adet QR kod ZIP olarak indirildi!`, 'success');
  };

  const copyGroupURLs = (groupName: string) => {
    const groupCards = getGroupCards(groupName);
    if (groupCards.length === 0) {
      showToast('Bu grupta kart bulunamadı!', 'error');
      return;
    }

    const urls = groupCards.map(card => getCardUrl(card.id)).join('\n');
    navigator.clipboard.writeText(urls);
    showToast(`${groupCards.length} adet URL kopyalandı!`, 'success');
  };

  const exportGroupData = (groupName: string) => {
    const groupCards = getGroupCards(groupName);
    if (groupCards.length === 0) {
      showToast('Bu grupta kart bulunamadı!', 'error');
      return;
    }

    const data = groupCards.map(card => ({
      hash: card.id,
      url: getCardUrl(card.id),
      username: card.username || '',
      fullName: card.fullName || '',
      email: card.email || '',
      phone: card.phone || '',
      isActive: card.isActive,
      createdAt: card.createdAt,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groupName.replace(/\s+/g, '_')}_kartlar.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`${groupCards.length} kartlık veri dışa aktarıldı!`, 'success');
  };

  // Silme işlemleri
  const handleDeleteClick = (type: 'single' | 'multiple' | 'group', id?: string, groupName?: string) => {
    setDeleteTarget({ type, id, groupName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    let success = false;
    let message = '';

    if (deleteTarget.type === 'single' && deleteTarget.id) {
      success = await deleteCard(deleteTarget.id);
      message = success ? 'Kart silindi!' : 'Kart silinemedi!';
    } else if (deleteTarget.type === 'multiple') {
      const ids = Array.from(selectedCards);
      success = await deleteMultipleCards(ids);
      message = success ? `${ids.length} kart silindi!` : 'Kartlar silinemedi!';
      if (success) setSelectedCards(new Set());
    } else if (deleteTarget.type === 'group' && deleteTarget.groupName) {
      const groupCards = getGroupCards(deleteTarget.groupName);
      success = await deleteGroup(deleteTarget.groupName);
      message = success ? `"${deleteTarget.groupName}" grubu (${groupCards.length} kart) silindi!` : 'Grup silinemedi!';
      if (success) setSelectedGroup(null);
    }

    showToast(message, success ? 'success' : 'error');
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);

    if (success) {
      await loadCards();
      if (selectedCard && deleteTarget.type === 'single' && deleteTarget.id === selectedCard.id) {
        setSelectedCard(null);
      }
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const selectAllFiltered = () => {
    const newSelection = new Set(filteredCards.map(c => c.id));
    setSelectedCards(newSelection);
  };

  const deselectAll = () => {
    setSelectedCards(new Set());
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
    
    const matchesGroup = 
      selectedGroup === null || 
      card.groupName === selectedGroup;
    
    return matchesSearch && matchesFilter && matchesGroup;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCards = filteredCards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeCards = pagedCards.filter(c => c.isActive);
  const inactiveCards = pagedCards.filter(c => !c.isActive);

  // Reset page on filters/search/group changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, selectedGroup, groupSearchTerm, cards.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <AdminSidebar activePage="dashboard" />
      
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Kart</p>
                  {isLoading ? (
                    <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  )}
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
                  {isLoading ? (
                    <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  )}
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
                  {isLoading ? (
                    <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-orange-600">{stats.inactive}</p>
                  )}
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
                  {isLoading ? (
                    <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-600">{stats.totalViews}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Group Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Grup Filtreleme</h2>
                {selectedGroup && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadGroupQRCodes(selectedGroup)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                      title="Tüm QR kodlarını indir"
                    >
                      <Download size={16} />
                      QR&apos;ları İndir
                    </button>
                    <button
                      onClick={() => copyGroupURLs(selectedGroup)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                      title="Tüm URL'leri kopyala"
                    >
                      <Copy size={16} />
                      URL&apos;leri Kopyala
                    </button>
                    <button
                      onClick={() => exportGroupData(selectedGroup)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                      title="Grup verilerini dışa aktar"
                    >
                      <FileDown size={16} />
                      Verileri Dışa Aktar
                    </button>
                    <button
                      onClick={() => handleDeleteClick('group', undefined, selectedGroup)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                      title="Tüm grubu sil"
                    >
                      <Trash2 size={16} />
                      Grubu Sil
                    </button>
                  </div>
                )}
              </div>
              
              {/* Grup Arama */}
              {groups.length > 0 && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Grup adına göre ara..."
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pb-2">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedGroup === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CreditCard size={16} />
                  Tümü ({stats.total})
                </button>
                
                {groups
                  .filter((group) => {
                    if (groupSearchTerm.trim() === '') return true;
                    const parts = group.name.split('/');
                    const displayName = parts.length > 1 ? parts[parts.length - 1] : group.name;
                    const parentName = parts.length > 1 ? parts[0] : null;
                    return (
                      displayName.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
                      (parentName && parentName.toLowerCase().includes(groupSearchTerm.toLowerCase())) ||
                      group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
                    );
                  })
                  .map((group) => {
                  // B2B kartları için hiyerarşik yapı: "Bayi Adı/Bayi Adı - Tarih Saat"
                  const parts = group.name.split('/');
                  const displayName = parts.length > 1 ? parts[parts.length - 1] : group.name;
                  const parentName = parts.length > 1 ? parts[0] : null;
                  
                  return (
                    <button
                      key={group.name}
                      onClick={() => setSelectedGroup(group.name)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        selectedGroup === group.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={parentName ? `${parentName} > ${displayName}` : group.name}
                    >
                      <Folder size={16} className="flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{displayName}</span>
                      <span className="flex-shrink-0">({group.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Yeni Kart Oluştur - Button */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Kart Yönetimi</h2>
                <p className="text-sm text-gray-600">Yeni NFC veya Yorum kartı oluşturun</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Kart Oluştur
              </button>
            </div>
          </div>

          {/* Create Card Modal */}
          {isCreateModalOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsCreateModalOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Kart Oluştur</h2>
                    
                    {/* Kart Tipi Seçimi */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Kart Tipi *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setCardType('nfc')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            cardType === 'nfc' 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CreditCard size={32} />
                            <span className="font-semibold">NFC Kart</span>
                            <span className="text-xs opacity-75">Fiziksel kartvizit kartı</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setCardType('comment')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            cardType === 'comment' 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span className="font-semibold">Yorum Kartı</span>
                            <span className="text-xs opacity-75">Müşteri geri bildirimi</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Adet */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Kaç Adet Oluşturulacak? *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        placeholder="Örn: 50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maksimum 1000 adet</p>
                    </div>

                    {/* Grup İsmi */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Grup İsmi (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                        placeholder="Örn: Şirket Çalışanları 2025"
                      />
                      <p className="text-xs text-gray-500 mt-1">Toplu oluşturulan kartları gruplandırmak için</p>
                    </div>

                    {/* Özel Hash - Sadece tek kart için */}
                    {quantity === 1 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Özel Hash (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={customHash}
                          onChange={(e) => setCustomHash(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                          placeholder="Örn: abc123xyz"
                        />
                        <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa otomatik üretilir</p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setCardType('nfc');
                          setQuantity(1);
                          setGroupName('');
                          setCustomHash('');
                        }}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleCreateCard}
                        disabled={isCreatingCards}
                        className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingCards ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {creatingProgress.current}/{creatingProgress.total} Oluşturuluyor...
                          </span>
                        ) : (
                          quantity > 1 ? `${quantity} Kart Oluştur` : 'Kart Oluştur'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
              <h2 className="text-xl font-bold text-gray-900">
                Kartlar {isLoading ? '(Yükleniyor...)' : `(${filteredCards.length})`}
              </h2>
              <div className="flex gap-2">
                {selectedCards.size > 0 && (
                  <>
                    <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                      {selectedCards.size} seçili
                    </span>
                    <button
                      onClick={() => handleDeleteClick('multiple')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={16} />
                      Seçilenleri Sil
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Seçimi Kaldır
                    </button>
                  </>
                )}
                {selectedCards.size === 0 && filteredCards.length > 0 && (
                  <button
                    onClick={selectAllFiltered}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Tümünü Seç
                  </button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Kartlar yükleniyor...</p>
              </div>
            ) : filteredCards.length === 0 ? (
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
                          isChecked={selectedCards.has(card.id)}
                          onToggleCheck={() => toggleCardSelection(card.id)}
                          onDelete={() => handleDeleteClick('single', card.id)}
                          onEdit={() => handleEditCard(card)}
                          isEditing={isEditing === card.id}
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
                          isChecked={selectedCards.has(card.id)}
                          onToggleCheck={() => toggleCardSelection(card.id)}
                          onDelete={() => handleDeleteClick('single', card.id)}
                          onEdit={() => handleEditCard(card)}
                          isEditing={isEditing === card.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && filteredCards.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  Toplam {filteredCards.length} kart · Sayfa {currentPage}/{totalPages}
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
          </div>
        </main>
      </div>

      {/* Silme Onay Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {deleteTarget.type === 'group' ? 'Grubu Sil' : 
                     deleteTarget.type === 'multiple' ? 'Kartları Sil' : 'Kartı Sil'}
                  </h3>
                  <p className="text-sm text-gray-500">Bu işlem geri alınamaz!</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                {deleteTarget.type === 'group' && deleteTarget.groupName && 
                  `"${deleteTarget.groupName}" grubundaki tüm kartlar (${getGroupCards(deleteTarget.groupName).length} adet) silinecek. Emin misiniz?`}
                {deleteTarget.type === 'multiple' && 
                  `Seçilen ${selectedCards.size} adet kart silinecek. Emin misiniz?`}
                {deleteTarget.type === 'single' && 
                  'Bu kart kalıcı olarak silinecek. Emin misiniz?'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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

interface CardItemProps {
  card: CardProfile;
  getCardUrl: (hash: string) => string;
  copyToClipboard: (text: string) => void;
  downloadQRCode: (hash: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  isChecked: boolean;
  onToggleCheck: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  isEditing?: boolean;
}

function CardItem({ card, getCardUrl, copyToClipboard, downloadQRCode, isSelected, onSelect, isChecked, onToggleCheck, onDelete, onEdit, isEditing }: CardItemProps) {
  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCheck();
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1 cursor-pointer" onClick={onSelect}>
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
              {card.groupName && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded flex items-center gap-1">
                  <Folder size={12} />
                  {card.groupName}
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Kartı Sil"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex justify-center mb-3 p-2 bg-gray-50 rounded-lg" onClick={onSelect} style={{ cursor: 'pointer' }}>
        <div id={`qr-${card.id}`}>
          <QRCodeSVG value={getCardUrl(card.id)} size={100} bgColor="transparent" />
        </div>
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
        {card.isActive && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isEditing}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kartı Düzenle"
          >
            <Edit size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

interface CardDetailModalProps {
  card: CardProfile;
  getCardUrl: (hash: string) => string;
  copyToClipboard: (text: string) => void;
  downloadQRCode: (hash: string) => void;
  onClose: () => void;
}

function CardDetailModal({ card, getCardUrl, copyToClipboard, downloadQRCode, onClose }: CardDetailModalProps) {
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
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm text-gray-900"
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
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm text-gray-900"
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
              <QRCodeSVG value={getCardUrl(card.id)} size={256} bgColor="transparent" />
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
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">
                {new Date(card.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>

          {card.username && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg font-mono text-gray-900">
                {card.username}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

