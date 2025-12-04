'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { qrmenuDb, QRMenu, QRMenuCard } from '@/lib/supabase-qrmenu';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { 
  Plus, Copy, Download, ExternalLink, CheckCircle, XCircle, 
  QrCode, Eye, Search, Folder, FileDown, Trash2, Edit, Store, Upload, X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import Toast from '../../components/Toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function AdminQRMenuPage() {
  const router = useRouter();
  const [qrmenus, setQRMenus] = useState<QRMenu[]>([]);
  const [selectedQRMenu, setSelectedQRMenu] = useState<QRMenu | null>(null);
  const [qrmenuCards, setQRMenuCards] = useState<QRMenuCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreatingCards, setIsCreatingCards] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'multiple' | 'group' | 'qrmenu'; id?: string; groupName?: string; qrmenuId?: string } | null>(null);
  
  // QR Menu oluşturma formu
  const [newQRMenu, setNewQRMenu] = useState({
    slug: '',
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    coverImageUrl: '',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
    totalCards: 0,
  });

  const loadQRMenus = useCallback(async () => {
    const allQRMenus = await qrmenuDb.getAll();
    setQRMenus(allQRMenus);
    
    // İstatistikleri hesapla
    setStats({
      total: allQRMenus.length,
      active: allQRMenus.filter(q => q.isActive).length,
      inactive: allQRMenus.filter(q => !q.isActive).length,
      totalViews: allQRMenus.reduce((sum, q) => sum + (q.viewCount || 0), 0),
      totalCards: 0, // Bu kartları yükledikten sonra güncellenecek
    });
  }, []);

  const loadQRMenuCards = useCallback(async (qrmenuId: string) => {
    const cards = await qrmenuDb.getCardsByQRMenuId(qrmenuId);
    setQRMenuCards(cards);
    
    // Grupları hesapla
    const groupMap = new Map<string, number>();
    cards.forEach(card => {
      if (card.groupName) {
        groupMap.set(card.groupName, (groupMap.get(card.groupName) || 0) + 1);
      }
    });
    
    // Stats'ı güncelle
    setStats(prev => ({
      ...prev,
      totalCards: cards.length,
    }));
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }

    const loadData = async () => {
      await loadQRMenus();
    };
    loadData();
  }, [router, loadQRMenus]);

  useEffect(() => {
    if (selectedQRMenu) {
      loadQRMenuCards(selectedQRMenu.id);
    }
  }, [selectedQRMenu, loadQRMenuCards]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const generateHash = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      const url = await uploadToCloudinary(file, 'qrmenu/logos');
      setNewQRMenu({ ...newQRMenu, logoUrl: url });
      showToast('Logo yüklendi!', 'success');
    } catch (error) {
      console.error('Logo upload error:', error);
      showToast('Logo yüklenemedi!', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      const url = await uploadToCloudinary(file, 'qrmenu/covers');
      setNewQRMenu({ ...newQRMenu, coverImageUrl: url });
      showToast('Kapak görseli yüklendi!', 'success');
    } catch (error) {
      console.error('Cover upload error:', error);
      showToast('Kapak görseli yüklenemedi!', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreateQRMenu = async () => {
    if (!newQRMenu.slug || !newQRMenu.name) {
      showToast('Slug ve isim zorunludur!', 'error');
      return;
    }

    // Slug kontrolü
    const isAvailable = await qrmenuDb.checkSlugAvailability(newQRMenu.slug);
    if (!isAvailable) {
      showToast('Bu slug zaten kullanılıyor!', 'error');
      return;
    }

    const qrmenu = await qrmenuDb.create({
      slug: newQRMenu.slug.toLowerCase().trim(),
      name: newQRMenu.name,
      description: newQRMenu.description || undefined,
      phone: newQRMenu.phone || undefined,
      email: newQRMenu.email || undefined,
      address: newQRMenu.address || undefined,
      logoUrl: newQRMenu.logoUrl || undefined,
      coverImageUrl: newQRMenu.coverImageUrl || undefined,
      isActive: true,
    });

    if (qrmenu) {
      showToast('QR Menu başarıyla oluşturuldu!', 'success');
      setIsCreateModalOpen(false);
      setNewQRMenu({ slug: '', name: '', description: '', phone: '', email: '', address: '', logoUrl: '', coverImageUrl: '' });
      await loadQRMenus();
      setSelectedQRMenu(qrmenu);
    } else {
      showToast('QR Menu oluşturulamadı!', 'error');
    }
  };

  const handleCreateCards = async () => {
    if (!selectedQRMenu) {
      showToast('Önce bir QR Menu seçin!', 'error');
      return;
    }

    setIsCreatingCards(true);
    setCreatingProgress({ current: 0, total: quantity });

    const createdCards = [];
    for (let i = 0; i < quantity; i++) {
      const hash = generateHash();
      const card = await qrmenuDb.createCard(
        selectedQRMenu.id,
        hash,
        groupName || undefined
      );
      if (card) {
        createdCards.push(card);
        setCreatingProgress({ current: i + 1, total: quantity });
      }
    }

    if (createdCards.length > 0) {
      setGroupName('');
      setQuantity(1);
      setIsCreateCardModalOpen(false);
      await loadQRMenuCards(selectedQRMenu.id);
      showToast(`${createdCards.length} adet kart başarıyla oluşturuldu!${groupName ? ` 📁 Grup: ${groupName}` : ''}`, 'success');
    } else {
      showToast('Kart oluşturulamadı!', 'error');
    }

    setIsCreatingCards(false);
    setCreatingProgress({ current: 0, total: 0 });
  };

  const getQRMenuUrl = (slug: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/qrmenu/${slug}`;
    }
    return '';
  };

  const getCardUrl = (hash: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/qrmenu/${selectedQRMenu?.slug}?card=${hash}`;
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

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.download = `qr-${hash}.svg`;
    downloadLink.href = url;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  const getGroupCards = (groupName: string) => {
    return qrmenuCards.filter(c => c.groupName === groupName);
  };

  const downloadGroupQRCodes = async (groupName: string) => {
    const groupCards = getGroupCards(groupName);
    if (groupCards.length === 0) {
      showToast('Bu grupta kart bulunamadı!', 'error');
      return;
    }

    showToast(`${groupCards.length} adet QR kod ZIP'e ekleniyor...`, 'info');

    const zip = new JSZip();
    for (const card of groupCards) {
      const svg = document.getElementById(`qr-${card.hash}`)?.querySelector('svg');
      if (!svg) continue;
      const svgData = new XMLSerializer().serializeToString(svg);
      zip.file(`${card.hash}.svg`, svgData);
    }

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

    const urls = groupCards.map(card => getCardUrl(card.hash)).join('\n');
    navigator.clipboard.writeText(urls);
    showToast(`${groupCards.length} adet URL kopyalandı!`, 'success');
  };

  const handleDeleteClick = (type: 'single' | 'multiple' | 'group' | 'qrmenu', id?: string, groupName?: string, qrmenuId?: string) => {
    setDeleteTarget({ type, id, groupName, qrmenuId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    let success = false;
    let message = '';

    if (deleteTarget.type === 'single' && deleteTarget.id) {
      success = await qrmenuDb.deleteCard(deleteTarget.id);
      message = success ? 'Kart silindi!' : 'Kart silinemedi!';
    } else if (deleteTarget.type === 'multiple') {
      const ids = Array.from(selectedCards);
      success = await qrmenuDb.deleteMultipleCards(ids);
      message = success ? `${ids.length} kart silindi!` : 'Kartlar silinemedi!';
      if (success) setSelectedCards(new Set());
    } else if (deleteTarget.type === 'group' && deleteTarget.groupName && selectedQRMenu) {
      const groupCards = getGroupCards(deleteTarget.groupName);
      success = await qrmenuDb.deleteGroup(selectedQRMenu.id, deleteTarget.groupName);
      message = success ? `"${deleteTarget.groupName}" grubu (${groupCards.length} kart) silindi!` : 'Grup silinemedi!';
      if (success) setSelectedGroup(null);
    } else if (deleteTarget.type === 'qrmenu' && deleteTarget.qrmenuId) {
      success = await qrmenuDb.delete(deleteTarget.qrmenuId);
      message = success ? 'QR Menu silindi!' : 'QR Menu silinemedi!';
      if (success && selectedQRMenu?.id === deleteTarget.qrmenuId) {
        setSelectedQRMenu(null);
        setQRMenuCards([]);
      }
    }

    showToast(message, success ? 'success' : 'error');
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);

    if (success) {
      await loadQRMenus();
      if (selectedQRMenu) {
        await loadQRMenuCards(selectedQRMenu.id);
      }
    }
  };

  const filteredQRMenus = qrmenus.filter(qrmenu => {
    const matchesSearch = 
      qrmenu.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qrmenu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qrmenu.email && qrmenu.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && qrmenu.isActive) ||
      (filterStatus === 'inactive' && !qrmenu.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const filteredCards = qrmenuCards.filter(card => {
    const matchesGroup = 
      selectedGroup === null || 
      card.groupName === selectedGroup;
    
    return matchesGroup;
  });

  const groups = Array.from(new Set(qrmenuCards.map(c => c.groupName).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <AdminSidebar activePage="qrmenu" />
      
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam QR Menu</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Store className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktif QR Menüler</p>
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
                  <p className="text-sm text-gray-600 mb-1">Pasif QR Menüler</p>
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Kart</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalCards}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <QrCode className="text-indigo-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* QR Menu List */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">QR Menüler</h2>
                <p className="text-sm text-gray-600">QR menüleri görüntüle ve yönet</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                QR Menu Oluştur
              </button>
            </div>

            {/* Filtre ve Arama */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Slug, isim veya email ile ara..."
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'inactive'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pasif
                </button>
              </div>
            </div>

            {/* QR Menu List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredQRMenus.map((qrmenu) => (
                <div
                  key={qrmenu.id}
                  onClick={() => setSelectedQRMenu(qrmenu)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedQRMenu?.id === qrmenu.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{qrmenu.name}</h3>
                        {qrmenu.isActive ? (
                          <CheckCircle className="text-green-600" size={16} />
                        ) : (
                          <XCircle className="text-orange-600" size={16} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">notouchness.com/qrmenu/{qrmenu.slug}</p>
                      {qrmenu.email && (
                        <p className="text-xs text-gray-500 mt-1">{qrmenu.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(getQRMenuUrl(qrmenu.slug));
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="URL'yi kopyala"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getQRMenuUrl(qrmenu.slug), '_blank');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Aç"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick('qrmenu', undefined, undefined, qrmenu.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredQRMenus.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  QR Menu bulunamadı
                </div>
              )}
            </div>
          </div>

          {/* Selected QR Menu Cards */}
          {selectedQRMenu && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedQRMenu.name} - Kartlar
                  </h2>
                  <p className="text-sm text-gray-600">
                    Bu QR Menu için kartlar oluşturun ve yönetin
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateCardModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Kart Oluştur
                </button>
              </div>

              {/* Group Tabs */}
              {groups.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                        selectedGroup === null
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <QrCode size={16} />
                      Tümü ({qrmenuCards.length})
                    </button>
                    {groups.map((group) => (
                      <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                          selectedGroup === group
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Folder size={16} />
                        {group} ({getGroupCards(group).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <QrCode size={16} className="text-gray-600" />
                        <span className="text-sm font-mono text-gray-600">{card.hash.substring(0, 12)}...</span>
                      </div>
                      {card.isActive ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <XCircle className="text-orange-600" size={16} />
                      )}
                    </div>
                    
                    <div id={`qr-${card.hash}`} className="flex justify-center mb-3 bg-white p-2 rounded">
                      <QRCodeSVG value={getCardUrl(card.hash)} size={120} />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(getCardUrl(card.hash))}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Copy size={14} />
                        Kopyala
                      </button>
                      <button
                        onClick={() => downloadQRCode(card.hash)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        İndir
                      </button>
                      <button
                        onClick={() => handleDeleteClick('single', card.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {card.groupName && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                        <Folder size={12} />
                        {card.groupName}
                      </div>
                    )}
                  </div>
                ))}
                {filteredCards.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Henüz kart oluşturulmamış
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create QR Menu Modal */}
          {isCreateModalOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsCreateModalOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni QR Menu Oluştur</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Slug (URL) *
                        </label>
                        <input
                          type="text"
                          value={newQRMenu.slug}
                          onChange={(e) => setNewQRMenu({ ...newQRMenu, slug: e.target.value })}
                          placeholder="walkerscaffe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          notouchness.com/qrmenu/{newQRMenu.slug || 'slug'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Restoran/Mekan Adı *
                        </label>
                        <input
                          type="text"
                          value={newQRMenu.name}
                          onChange={(e) => setNewQRMenu({ ...newQRMenu, name: e.target.value })}
                          placeholder="Walker's Cafe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={newQRMenu.description}
                          onChange={(e) => setNewQRMenu({ ...newQRMenu, description: e.target.value })}
                          placeholder="Restoran hakkında kısa açıklama..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Telefon
                          </label>
                          <input
                            type="text"
                            value={newQRMenu.phone}
                            onChange={(e) => setNewQRMenu({ ...newQRMenu, phone: e.target.value })}
                            placeholder="+90 555 123 4567"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={newQRMenu.email}
                            onChange={(e) => setNewQRMenu({ ...newQRMenu, email: e.target.value })}
                            placeholder="info@restoran.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Adres
                        </label>
                        <input
                          type="text"
                          value={newQRMenu.address}
                          onChange={(e) => setNewQRMenu({ ...newQRMenu, address: e.target.value })}
                          placeholder="İstanbul, Türkiye"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Logo
                        </label>
                        <div className="flex items-center gap-4">
                          {newQRMenu.logoUrl && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                              <img src={newQRMenu.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewQRMenu({ ...newQRMenu, logoUrl: '' })}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              uploadingLogo 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}>
                              <Upload size={16} />
                              <span>{uploadingLogo ? 'Yükleniyor...' : 'Logo Yükle'}</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                              }}
                              disabled={uploadingLogo}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG veya GIF. Max 2MB.
                        </p>
                      </div>

                      {/* Cover Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Kapak Görseli
                        </label>
                        <div className="flex items-center gap-4">
                          {newQRMenu.coverImageUrl && (
                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-300">
                              <img src={newQRMenu.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewQRMenu({ ...newQRMenu, coverImageUrl: '' })}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              uploadingCover 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}>
                              <Upload size={16} />
                              <span>{uploadingCover ? 'Yükleniyor...' : 'Kapak Yükle'}</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCoverUpload(file);
                              }}
                              disabled={uploadingCover}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG veya GIF. Max 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleCreateQRMenu}
                        className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Oluştur
                      </button>
                      <button
                        onClick={() => setIsCreateModalOpen(false)}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Create Card Modal */}
          {isCreateCardModalOpen && selectedQRMenu && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsCreateCardModalOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {selectedQRMenu.name} için Kart Oluştur
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Kart Sayısı *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Grup Adı (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          placeholder="Masa 1-10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Aynı grup adına sahip kartlar birlikte yönetilebilir
                        </p>
                      </div>

                      {isCreatingCards && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-900 mb-2">
                            {creatingProgress.current} / {creatingProgress.total} kart oluşturuluyor...
                          </p>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(creatingProgress.current / creatingProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleCreateCards}
                        disabled={isCreatingCards}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingCards ? 'Oluşturuluyor...' : 'Oluştur'}
                      </button>
                      <button
                        onClick={() => setIsCreateCardModalOpen(false)}
                        disabled={isCreatingCards}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setIsDeleteModalOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Emin misiniz?</h2>
                  <p className="text-gray-600 mb-6">
                    {deleteTarget?.type === 'qrmenu' 
                      ? 'Bu QR Menu ve tüm kartları silinecek. Bu işlem geri alınamaz!'
                      : deleteTarget?.type === 'group'
                      ? 'Bu grubun tüm kartları silinecek. Bu işlem geri alınamaz!'
                      : deleteTarget?.type === 'multiple'
                      ? `${selectedCards.size} kart silinecek. Bu işlem geri alınamaz!`
                      : 'Bu kart silinecek. Bu işlem geri alınamaz!'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Sil
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

