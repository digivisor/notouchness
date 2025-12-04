'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { qrmenuDb, QRMenu, QRMenuCategory, QRMenuItem, QRMenuOrder, QRMenuCard } from '@/lib/supabase-qrmenu';
import { 
  Plus, Edit, Trash2, Save, X, ShoppingBag, QrCode, 
  Package, Settings, Eye, Phone, Mail, MapPin, Upload, Image as ImageIcon,
  ExternalLink, Copy, CheckCircle2, Clock, DollarSign, Users
} from 'lucide-react';
import Toast from '@/app/components/Toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Image from 'next/image';

export default function QRMenuManagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [qrmenu, setQRMenu] = useState<QRMenu | null>(null);
  const [categories, setCategories] = useState<QRMenuCategory[]>([]);
  const [items, setItems] = useState<QRMenuItem[]>([]);
  const [orders, setOrders] = useState<QRMenuOrder[]>([]);
  const [cards, setCards] = useState<QRMenuCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'cards' | 'settings'>('menu');
  const [activeStep, setActiveStep] = useState<'general' | 'categories' | 'items' | 'colors'>('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<QRMenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<QRMenuItem | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', imageUrl: '' });
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    categoryId: '', 
    imageUrl: '' 
  });
  const [uploadingItemImage, setUploadingItemImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const menu = await qrmenuDb.getBySlug(slug);
        if (!menu) {
          router.push('/');
          return;
        }

        setQRMenu(menu);
        
        // Tüm verileri yükle (siparişler hariç)
        const [categoriesData, itemsData, cardsData] = await Promise.all([
          qrmenuDb.getCategoriesByQRMenuId(menu.id),
          qrmenuDb.getItemsByQRMenuId(menu.id),
          qrmenuDb.getCardsByQRMenuId(menu.id),
        ]);
        
        setCategories(categoriesData);
        setItems(itemsData);
        setCards(cardsData);
      } catch (error) {
        console.error('Error loading QR Menu:', error);
        setToast({ message: 'QR Menu yüklenemedi!', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug, router]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Category operations
  const handleCreateCategory = async () => {
    if (!qrmenu || !newCategory.name.trim()) {
      showToast('Kategori adı zorunludur!', 'error');
      return;
    }

    const category = await qrmenuDb.createCategory({
      qrmenuId: qrmenu.id,
      name: newCategory.name,
      description: newCategory.description || undefined,
      imageUrl: newCategory.imageUrl || undefined,
      displayOrder: categories.length,
      isActive: true,
    });

    if (category) {
      setCategories([...categories, category]);
      setNewCategory({ name: '', description: '', imageUrl: '' });
      setShowCategoryForm(false);
      showToast('Kategori oluşturuldu!', 'success');
    } else {
      showToast('Kategori oluşturulamadı!', 'error');
    }
  };

  const handleCategoryImageUpload = async (file: File) => {
    try {
      setUploadingCategoryImage(true);
      const url = await uploadToCloudinary(file, 'qrmenu/categories');
      setNewCategory({ ...newCategory, imageUrl: url });
      showToast('Kategori görseli yüklendi!', 'success');
    } catch (error) {
      console.error('Category image upload error:', error);
      showToast('Görsel yüklenemedi!', 'error');
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleUpdateCategoryImageUpload = async (file: File) => {
    if (!editingCategory) return;
    try {
      setUploadingCategoryImage(true);
      const url = await uploadToCloudinary(file, 'qrmenu/categories');
      setEditingCategory({ ...editingCategory, imageUrl: url });
      showToast('Kategori görseli yüklendi!', 'success');
    } catch (error) {
      console.error('Category image upload error:', error);
      showToast('Görsel yüklenemedi!', 'error');
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const updated = await qrmenuDb.updateCategory(editingCategory.id, editingCategory);
    if (updated) {
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      setEditingCategory(null);
      showToast('Kategori güncellendi!', 'success');
    } else {
      showToast('Kategori güncellenemedi!', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Kategoriye ait tüm öğeler de silinecek.')) {
      return;
    }

    const success = await qrmenuDb.deleteCategory(id);
    if (success) {
      setCategories(categories.filter(c => c.id !== id));
      setItems(items.filter(i => i.categoryId !== id));
      showToast('Kategori silindi!', 'success');
    } else {
      showToast('Kategori silinemedi!', 'error');
    }
  };

  // Item operations
  const handleItemImageUpload = async (file: File) => {
    try {
      setUploadingItemImage(true);
      const url = await uploadToCloudinary(file, 'qrmenu/items');
      setNewItem({ ...newItem, imageUrl: url });
      showToast('Görsel yüklendi!', 'success');
    } catch (error) {
      console.error('Item image upload error:', error);
      showToast('Görsel yüklenemedi!', 'error');
    } finally {
      setUploadingItemImage(false);
    }
  };

  const handleCreateItem = async () => {
    if (!qrmenu || !newItem.name.trim() || !newItem.price) {
      showToast('Ürün adı ve fiyat zorunludur!', 'error');
      return;
    }

    const item = await qrmenuDb.createItem({
      qrmenuId: qrmenu.id,
      name: newItem.name,
      description: newItem.description || undefined,
      price: parseFloat(newItem.price),
      categoryId: newItem.categoryId || undefined,
      imageUrl: newItem.imageUrl || undefined,
      displayOrder: items.length,
      isAvailable: true,
    });

    if (item) {
      setItems([...items, item]);
      setNewItem({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
      setShowItemForm(false);
      showToast('Ürün oluşturuldu!', 'success');
    } else {
      showToast('Ürün oluşturulamadı!', 'error');
    }
  };

  const handleUpdateItemImageUpload = async (file: File) => {
    if (!editingItem) return;
    try {
      setUploadingItemImage(true);
      const url = await uploadToCloudinary(file, 'qrmenu/items');
      setEditingItem({ ...editingItem, imageUrl: url });
      showToast('Görsel yüklendi!', 'success');
    } catch (error) {
      console.error('Item image upload error:', error);
      showToast('Görsel yüklenemedi!', 'error');
    } finally {
      setUploadingItemImage(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    const updated = await qrmenuDb.updateItem(editingItem.id, editingItem);
    if (updated) {
      setItems(items.map(i => i.id === updated.id ? updated : i));
      setEditingItem(null);
      showToast('Ürün güncellendi!', 'success');
    } else {
      showToast('Ürün güncellenemedi!', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      return;
    }

    const success = await qrmenuDb.deleteItem(id);
    if (success) {
      setItems(items.filter(i => i.id !== id));
      showToast('Ürün silindi!', 'success');
    } else {
      showToast('Ürün silinemedi!', 'error');
    }
  };

  const getQRMenuUrl = () => {
    if (typeof window !== 'undefined' && qrmenu) {
      return `${window.location.origin}/qrmenu/${qrmenu.slug}`;
    }
    return '';
  };

  const getCardUrl = (hash: string) => {
    if (typeof window !== 'undefined' && qrmenu) {
      return `${window.location.origin}/qrmenu/${qrmenu.slug}?card=${hash}`;
    }
    return '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Kopyalandı!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!qrmenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Menu bulunamadı</h1>
        </div>
      </div>
    );
  }

  const stats = {
    totalCategories: categories.length,
    totalItems: items.length,
    totalCards: cards.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {qrmenu.logoUrl && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image src={qrmenu.logoUrl} alt={qrmenu.name} width={48} height={48} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{qrmenu.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  <a href={getQRMenuUrl()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1">
                    {getQRMenuUrl()}
                    <ExternalLink size={12} />
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={() => window.open(getQRMenuUrl(), '_blank')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 font-medium"
            >
              <Eye size={18} />
              Menüyü Görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Sidebar + Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menü Yönetimi</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { key: 'menu', label: 'QR Menü', icon: ShoppingBag },
              { key: 'cards', label: 'Kartlar', icon: QrCode },
              { key: 'settings', label: 'Ayarlar', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left - Editing Panel */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kategoriler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ürünler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">QR Kartlar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <QrCode className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

              {/* Step Navigation */}
              {activeTab === 'menu' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    {[
                      { key: 'general', label: 'Genel Bilgiler', step: 1 },
                      { key: 'categories', label: 'Kategoriler', step: 2 },
                      { key: 'items', label: 'Ürünler', step: 3 },
                      { key: 'colors', label: 'Renkler', step: 4 },
                    ].map((step) => (
                      <div key={step.key} className="flex items-center flex-1">
                        <button
                          onClick={() => setActiveStep(step.key as any)}
                          className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                            activeStep === step.key
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-sm font-medium">{step.label}</span>
                        </button>
                        {step.step < 4 && (
                          <div className="w-2 h-2 mx-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                {/* Step 1: General Info */}
                {activeStep === 'general' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Genel Bilgiler</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Restoran/Mekan Adı</label>
                        <input
                          type="text"
                          value={qrmenu.name}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Açıklama</label>
                        <textarea
                          value={qrmenu.description || ''}
                          readOnly
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                          <input
                            type="text"
                            value={qrmenu.phone || ''}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={qrmenu.email || ''}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Adres</label>
                        <input
                          type="text"
                          value={qrmenu.address || ''}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Not:</strong> Bu bilgileri değiştirmek için admin panelinden iletişime geçin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Categories */}
                {activeStep === 'categories' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Kategoriler</h2>
                    <button
                      onClick={() => {
                        setShowCategoryForm(!showCategoryForm);
                        setNewCategory({ name: '', description: '', imageUrl: '' });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2 font-medium"
                    >
                      <Plus size={18} />
                      {showCategoryForm ? 'İptal' : 'Yeni Kategori'}
                    </button>
                  </div>

                  {/* New Category Form */}
                  {showCategoryForm && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Kategori adı *"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Açıklama (opsiyonel)"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                        {/* Category Image Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Kategori Görseli
                          </label>
                          <div className="flex items-center gap-4">
                            {newCategory.imageUrl && (
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                                <Image src={newCategory.imageUrl} alt="Preview" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setNewCategory({ ...newCategory, imageUrl: '' })}
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            <label className="cursor-pointer">
                              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                                uploadingCategoryImage 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                              }`}>
                                <Upload size={16} />
                                <span>{uploadingCategoryImage ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleCategoryImageUpload(file);
                                }}
                                disabled={uploadingCategoryImage}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleCreateCategory}
                        className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Kategori Oluştur
                      </button>
                    </div>
                  )}

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        {editingCategory?.id === category.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2">
                              {editingCategory.imageUrl && (
                                <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-300">
                                  <Image src={editingCategory.imageUrl} alt="Preview" fill className="object-cover" />
                                </div>
                              )}
                              <label className="cursor-pointer">
                                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                                  uploadingCategoryImage 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-gray-700 text-white hover:bg-gray-800'
                                }`}>
                                  <Upload size={14} />
                                  <span>{uploadingCategoryImage ? 'Yükleniyor...' : 'Görsel'}</span>
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpdateCategoryImageUpload(file);
                                  }}
                                  disabled={uploadingCategoryImage}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateCategory}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Save size={16} className="mx-auto" />
                              </button>
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-3 mb-2">
                              {category.imageUrl && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                  <Image src={category.imageUrl} alt={category.name} width={64} height={64} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                                {category.description && (
                                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {items.filter(i => i.categoryId === category.id).length} ürün
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingCategory(category)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <ShoppingBag className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500">Henüz kategori eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Step 3: Items */}
                {activeStep === 'items' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Menü Öğeleri</h2>
                    <button
                      onClick={() => {
                        setShowItemForm(!showItemForm);
                        setNewItem({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2 font-medium"
                    >
                      <Plus size={18} />
                      {showItemForm ? 'İptal' : 'Yeni Ürün'}
                    </button>
                  </div>

                  {/* New Item Form */}
                  {showItemForm && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Ürün adı *"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Fiyat (₺) *"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        />
                        <select
                          value={newItem.categoryId}
                          onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                          <option value="">Kategori seçin</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Açıklama (opsiyonel)"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          rows={2}
                          className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        />
                        {/* Image Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Ürün Görseli
                          </label>
                          <div className="flex items-center gap-4">
                            {newItem.imageUrl && (
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                                <Image src={newItem.imageUrl} alt="Preview" fill className="object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setNewItem({ ...newItem, imageUrl: '' })}
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                            <label className="cursor-pointer">
                              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                                uploadingItemImage 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                              }`}>
                                <Upload size={16} />
                                <span>{uploadingItemImage ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleItemImageUpload(file);
                                }}
                                disabled={uploadingItemImage}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleCreateItem}
                        className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Ürün Oluştur
                      </button>
                    </div>
                  )}

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
                      >
                        {item.imageUrl && (
                          <div className="relative w-full h-48 bg-gray-100">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            {!item.isAvailable && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">Stokta Yok</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          {editingItem?.id === item.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                {editingItem.imageUrl && (
                                  <div className="relative w-16 h-16 rounded overflow-hidden border border-gray-300">
                                    <Image src={editingItem.imageUrl} alt="Preview" fill className="object-cover" />
                                  </div>
                                )}
                                <label className="cursor-pointer">
                                  <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                                    uploadingItemImage 
                                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                                      : 'bg-gray-700 text-white hover:bg-gray-800'
                                  }`}>
                                    <Upload size={14} />
                                    <span>{uploadingItemImage ? 'Yükleniyor...' : 'Görsel'}</span>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUpdateItemImageUpload(file);
                                    }}
                                    disabled={uploadingItemImage}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={editingItem.price}
                                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                  onClick={handleUpdateItem}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                <span className="text-xl font-bold text-green-600">{item.price.toFixed(2)} ₺</span>
                                {categories.find(c => c.id === item.categoryId) && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {categories.find(c => c.id === item.categoryId)?.name}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <Package className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500">Henüz ürün eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Step 4: Colors */}
                {activeStep === 'colors' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Renk Ayarları</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Header Rengi</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={qrmenu.headerColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { headerColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrmenu.headerColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { headerColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Rengi</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={qrmenu.categoryColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { categoryColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrmenu.categoryColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { categoryColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ürün Fiyat Rengi</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={qrmenu.itemColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { itemColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrmenu.itemColor || qrmenu.primaryColor || '#dc2626'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { itemColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Arka Plan Rengi</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={qrmenu.secondaryColor || '#fef2f2'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { secondaryColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrmenu.secondaryColor || '#fef2f2'}
                            onChange={async (e) => {
                              const updated = await qrmenuDb.update(qrmenu.id, { secondaryColor: e.target.value });
                              if (updated) setQRMenu(updated);
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Siparişler</h2>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">Sipariş #{order.id.substring(0, 8)}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === 'completed' ? 'bg-green-100 text-green-700' :
                              order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {order.customerName && (
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {order.customerName}
                              </span>
                            )}
                            {order.customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone size={14} />
                                {order.customerPhone}
                              </span>
                            )}
                            {order.tableNumber && (
                              <span className="bg-gray-100 px-2 py-1 rounded">Masa {order.tableNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{order.total.toFixed(2)} ₺</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Package className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Henüz sipariş yok</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">QR Kartlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cards.map((card) => (
                    <div key={card.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <QrCode className="text-gray-400" size={20} />
                        {card.isActive ? (
                          <CheckCircle2 className="text-green-600" size={18} />
                        ) : (
                          <X className="text-red-600" size={18} />
                        )}
                      </div>
                      <div className="font-mono text-xs text-gray-600 mb-2 break-all">{card.hash}</div>
                      {card.groupName && (
                        <div className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded inline-block">
                          {card.groupName}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(getCardUrl(card.hash))}
                          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Copy size={12} />
                          Kopyala
                        </button>
                        <a
                          href={getCardUrl(card.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <QrCode className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Henüz kart oluşturulmamış</p>
                      <p className="text-sm text-gray-400 mt-1">Admin panelinden kart oluşturun</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ayarlar</h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Restoran/Mekan Adı</label>
                      <input
                        type="text"
                        value={qrmenu.name}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qrmenu.slug}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500"
                        />
                        <button
                          onClick={() => copyToClipboard(getQRMenuUrl())}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                      <input
                        type="text"
                        value={qrmenu.phone || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={qrmenu.email || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Adres</label>
                      <input
                        type="text"
                        value={qrmenu.address || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Not:</strong> Ayarları değiştirmek için admin panelinden iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Right - Live Preview */}
          {activeTab === 'menu' && (
            <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <h3 className="font-bold text-gray-900">Canlı Önizleme</h3>
                <p className="text-xs text-gray-500 mt-1">Değişikliklerinizi burada görün</p>
              </div>
              <div className="p-4">
                <div className="bg-gray-100 rounded-lg p-4" style={{ minHeight: '600px' }}>
                  <iframe
                    src={getQRMenuUrl()}
                    className="w-full h-[600px] border-0 rounded-lg bg-white"
                    title="QR Menu Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
