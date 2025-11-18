'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { Save, Eye, User, LogOut, Home, Palette, Sparkles } from 'lucide-react';

export default function AppearancePage() {
  const router = useRouter();
  const { currentCard, isOwner, updateCard } = useCard();

  type ThemeType = 'dark' | 'light' | 'gradient' | 'minimal' | 'lawyer' | 'ceo' | 'sales' | 'developer' | 'retail' | 'creative' | 'designer' | 'tech' | 'medical' | 'educator' | 'realestate' | 'marketing' | 'consultant' | 'artist' | 'fitness' | 'photographer' | 'writer' | 'chef' | 'ocean' | 'forest' | 'sunset' | 'neon' | 'royal' | 'mint' | 'lavender' | 'midnight';
  
  const [theme, setTheme] = useState<ThemeType>('sales');
  const [layoutStyle, setLayoutStyle] = useState<'icons-only' | 'icons-with-title' | 'full-description'>('icons-with-title');
  const [gridCols, setGridCols] = useState<number>(3);
  const [avatarPosition, setAvatarPosition] = useState<'top' | 'center' | 'above'>('above');

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hazır Temalar - Uyumlu Renk Paletleri (Her biri gerçekten farklı!)
  const presetThemes: Array<{
    id: ThemeType;
    name: string;
    description: string;
    backgroundColor: string;
    containerBackgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    accentColor: string;
    layoutStyle: 'icons-only' | 'icons-with-title' | 'full-description';
  }> = [
    {
      id: 'sales',
      name: 'Satış Danışmanı',
      description: 'Enerjik ve samimi tasarım',
      backgroundColor: '#dc2626',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#dc2626',
      secondaryColor: '#fef2f2',
      textColor: '#111827',
      accentColor: '#991b1b',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'lawyer',
      name: 'Avukat / Hukuk',
      description: 'Profesyonel ve güven veren',
      backgroundColor: '#1e3a8a',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#1e40af',
      secondaryColor: '#dbeafe',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      layoutStyle: 'full-description' as const,
    },
    {
      id: 'ceo',
      name: 'CEO / Yönetici',
      description: 'Lüks ve modern executive',
      backgroundColor: '#0f172a',
      containerBackgroundColor: '#fefce8',
      primaryColor: '#d4af37',
      secondaryColor: '#fef9c3',
      textColor: '#0f172a',
      accentColor: '#fde047',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'developer',
      name: 'Developer / Teknoloji',
      description: 'Minimal ve teknik',
      backgroundColor: '#0c4a6e',
      containerBackgroundColor: '#111827',
      primaryColor: '#06b6d4',
      secondaryColor: '#1e293b',
      textColor: '#ecfeff',
      accentColor: '#22d3ee',
      layoutStyle: 'icons-only' as const,
    },
    {
      id: 'retail',
      name: 'E-ticaret / Satış',
      description: 'Canlı ve dikkat çekici',
      backgroundColor: '#7c3aed',
      containerBackgroundColor: '#faf5ff',
      primaryColor: '#9333ea',
      secondaryColor: '#f3e8ff',
      textColor: '#581c87',
      accentColor: '#a855f7',
      layoutStyle: 'full-description' as const,
    },
    {
      id: 'creative',
      name: 'Kreatif / Sanatçı',
      description: 'Renkli ve yaratıcı',
      backgroundColor: '#ec4899',
      containerBackgroundColor: '#fff1f2',
      primaryColor: '#f472b6',
      secondaryColor: '#fce7f3',
      textColor: '#831843',
      accentColor: '#f9a8d4',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Sade ve şık',
      backgroundColor: '#f3f4f6',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#4b5563',
      secondaryColor: '#f9fafb',
      textColor: '#374151',
      accentColor: '#6b7280',
      layoutStyle: 'icons-only' as const,
    },
    {
      id: 'gradient',
      name: 'Gradient / Modern',
      description: 'Canlı gradient efektleri',
      backgroundColor: '#f97316',
      containerBackgroundColor: '#fff7ed',
      primaryColor: '#fb923c',
      secondaryColor: '#ffedd5',
      textColor: '#9a3412',
      accentColor: '#fdba74',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'dark',
      name: 'Koyu Tema',
      description: 'Karanlık ve modern',
      backgroundColor: '#111827',
      containerBackgroundColor: '#1f2937',
      primaryColor: '#60a5fa',
      secondaryColor: '#374151',
      textColor: '#e5e7eb',
      accentColor: '#93c5fd',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'light',
      name: 'Açık Tema',
      description: 'Temiz ve profesyonel',
      backgroundColor: '#e0e7ff',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#2563eb',
      secondaryColor: '#eef2ff',
      textColor: '#1e40af',
      accentColor: '#3b82f6',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'ocean',
      name: 'Okyanus',
      description: 'Sakin ve ferah',
      backgroundColor: '#06b6d4',
      containerBackgroundColor: '#cffafe',
      primaryColor: '#0891b2',
      secondaryColor: '#a5f3fc',
      textColor: '#155e75',
      accentColor: '#22d3ee',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'forest',
      name: 'Orman',
      description: 'Doğal ve sakin',
      backgroundColor: '#059669',
      containerBackgroundColor: '#d1fae5',
      primaryColor: '#047857',
      secondaryColor: '#a7f3d0',
      textColor: '#064e3b',
      accentColor: '#10b981',
      layoutStyle: 'full-description' as const,
    },
    {
      id: 'sunset',
      name: 'Gün Batımı',
      description: 'Sıcak ve samimi',
      backgroundColor: '#f59e0b',
      containerBackgroundColor: '#fef3c7',
      primaryColor: '#d97706',
      secondaryColor: '#fde68a',
      textColor: '#92400e',
      accentColor: '#fbbf24',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'Parlak ve dikkat çekici',
      backgroundColor: '#111827',
      containerBackgroundColor: '#065f46',
      primaryColor: '#10b981',
      secondaryColor: '#064e3b',
      textColor: '#6ee7b7',
      accentColor: '#34d399',
      layoutStyle: 'icons-only' as const,
    },
    {
      id: 'royal',
      name: 'Kraliyet',
      description: 'Zarif ve lüks',
      backgroundColor: '#7c2d12',
      containerBackgroundColor: '#fed7aa',
      primaryColor: '#92400e',
      secondaryColor: '#fdba74',
      textColor: '#78350f',
      accentColor: '#fb923c',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'mint',
      name: 'Nane',
      description: 'Taze ve canlı',
      backgroundColor: '#10b981',
      containerBackgroundColor: '#d1fae5',
      primaryColor: '#059669',
      secondaryColor: '#a7f3d0',
      textColor: '#064e3b',
      accentColor: '#34d399',
      layoutStyle: 'icons-with-title' as const,
    },
    {
      id: 'lavender',
      name: 'Lavanta',
      description: 'Sakin ve zarif',
      backgroundColor: '#a78bfa',
      containerBackgroundColor: '#f3e8ff',
      primaryColor: '#8b5cf6',
      secondaryColor: '#e9d5ff',
      textColor: '#6b21a8',
      accentColor: '#c084fc',
      layoutStyle: 'full-description' as const,
    },
    {
      id: 'midnight',
      name: 'Gece Yarısı',
      description: 'Koyu ve gizemli',
      backgroundColor: '#1e293b',
      containerBackgroundColor: '#334155',
      primaryColor: '#60a5fa',
      secondaryColor: '#475569',
      textColor: '#cbd5e1',
      accentColor: '#93c5fd',
      layoutStyle: 'icons-with-title' as const,
    }
  ];

  useEffect(() => {
    if (!isOwner || !currentCard) {
      router.push('/card/login');
      return;
    }
    
    // Initialize state from currentCard
    const initializeState = () => {
      setTheme((currentCard.theme || 'sales') as ThemeType);
      setLayoutStyle(currentCard.layoutStyle || 'icons-with-title');
      setGridCols(currentCard.gridCols || 3);
      setAvatarPosition(currentCard.avatarPosition || 'above');
    };
    
    initializeState();
  }, [currentCard, isOwner, router]);

  const applyPresetTheme = (preset: typeof presetThemes[0]) => {
    setTheme(preset.id as ThemeType);
    setLayoutStyle(preset.layoutStyle);
  };

  const getSelectedTheme = () => {
    return presetThemes.find(t => t.id === theme) || presetThemes[0];
  };

  const selectedTheme = getSelectedTheme();

  const handleSave = async () => {
    if (!currentCard) return;

    const success = await updateCard({
      ...currentCard,
      theme,
      layoutStyle,
      primaryColor: selectedTheme.primaryColor,
      secondaryColor: selectedTheme.secondaryColor,
      backgroundColor: selectedTheme.backgroundColor,
      containerBackgroundColor: selectedTheme.containerBackgroundColor,
      textColor: selectedTheme.textColor,
      gridCols,
      avatarPosition,
    });

    if (success) {
      alert('✅ Görünüm ayarları kaydedildi!');
    } else {
      alert('❌ Kaydetme başarısız!');
    }
  };

  if (!currentCard) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sol Sidebar */}
      <div className="w-60 bg-black text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Kart Ayarları</h1>
          <p className="text-gray-400 text-sm mt-1">{currentCard.username}</p>
        </div>
        
        <nav className="flex-1 px-3">
          <button
            onClick={() => router.push('/card/setup')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition mb-2"
          >
            <User size={20} />
            <span>Profil Düzenle</span>
          </button>
          
          <button
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black rounded-lg transition mb-2"
          >
            <Palette size={20} />
            <span>Görünüm & Tema</span>
          </button>
          
          <button
            onClick={() => router.push('/card/editor')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition mb-2"
          >
            <Sparkles size={20} />
            <span>Editor</span>
          </button>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => router.push(`/${currentCard.username}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Eye size={18} />
            Profili Görüntüle
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Home size={18} />
            Ana Sayfa
          </button>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Görünüm & Tema</h1>
            <p className="text-gray-600">Profilinin görünümünü özelleştir ve hazır temalardan seç</p>
          </div>

          {/* Hazır Temalar */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Tema Seçimi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presetThemes.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPresetTheme(preset)}
                  className={`p-0 rounded-xl border-2 transition overflow-hidden hover:shadow-lg ${
                    theme === preset.id
                      ? 'border-black shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Önizleme */}
                  <div className="relative h-32" style={{ backgroundColor: preset.backgroundColor }}>
                    <div 
                      className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-4"
                      style={{ backgroundColor: preset.containerBackgroundColor }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-10 h-10 rounded-full border-2"
                          style={{ 
                            backgroundColor: preset.backgroundColor,
                            borderColor: preset.containerBackgroundColor
                          }}
                        />
                        <div className="flex-1">
                          <div 
                            className="h-2 rounded mb-1"
                            style={{ backgroundColor: preset.textColor, opacity: 0.3 }}
                          />
                          <div 
                            className="h-2 rounded w-2/3"
                            style={{ backgroundColor: preset.textColor, opacity: 0.2 }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-8 rounded-lg border"
                            style={{ 
                              backgroundColor: preset.secondaryColor,
                              borderColor: preset.primaryColor + '40'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">{preset.name}</h3>
                    <p className="text-xs text-gray-600">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Düzeni */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Profil Düzeni</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setLayoutStyle('icons-only')}
                className={`p-5 rounded-lg border-2 transition text-center ${
                  layoutStyle === 'icons-only'
                    ? 'border-black bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-3">🔷</div>
                <h3 className="font-bold text-gray-900 mb-1">Sadece İkonlar</h3>
                <p className="text-xs text-gray-600">Minimalist görünüm</p>
              </button>

              <button
                onClick={() => setLayoutStyle('icons-with-title')}
                className={`p-5 rounded-lg border-2 transition text-center ${
                  layoutStyle === 'icons-with-title'
                    ? 'border-black bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-bold text-gray-900 mb-1">İkon + Başlık</h3>
                <p className="text-xs text-gray-600">Dengeli görünüm</p>
              </button>

              <button
                onClick={() => setLayoutStyle('full-description')}
                className={`p-5 rounded-lg border-2 transition text-center ${
                  layoutStyle === 'full-description'
                    ? 'border-black bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-bold text-gray-900 mb-1">Tam Açıklama</h3>
                <p className="text-xs text-gray-600">Detaylı görünüm</p>
              </button>
            </div>
          </div>

          {/* Seçili Tema Renk Paleti */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Seçili Tema Renk Paleti</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div 
                  className="w-full h-16 rounded-lg mb-2"
                  style={{ backgroundColor: selectedTheme.backgroundColor }}
                />
                <p className="text-xs font-medium text-gray-700 mb-1">Sayfa Arka Plan</p>
                <p className="text-xs text-gray-500 font-mono">{selectedTheme.backgroundColor}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div 
                  className="w-full h-16 rounded-lg mb-2 border-2 border-gray-300"
                  style={{ backgroundColor: selectedTheme.containerBackgroundColor }}
                />
                <p className="text-xs font-medium text-gray-700 mb-1">Container</p>
                <p className="text-xs text-gray-500 font-mono">{selectedTheme.containerBackgroundColor}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div 
                  className="w-full h-16 rounded-lg mb-2"
                  style={{ backgroundColor: selectedTheme.primaryColor }}
                />
                <p className="text-xs font-medium text-gray-700 mb-1">Ana Renk</p>
                <p className="text-xs text-gray-500 font-mono">{selectedTheme.primaryColor}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div 
                  className="w-full h-16 rounded-lg mb-2 border-2 border-gray-300"
                  style={{ backgroundColor: selectedTheme.textColor }}
                />
                <p className="text-xs font-medium text-gray-700 mb-1">Yazı Rengi</p>
                <p className="text-xs text-gray-500 font-mono">{selectedTheme.textColor}</p>
              </div>
            </div>
          </div>

          {/* Layout Ayarları */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Görünüm Ayarları</h2>
            
            <div className="space-y-6">
              {/* Grid Sütun Sayısı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  İkon Grid Sütun Sayısı
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`flex-1 p-4 rounded-lg border-2 transition text-center ${
                      gridCols === 3
                        ? 'border-black bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">3 Sütun</div>
                    <p className="text-xs text-gray-600">Mobil için ideal</p>
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`flex-1 p-4 rounded-lg border-2 transition text-center ${
                      gridCols === 4
                        ? 'border-black bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">4 Sütun</div>
                    <p className="text-xs text-gray-600">Desktop için ideal</p>
                  </button>
                </div>
              </div>

              {/* Profil Resmi Pozisyonu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profil Resmi Pozisyonu
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setAvatarPosition('top')}
                    className={`p-4 rounded-lg border-2 transition text-center ${
                      avatarPosition === 'top'
                        ? 'border-black bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">⬆️</div>
                    <p className="text-xs font-medium text-gray-900">Üst</p>
                  </button>
                  <button
                    onClick={() => setAvatarPosition('center')}
                    className={`p-4 rounded-lg border-2 transition text-center ${
                      avatarPosition === 'center'
                        ? 'border-black bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">⏹️</div>
                    <p className="text-xs font-medium text-gray-900">Ortada</p>
                  </button>
                  <button
                    onClick={() => setAvatarPosition('above')}
                    className={`p-4 rounded-lg border-2 transition text-center ${
                      avatarPosition === 'above'
                        ? 'border-black bg-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🔝</div>
                    <p className="text-xs font-medium text-gray-900">Üstte Taşan</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4">
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push(`/${currentCard.username}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Önizle
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                <Save size={20} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Çıkış Yap
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Çıkış yapmak istediğinize emin misiniz?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  router.push('/card/login');
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium text-white"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
