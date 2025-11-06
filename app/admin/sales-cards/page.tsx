"use client";

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Edit2, Upload, ImageOff, RefreshCcw, CreditCard } from 'lucide-react';

type SalesCard = {
  id?: string;
  name: string;
  price: number;
  currency?: string; // TRY, USD, etc
  category: 'metal' | 'wood' | 'premium' | 'accessories' | 'other';
  badge?: string | null;
  description?: string | null;
  features?: string[]; // array of feature strings
  image_front: string; // URL
  image_back?: string | null; // URL
  stock_count: number;
  in_stock: boolean;
  created_at?: string;
  updated_at?: string;
};

const emptyCard: SalesCard = {
  name: '',
  price: 0,
  currency: 'TRY',
  category: 'metal',
  badge: null,
  description: '',
  features: [],
  image_front: '',
  image_back: '',
  stock_count: 0,
  in_stock: true,
};

export default function AdminSalesCardsPage() {
  const [activePage] = useState('sales-cards');
  const [list, setList] = useState<SalesCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SalesCard | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const model = editing ?? emptyCard;

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('sales_cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setList((data as unknown as SalesCard[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadCards();
  }, []);

  // Cloudinary unsigned upload helper
  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const signed = process.env.NEXT_PUBLIC_CLOUDINARY_SIGNED === 'true';
    if (!cloudName) throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    if (!uploadPreset && !signed) throw new Error('Cloudinary env missing: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const form = new FormData();
    form.append('file', file);

    if (signed) {
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, upload_preset: uploadPreset }),
      });
      if (!signRes.ok) {
        const t = await signRes.text();
        throw new Error(`Sign failed: ${t}`);
      }
      const { signature, timestamp, apiKey } = await signRes.json() as { signature: string; timestamp: number; apiKey: string };
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('api_key', apiKey);
      if (uploadPreset) form.append('upload_preset', uploadPreset);
      if (folder) form.append('folder', folder);
    } else {
      // Unsigned upload
      if (uploadPreset) form.append('upload_preset', uploadPreset);
      if (folder) form.append('folder', folder);
    }

    const res = await fetch(url, { method: 'POST', body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }
    const json: { secure_url?: string } = await res.json();
    if (!json.secure_url) throw new Error('Upload response missing secure_url');
    return json.secure_url;
  };

  const onUploadFront = async (file: File) => {
    try {
      setUploadingFront(true);
      const url = await uploadToCloudinary(file, 'sales-cards/front');
      setField({ image_front: url });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setUploadingFront(false);
    }
  };

  const onUploadBack = async (file: File) => {
    try {
      setUploadingBack(true);
      const url = await uploadToCloudinary(file, 'sales-cards/back');
      setField({ image_back: url });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setUploadingBack(false);
    }
  };

  const ImageUploader = ({
    label,
    value,
    onChange,
    loading,
    placeholder,
  }: {
    label: string;
    value: string | null | undefined;
    onChange: (file: File) => void;
    loading: boolean;
    placeholder: string;
  }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-4 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
          ) : (
            <div className="w-24 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400">
              <ImageOff size={20} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-2">JPG, PNG. Max ~5MB</p>
            <div className="flex gap-2">
              <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                loading 
                  ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
                  : 'bg-white hover:bg-gray-50 cursor-pointer border-gray-300'
              }`}>
                <Upload size={16} /> {loading ? 'Yükleniyor…' : 'Görsel Yükle'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onChange(f);
                  }}
                  disabled={loading}
                />
              </label>
              {value && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => onChange(new File([], ''))}
                  title="Kaldır"
                >
                  <RefreshCcw size={16} /> Değiştir
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const resetForm = () => {
    setEditing(null);
    setFeatureInput('');
  };

  const upsertCard = async () => {
    setSaving(true);
    setError(null);

    type UpsertPayload = {
      name: string;
      price: number;
      currency: string;
      category: SalesCard['category'];
      badge: string | null;
      description: string | null;
      features: string[];
      image_front: string;
      image_back: string | null;
      stock_count: number;
      in_stock: boolean;
      updated_at: string;
      created_at?: string;
    };

    const payload: UpsertPayload = {
      name: model.name.trim(),
      price: Number(model.price) || 0,
      currency: model.currency || 'TRY',
      category: model.category,
      badge: model.badge || null,
      description: model.description || null,
      features: model.features || [],
      image_front: model.image_front.trim(),
      image_back: model.image_back?.trim() || null,
      stock_count: Number(model.stock_count) || 0,
      in_stock: Boolean(model.in_stock),
      updated_at: new Date().toISOString(),
    };

    let res;
    if (model.id) {
      res = await supabase
        .from('sales_cards')
        .update(payload)
        .eq('id', model.id)
        .select('*')
        .single();
    } else {
      res = await supabase
        .from('sales_cards')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('*')
        .single();
    }

    const { error: upsertError } = res as { data: SalesCard | null; error: { message: string } | null };
    if (upsertError) setError(upsertError.message);
    setSaving(false);

    if (!upsertError) {
      await loadCards();
      resetForm();
    }
  };

  const removeCard = async (id?: string) => {
    if (!id) return;
    if (!confirm('Bu kartı silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('sales_cards').delete().eq('id', id);
    if (error) setError(error.message);
    await loadCards();
  };

  const addFeature = () => {
    const text = featureInput.trim();
    if (!text) return;
    const next = { ...(editing ?? emptyCard), features: [...(model.features || []), text] };
    setEditing(next);
    setFeatureInput('');
  };
  const removeFeature = (idx: number) => {
    const next = { ...(editing ?? emptyCard), features: (model.features || []).filter((_, i) => i !== idx) };
    setEditing(next);
  };

  const setField = (patch: Partial<SalesCard>) => {
    setEditing({ ...(editing ?? emptyCard), ...patch });
  };

  const pricePreview = useMemo(() => {
    const p = Number(model.price) || 0;
    return model.currency === 'TRY' ? `₺${p}` : `${p} ${model.currency}`;
  }, [model.price, model.currency]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePage={activePage} />
      
      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Satış Kartları</h1>
              <p className="text-gray-600">Ürün kartlarını yönet ve düzenle</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
            )}

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kart Adı</label>
                  <input
                    value={model.name}
                    onChange={(e) => setField({ name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Örn: Notouchness Black Card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={model.price}
                      onChange={(e) => setField({ price: Number(e.target.value) })}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Örn: 899"
                    />
                    <select
                      value={model.currency}
                      onChange={(e) => setField({ currency: e.target.value })}
                      className="w-28 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5">Önizleme: <span className="font-semibold">{pricePreview}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={model.category}
                    onChange={(e) => setField({ category: e.target.value as SalesCard['category'] })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="metal">Metal Kartlar</option>
                    <option value="wood">Ahşap Kartlar</option>
                    <option value="premium">Premium</option>
                    <option value="accessories">Aksesuarlar</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div className="xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiket (Badge)</label>
                  <input
                    value={model.badge || ''}
                    onChange={(e) => setField({ badge: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Örn: Premium, Lüks, Yeni"
                  />
                </div>
                <div className="xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    value={model.description || ''}
                    onChange={(e) => setField({ description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows={3}
                    placeholder="Kısa ürün açıklaması"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Ön Resim"
                    value={model.image_front}
                    onChange={(file) => {
                      if (file.size === 0) { setField({ image_front: '' }); return; }
                      void onUploadFront(file);
                    }}
                    loading={uploadingFront}
                    placeholder="Ön yüz görselini yükle"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="Arka Resim"
                    value={model.image_back || ''}
                    onChange={(file) => {
                      if (file.size === 0) { setField({ image_back: '' }); return; }
                      void onUploadBack(file);
                    }}
                    loading={uploadingBack}
                    placeholder="Arka yüz görselini yükle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok Adedi</label>
                  <input
                    type="number"
                    value={model.stock_count}
                    onChange={(e) => setField({ stock_count: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Örn: 100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="in_stock"
                    type="checkbox"
                    checked={model.in_stock}
                    onChange={(e) => setField({ in_stock: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="in_stock" className="text-sm font-medium text-gray-700">Stokta</label>
                </div>
                {/* Features */}
                <div className="xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Özellikler</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Örn: NFC ve QR kod teknolojisi"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    />
                    <button 
                      onClick={addFeature} 
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Plus size={16} /> Ekle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(model.features || []).map((f, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm flex items-center gap-2 border border-blue-200">
                        {f}
                        <button 
                          onClick={() => removeFeature(idx)} 
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={upsertCard}
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <Save size={16} /> {saving ? 'Kaydediliyor...' : (model.id ? 'Güncelle' : 'Kaydet')}
                </button>
                {model.id && (
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    İptal
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Kayıtlı Kartlar</h2>
              </div>
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  Yükleniyor…
                </div>
              ) : list.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Henüz kayıt yok.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ön Resim</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {list.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {item.image_front ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image_front} alt={item.name} className="w-20 h-14 object-cover rounded-lg border border-gray-200" />
                            ) : (
                              <div className="w-20 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                <ImageOff className="text-gray-400" size={20} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.badge && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{item.badge}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {item.currency === 'TRY' ? `₺${item.price.toLocaleString()}` : `${item.price.toLocaleString()} ${item.currency}`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.stock_count}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.in_stock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.in_stock ? 'Stokta' : 'Tükendi'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditing(item)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                              >
                                <Edit2 size={14} /> Düzenle
                              </button>
                              <button
                                onClick={() => removeCard(item.id)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
                              >
                                <Trash2 size={14} /> Sil
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
          </div>
        </main>
      </div>
    </div>
  );
}
