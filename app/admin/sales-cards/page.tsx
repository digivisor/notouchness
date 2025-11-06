"use client";

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Edit2, Upload, ImageOff, RefreshCcw } from 'lucide-react';

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
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="border rounded-lg p-3 flex items-center gap-3 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="w-20 h-14 object-cover rounded" />
          ) : (
            <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-400">
              <ImageOff size={18} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500">JPG, PNG. Max ~5MB</p>
            <div className="mt-2 flex gap-2">
              <label className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${loading ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}>
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
                  className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50"
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
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar activePage={activePage} />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Satış Kartları</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>
            )}

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kart Adı</label>
                  <input
                    value={model.name}
                    onChange={(e) => setField({ name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Örn: Notouchness Black Card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={model.price}
                      onChange={(e) => setField({ price: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Örn: 899"
                    />
                    <select
                      value={model.currency}
                      onChange={(e) => setField({ currency: e.target.value })}
                      className="w-28 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Önizleme: {pricePreview}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={model.category}
                    onChange={(e) => setField({ category: e.target.value as SalesCard['category'] })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="metal">Metal Kartlar</option>
                    <option value="wood">Ahşap Kartlar</option>
                    <option value="premium">Premium</option>
                    <option value="accessories">Aksesuarlar</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div className="xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiket (Badge)</label>
                  <input
                    value={model.badge || ''}
                    onChange={(e) => setField({ badge: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Örn: Premium, Lüks, Yeni"
                  />
                </div>
                <div className="xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={model.description || ''}
                    onChange={(e) => setField({ description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                  <input
                    type="number"
                    value={model.stock_count}
                    onChange={(e) => setField({ stock_count: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Özellikler</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Örn: NFC ve QR kod teknolojisi"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    />
                    <button onClick={addFeature} className="px-3 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2">
                      <Plus size={16} /> Ekle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(model.features || []).map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                        {f}
                        <button onClick={() => removeFeature(idx)} className="text-gray-500 hover:text-gray-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 sticky bottom-4">
                <button
                  onClick={upsertCard}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow"
                >
                  <Save size={16} /> {model.id ? 'Güncelle' : 'Kaydet'}
                </button>
                {model.id && (
                  <button
                    onClick={resetForm}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    İptal
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b font-semibold">Kayıtlı Kartlar</div>
              {loading ? (
                <div className="p-6 text-gray-500">Yükleniyor…</div>
              ) : list.length === 0 ? (
                <div className="p-6 text-gray-500">Henüz kayıt yok.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="p-3">Ön Resim</th>
                        <th className="p-3">Ad</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Fiyat</th>
                        <th className="p-3">Stok</th>
                        <th className="p-3">Durum</th>
                        <th className="p-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">
                            {item.image_front ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image_front} alt={item.name} className="w-16 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-10 bg-gray-100 rounded" />
                            )}
                          </td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">{item.currency === 'TRY' ? `₺${item.price}` : `${item.price} ${item.currency}`}</td>
                          <td className="p-3">{item.stock_count}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${item.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.in_stock ? 'Stokta' : 'Tükendi'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditing(item)}
                                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
                              >
                                <Edit2 size={14} /> Düzenle
                              </button>
                              <button
                                onClick={() => removeCard(item.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
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
