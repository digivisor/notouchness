'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Edit2, Upload, X, Store, Package, DollarSign, Eye, EyeOff } from 'lucide-react';

type Dealer = {
  id?: string;
  name: string;
  email: string;
  username: string;
  password_hash?: string;
  logo_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type SalesCard = {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  image_front: string;
};

type DealerCard = {
  id?: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  is_active: boolean;
  sales_card?: SalesCard;
};

type DealerPurchase = {
  id: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
  status: string;
  notes?: string | null;
  dealer: Dealer;
  sales_card: SalesCard;
};

const emptyDealer: Dealer = {
  name: '',
  email: '',
  username: '',
  logo_url: null,
  is_active: true,
};

export default function AdminDealersPage() {
  const router = useRouter();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [salesCards, setSalesCards] = useState<SalesCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealerCards, setDealerCards] = useState<DealerCard[]>([]);
  const [showDealerCardsModal, setShowDealerCardsModal] = useState(false);
  const [cardPrices, setCardPrices] = useState<Record<string, number>>({});
  const [dealerPurchases, setDealerPurchases] = useState<DealerPurchase[]>([]);

  const model = editing ?? emptyDealer;

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    loadDealers();
    loadSalesCards();
    loadDealerPurchases();
  }, [router]);

  const loadDealers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setDealers((data as Dealer[]) || []);
    }
    setLoading(false);
  };

  const loadSalesCards = async () => {
    const { data, error } = await supabase
      .from('sales_cards')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Sales cards fetch error:', error.message);
    } else {
      setSalesCards((data as SalesCard[]) || []);
    }
  };

  const loadDealerPurchases = async () => {
    const { data, error } = await supabase
      .from('dealer_purchases')
      .select(`
        *,
        dealer:dealers(name, email, username),
        sales_card:sales_cards(id, name, price, currency, category)
      `)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Dealer purchases fetch error:', error.message);
    } else {
      // Supabase'ten gelen veriyi güçlü tipe çevir
      const purchases = (data ?? []) as DealerPurchase[];
      setDealerPurchases(purchases);
    }
  };

  const loadDealerCards = async (dealerId: string) => {
    const { data, error } = await supabase
      .from('dealer_cards')
      .select(`
        *,
        sales_card:sales_cards(*)
      `)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Dealer cards fetch error:', error.message);
    } else {
      const cards = (data ?? []) as DealerCard[];
      setDealerCards(cards);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const signed = process.env.NEXT_PUBLIC_CLOUDINARY_SIGNED === 'true';
    
    if (!cloudName) {
      throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    }
    if (!uploadPreset && !signed) {
      throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const formData = new FormData();
    formData.append('file', file);

    if (signed) {
      // Signed upload - API endpoint kullan
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'dealers/logos', upload_preset: uploadPreset }),
      });
      
      if (!signRes.ok) {
        const t = await signRes.text();
        throw new Error(`Sign failed: ${t}`);
      }
      
      const { signature, timestamp, apiKey } = await signRes.json() as { 
        signature: string; 
        timestamp: number; 
        apiKey: string 
      };
      
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      if (uploadPreset) formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'dealers/logos');
    } else {
      // Unsigned upload
      if (uploadPreset) formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'dealers/logos');
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload failed: ${text}`);
    }

    const data = await response.json() as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error('Upload response missing secure_url');
    }
    
    return data.secure_url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadLogo(file);
      setField({ logo_url: url });
      setSuccess('Logo yüklendi!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logo yüklenirken hata oluştu';
      setError(message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const setField = (updates: Partial<Dealer>) => {
    if (editing) {
      setEditing({ ...editing, ...updates });
    } else {
      setEditing({ ...emptyDealer, ...updates });
    }
  };

  const handleSave = async () => {
    if (!model.name || !model.email || !model.username) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (!editing && !password) {
      setError('Yeni bayi için şifre gereklidir');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let passwordHash = model.password_hash;
      if (password && (!editing || password !== '****')) {
        // Şifreyi hash'le (basit hash - production'da daha güvenli olmalı)
        passwordHash = await hashPassword(password);
      }

      const dealerData: Omit<Dealer, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & {
        password_hash?: string;
      } = {
        name: model.name,
        email: model.email,
        username: model.username,
        logo_url: model.logo_url,
        is_active: model.is_active,
      };

      if (passwordHash) {
        dealerData.password_hash = passwordHash;
      }

      if (editing?.id) {
        const { error } = await supabase
          .from('dealers')
          .update(dealerData)
          .eq('id', editing.id);
        
        if (error) throw error;
        setSuccess('Bayi güncellendi!');
      } else {
        const { error } = await supabase
          .from('dealers')
          .insert(dealerData);
        
        if (error) throw error;
        setSuccess('Bayi eklendi!');
      }

      await loadDealers();
      setEditing(null);
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    // Basit hash - production'da bcryptjs kullanılmalı
    // Şimdilik basit bir hash kullanıyoruz
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" bayisini silmek istediğine emin misin? Bu işlem geri alınamaz.`)) return;

    const { error } = await supabase
      .from('dealers')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Bayi silindi!');
      await loadDealers();
    }
  };

  const handleEdit = (dealer: Dealer) => {
    setEditing(dealer);
    setPassword('****'); // Düzenleme modunda şifreyi gizle
    setShowPassword(false);
  };

  const handleManageCards = async (dealer: Dealer) => {
    setSelectedDealer(dealer);
    await loadDealerCards(dealer.id!);
    setShowDealerCardsModal(true);
  };

  const handleAddCardToDealer = async (salesCardId: string, price: number) => {
    if (!selectedDealer?.id) return;
    if (price <= 0) {
      setError('Lütfen geçerli bir fiyat girin');
      return;
    }

    const { error } = await supabase
      .from('dealer_cards')
      .insert({
        dealer_id: selectedDealer.id,
        sales_card_id: salesCardId,
        dealer_price: price,
        currency: 'TRY',
        is_active: true,
      });

    if (error) {
      if (error.code === '23505') {
        setError('Bu kart zaten bayide mevcut!');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Kart bayie eklendi!');
      setCardPrices({ ...cardPrices, [salesCardId]: 0 }); // Input'u temizle
      await loadDealerCards(selectedDealer.id);
    }
  };

  const handleUpdateDealerCardPrice = async (dealerCardId: string, price: number) => {
    const { error } = await supabase
      .from('dealer_cards')
      .update({ dealer_price: price })
      .eq('id', dealerCardId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Fiyat güncellendi!');
      if (selectedDealer?.id) {
        await loadDealerCards(selectedDealer.id);
      }
    }
  };

  const handleDeleteDealerCard = async (dealerCardId: string) => {
    if (!confirm('Bu kartı bayiden kaldırmak istediğine emin misin?')) return;

    const { error } = await supabase
      .from('dealer_cards')
      .delete()
      .eq('id', dealerCardId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Kart bayiden kaldırıldı!');
      if (selectedDealer?.id) {
        await loadDealerCards(selectedDealer.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePage="dealers" />
      
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Store size={32} />
              Bayiler
            </h1>
            <p className="text-gray-600">Bayileri yönetin ve bayilere kart ekleyin</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Bayi Ekleme/Düzenleme Formu */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? 'Bayi Düzenle' : 'Yeni Bayi Ekle'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bayi Adı *
                </label>
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => setField({ name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bayi adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={model.email}
                  onChange={(e) => setField({ email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı *
                </label>
                <input
                  type="text"
                  value={model.username}
                  onChange={(e) => setField({ username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="kullanici_adi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre {!editing && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder={editing ? 'Değiştirmek için yeni şifre girin' : 'Şifre'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {model.logo_url && (
                    <img
                      src={model.logo_url}
                      alt="Logo"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload size={20} />
                    <span>{model.logo_url ? 'Değiştir' : 'Logo Yükle'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={model.is_active}
                    onChange={(e) => setField({ is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || uploadingLogo}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setPassword('');
                    setShowPassword(false);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X size={20} />
                  İptal
                </button>
              )}
            </div>
          </div>

          {/* Bayiler Listesi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Bayiler Listesi</h2>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
            ) : dealers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Henüz bayi eklenmemiş</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bayi Adı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı Adı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dealers.map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {dealer.logo_url ? (
                            <img
                              src={dealer.logo_url}
                              alt={dealer.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Store size={24} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dealer.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dealer.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dealer.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            dealer.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {dealer.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleManageCards(dealer)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Kartları Yönet"
                            >
                              <Package size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(dealer)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="Düzenle"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(dealer.id!, dealer.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bayi Siparişleri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Bayi Siparişleri</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Bayilerin verdiği siparişleri görüntüleyin.
                </p>
              </div>
            </div>

            {dealerPurchases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Henüz bayi siparişi yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bayi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kart</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not / Adres</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dealerPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(p.purchase_date).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">{p.dealer.name}</div>
                          <div className="text-xs text-gray-500">{p.dealer.username}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">{p.sales_card.name}</div>
                          {p.sales_card.category && (
                            <div className="text-xs text-gray-500">{p.sales_card.category}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{p.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          {p.total_amount} {p.currency}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              p.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : p.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs break-words">
                          {p.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bayiye Kart Ekleme Modal */}
      {showDealerCardsModal && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedDealer.name} - Kart Yönetimi
              </h2>
              <button
                onClick={() => {
                  setShowDealerCardsModal(false);
                  setSelectedDealer(null);
                  setDealerCards([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Mevcut Kartlar */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Bayideki Kartlar</h3>
                {dealerCards.length === 0 ? (
                  <p className="text-gray-500">Henüz kart eklenmemiş</p>
                ) : (
                  <div className="space-y-3">
                    {dealerCards.map((dc) => (
                      <div
                        key={dc.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {dc.sales_card?.image_front && (
                          <img
                            src={dc.sales_card.image_front}
                            alt={dc.sales_card.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{dc.sales_card?.name}</h4>
                          <p className="text-sm text-gray-500">
                            Normal Fiyat: {dc.sales_card?.price} {dc.sales_card?.currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={dc.dealer_price}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              handleUpdateDealerCardPrice(dc.id!, newPrice);
                            }}
                            className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            placeholder="Fiyat"
                          />
                          <span className="text-sm text-gray-600">{dc.currency}</span>
                          <button
                            onClick={() => handleDeleteDealerCard(dc.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Yeni Kart Ekleme */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Yeni Kart Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesCards
                    .filter((card) => !dealerCards.some((dc) => dc.sales_card_id === card.id))
                    .map((card) => (
                      <div
                        key={card.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        {card.image_front && (
                          <img
                            src={card.image_front}
                            alt={card.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <h4 className="font-medium mb-1">{card.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">
                          {card.price} {card.currency}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Bayi Fiyatı"
                            value={cardPrices[card.id] || ''}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              setCardPrices({ ...cardPrices, [card.id]: price });
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const price = cardPrices[card.id] || 0;
                                if (price > 0) {
                                  handleAddCardToDealer(card.id, price);
                                }
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const price = cardPrices[card.id] || 0;
                              if (price > 0) {
                                handleAddCardToDealer(card.id, price);
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Ekle
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

