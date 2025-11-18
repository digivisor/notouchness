'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { Save, Eye, User, LogOut, Home, Palette, Type, Image as ImageIcon, Sparkles, Layout, Grid, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { 
  Mail, Phone, Globe, MapPin,
  Instagram, Linkedin, Twitter, Facebook, Youtube,
  MessageCircle, Send, Github, Link2,
  Music, Video,
  type LucideIcon
} from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const { currentCard, isOwner, updateCard } = useCard();

  // Editor state
  const [editorSettings, setEditorSettings] = useState({
    // Renkler
    backgroundColor: '#ffffff',
    containerBackgroundColor: '#f9fafb',
    primaryColor: '#000000',
    secondaryColor: '#6b7280',
    textColor: '#111827',
    iconColor: '#000000',
    accentColor: '#3b82f6',
    
    // Yazı Stilleri
    fontFamily: 'Inter',
    headingFontSize: '2rem',
    bodyFontSize: '1rem',
    fontWeight: '400',
    headingWeight: '700',
    lineHeight: '1.5',
    letterSpacing: '0',
    
    // İkon Ayarları
    iconSize: '24',
    iconStyle: 'filled', // filled, outlined, rounded
    iconBackground: 'transparent', // transparent, circle, square, rounded
    
    // Layout
    layoutStyle: 'icons-with-title' as 'icons-only' | 'icons-with-title' | 'full-description',
    gridCols: 3,
    avatarPosition: 'above' as 'top' | 'center' | 'above' | 'cover-left' | 'cover-center' | 'cover-right',
    
    // Profil Fotoğrafı
    avatarShape: 'round' as 'round' | 'square' | 'rounded-square',
    avatarSize: '128', // px
    avatarBorderWidth: '4', // px
    avatarBorderColor: '#ffffff',
    
    // Kapak Resmi
    coverUrl: '',
    coverHeight: '200', // px
    
    // Container
    containerBorderRadius: '24', // px (rounded-3xl = 24px)
    containerShadow: '2xl', // none, sm, md, lg, xl, 2xl
    
    // İkon Spacing
    iconSpacing: '12', // px (gap)
    iconBorderRadius: '12', // px (rounded-xl = 12px)
    
    // Arka Plan
    backgroundType: 'solid', // solid, gradient, image
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundImage: '',
  });

  useEffect(() => {
    if (!isOwner || !currentCard) {
      router.push('/card/login');
      return;
    }
    
    // Initialize from currentCard
    if (currentCard) {
      setEditorSettings({
        backgroundColor: currentCard.backgroundColor || '#ffffff',
        containerBackgroundColor: currentCard.containerBackgroundColor || '#f9fafb',
        primaryColor: currentCard.primaryColor || '#000000',
        secondaryColor: currentCard.secondaryColor || '#6b7280',
        textColor: currentCard.textColor || '#111827',
        iconColor: (currentCard as any).iconColor || currentCard.textColor || '#000000',
        accentColor: (currentCard as any).accentColor || currentCard.accentColor || '#3b82f6',
        fontFamily: (currentCard as any).fontFamily || 'Inter',
        headingFontSize: (currentCard as any).headingFontSize || '2rem',
        bodyFontSize: (currentCard as any).bodyFontSize || '1rem',
        fontWeight: (currentCard as any).fontWeight || '400',
        headingWeight: (currentCard as any).headingWeight || '700',
        lineHeight: (currentCard as any).lineHeight || '1.5',
        letterSpacing: (currentCard as any).letterSpacing || '0',
        iconSize: (currentCard as any).iconSize || '24',
        iconStyle: (currentCard as any).iconStyle || 'filled',
        iconBackground: (currentCard as any).iconBackground || 'transparent',
        layoutStyle: currentCard.layoutStyle || 'icons-with-title',
        gridCols: currentCard.gridCols || 3,
        avatarPosition: currentCard.avatarPosition || 'above',
        avatarShape: (currentCard as any).avatarShape || 'round',
        avatarSize: (currentCard as any).avatarSize || '128',
        avatarBorderWidth: (currentCard as any).avatarBorderWidth || '4',
        avatarBorderColor: (currentCard as any).avatarBorderColor || '#ffffff',
        coverUrl: currentCard.coverUrl || '',
        coverHeight: (currentCard as any).coverHeight || '200',
        containerBorderRadius: (currentCard as any).containerBorderRadius || '24',
        containerShadow: (currentCard as any).containerShadow || '2xl',
        iconSpacing: (currentCard as any).iconSpacing || '12',
        iconBorderRadius: (currentCard as any).iconBorderRadius || '12',
        backgroundType: (currentCard as any).backgroundType || 'solid',
        backgroundGradient: (currentCard as any).backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: (currentCard as any).backgroundImage || '',
      });
    }
  }, [currentCard, isOwner, router]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingChange('coverUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setEditorSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!currentCard) return;

    const success = await updateCard({
      ...currentCard,
      ...editorSettings,
    });

    if (success) {
      alert('✅ Editor ayarları kaydedildi!');
    } else {
      alert('❌ Kaydetme başarısız!');
    }
  };

  if (!currentCard) return null;

  // Platform icon mapping (gerçek kart sayfasından)
  type IconType = LucideIcon;
  const getPlatformIcon = (platform: string): IconType => {
    const icons: Record<string, IconType> = {
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook,
      youtube: Youtube,
      whatsapp: MessageCircle,
      telegram: Send,
      github: Github,
      tiktok: Music,
      spotify: Music,
      twitch: Video,
      discord: MessageCircle,
    };
    return icons[platform.toLowerCase()] || Link2;
  };

  // Collect social links (gerçek kart sayfasından)
  const socialLinks: Array<{ platform: string; url: string; icon: IconType }> = [];
  
  const platforms = [
    { key: 'instagram', value: currentCard.instagram, urlPattern: (v: string) => `https://instagram.com/${v}` },
    { key: 'linkedin', value: currentCard.linkedin, urlPattern: (v: string) => `https://linkedin.com/in/${v}` },
    { key: 'twitter', value: currentCard.twitter, urlPattern: (v: string) => `https://twitter.com/${v}` },
    { key: 'facebook', value: currentCard.facebook, urlPattern: (v: string) => `https://facebook.com/${v}` },
    { key: 'youtube', value: currentCard.youtube, urlPattern: (v: string) => `https://youtube.com/${v}` },
    { key: 'github', value: currentCard.github, urlPattern: (v: string) => `https://github.com/${v}` },
    { key: 'tiktok', value: currentCard.tiktok, urlPattern: (v: string) => `https://tiktok.com/@${v}` },
    { key: 'whatsapp', value: currentCard.whatsapp, urlPattern: (v: string) => `https://wa.me/${v.replace(/\D/g, '')}` },
    { key: 'telegram', value: currentCard.telegram, urlPattern: (v: string) => `https://t.me/${v}` },
    { key: 'spotify', value: currentCard.spotify, urlPattern: (v: string) => v.startsWith('http') ? v : `https://open.spotify.com/user/${v}` },
    { key: 'twitch', value: currentCard.twitch, urlPattern: (v: string) => `https://twitch.tv/${v}` },
    { key: 'discord', value: currentCard.discord, urlPattern: (v: string) => v },
  ];

  platforms.forEach(p => {
    if (p.value && p.value.trim()) {
      socialLinks.push({
        platform: p.key,
        url: p.urlPattern(p.value),
        icon: getPlatformIcon(p.key)
      });
    }
  });

  // Add custom links
  if (Array.isArray(currentCard.customLinks)) {
    currentCard.customLinks.forEach((link) => {
      if (link.url && link.title) {
        socialLinks.push({
          platform: link.title,
          url: link.url,
          icon: Link2
        });
      }
    });
  }

  // Önizleme için stil objesi
  const bgColor = editorSettings.backgroundColor || editorSettings.primaryColor || '#dc2626';
  const containerBg = editorSettings.containerBackgroundColor || '#ffffff';
  const textColor = editorSettings.textColor || '#111827';
  const gridCols = editorSettings.gridCols || 3;
  const avatarPos = editorSettings.avatarPosition || 'above';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sol Sidebar */}
      <div className="w-60 bg-black text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Kart Ayarları</h1>
          <p className="text-gray-400 text-sm mt-1">{currentCard.username || currentCard.fullName}</p>
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
            onClick={() => router.push('/card/appearance')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition mb-2"
          >
            <Palette size={20} />
            <span>Görünüm & Tema</span>
          </button>
          
          <button
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black rounded-lg transition mb-2"
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
            onClick={() => router.push('/card/login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Orta - Editor Kontrolleri */}
      <div className="flex-1 bg-white border-r border-gray-200 overflow-y-auto max-w-2xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editor</h1>
          <p className="text-sm text-gray-600 mb-6">Kartının her detayını özelleştir</p>

          {/* Layout Ayarları */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layout size={18} />
              Düzen & Layout
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout Stili</label>
                <select
                  value={editorSettings.layoutStyle}
                  onChange={(e) => handleSettingChange('layoutStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="icons-only">Sadece İkonlar</option>
                  <option value="icons-with-title">İkon + Başlık</option>
                  <option value="full-description">Tam Açıklama</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grid Sütun Sayısı</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettingChange('gridCols', 3)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition ${
                      editorSettings.gridCols === 3
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    3 Sütun
                  </button>
                  <button
                    onClick={() => handleSettingChange('gridCols', 4)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition ${
                      editorSettings.gridCols === 4
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    4 Sütun
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profil Resmi Pozisyonu</label>
                <select
                  value={editorSettings.avatarPosition}
                  onChange={(e) => handleSettingChange('avatarPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="above">Üstte Taşan</option>
                  <option value="top">Üst</option>
                  <option value="center">Ortada</option>
                  {editorSettings.coverUrl && (
                    <>
                      <option value="cover-left">Kapak Altı - Sol</option>
                      <option value="cover-center">Kapak Altı - Orta</option>
                      <option value="cover-right">Kapak Altı - Sağ</option>
                    </>
                  )}
                </select>
                {editorSettings.coverUrl && (
                  <p className="text-xs text-gray-500 mt-1">
                    Kapak resmi varsa profil fotoğrafı kapak ile container arasında konumlanır
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Renkler */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette size={18} />
              Renkler
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Arka Plan</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.backgroundColor}
                    onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.backgroundColor}
                    onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Container Arka Plan</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.containerBackgroundColor}
                    onChange={(e) => handleSettingChange('containerBackgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.containerBackgroundColor}
                    onChange={(e) => handleSettingChange('containerBackgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ana Renk</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İkon Rengi</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.iconColor}
                    onChange={(e) => handleSettingChange('iconColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.iconColor}
                    onChange={(e) => handleSettingChange('iconColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yazı Rengi</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.textColor}
                    onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.textColor}
                    onChange={(e) => handleSettingChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Yazı Stilleri */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Type size={18} />
              Yazı Stilleri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Ailesi</label>
                <select
                  value={editorSettings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık Font Boyutu: {editorSettings.headingFontSize}
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={parseFloat(editorSettings.headingFontSize)}
                  onChange={(e) => handleSettingChange('headingFontSize', `${e.target.value}rem`)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metin Font Boyutu: {editorSettings.bodyFontSize}
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={parseFloat(editorSettings.bodyFontSize)}
                  onChange={(e) => handleSettingChange('bodyFontSize', `${e.target.value}rem`)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık Kalınlığı</label>
                <select
                  value={editorSettings.headingWeight}
                  onChange={(e) => handleSettingChange('headingWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="300">İnce (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Orta (500)</option>
                  <option value="600">Yarı Kalın (600)</option>
                  <option value="700">Kalın (700)</option>
                  <option value="800">Çok Kalın (800)</option>
                  <option value="900">En Kalın (900)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profil Fotoğrafı Ayarları */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} />
              Profil Fotoğrafı
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı Şekli</label>
                <select
                  value={editorSettings.avatarShape}
                  onChange={(e) => handleSettingChange('avatarShape', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="round">Yuvarlak</option>
                  <option value="square">Kare</option>
                  <option value="rounded-square">Yuvarlatılmış Kare</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profil Fotoğrafı Boyutu: {editorSettings.avatarSize}px
                </label>
                <input
                  type="range"
                  min="80"
                  max="200"
                  step="4"
                  value={editorSettings.avatarSize}
                  onChange={(e) => handleSettingChange('avatarSize', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Kalınlığı: {editorSettings.avatarBorderWidth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={editorSettings.avatarBorderWidth}
                  onChange={(e) => handleSettingChange('avatarBorderWidth', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Rengi</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editorSettings.avatarBorderColor}
                    onChange={(e) => handleSettingChange('avatarBorderColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editorSettings.avatarBorderColor}
                    onChange={(e) => handleSettingChange('avatarBorderColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kapak Resmi */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={18} />
              Kapak Resmi
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>
                {editorSettings.coverUrl ? (
                  <div className="relative">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-300 mb-2">
                      <Image
                        src={editorSettings.coverUrl}
                        alt="Cover"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingChange('coverUrl', '')}
                      className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      Kapak Resmini Kaldır
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Kapak Resmi Yükle</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {editorSettings.coverUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapak Resmi Yüksekliği: {editorSettings.coverHeight}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="20"
                    value={editorSettings.coverHeight}
                    onChange={(e) => handleSettingChange('coverHeight', e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Container Ayarları */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layout size={18} />
              Container Ayarları
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius: {editorSettings.containerBorderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="4"
                  value={editorSettings.containerBorderRadius}
                  onChange={(e) => handleSettingChange('containerBorderRadius', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gölge</label>
                <select
                  value={editorSettings.containerShadow}
                  onChange={(e) => handleSettingChange('containerShadow', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="none">Yok</option>
                  <option value="sm">Küçük</option>
                  <option value="md">Orta</option>
                  <option value="lg">Büyük</option>
                  <option value="xl">Çok Büyük</option>
                  <option value="2xl">En Büyük</option>
                </select>
              </div>
            </div>
          </div>

          {/* İkon Ayarları */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Grid size={18} />
              İkon Ayarları
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkon Boyutu: {editorSettings.iconSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  step="2"
                  value={editorSettings.iconSize}
                  onChange={(e) => handleSettingChange('iconSize', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkon Arası Boşluk: {editorSettings.iconSpacing}px
                </label>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={editorSettings.iconSpacing}
                  onChange={(e) => handleSettingChange('iconSpacing', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkon Border Radius: {editorSettings.iconBorderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={editorSettings.iconBorderRadius}
                  onChange={(e) => handleSettingChange('iconBorderRadius', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İkon Arka Plan</label>
                <select
                  value={editorSettings.iconBackground}
                  onChange={(e) => handleSettingChange('iconBackground', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="transparent">Şeffaf</option>
                  <option value="circle">Daire</option>
                  <option value="square">Kare</option>
                  <option value="rounded">Yuvarlatılmış</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-6 px-6">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              <Save size={18} />
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Sağ - Canlı Önizleme (Gerçek Kart Yapısı) */}
      <div className="w-[500px] bg-gray-100 sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
            <div className="sticky top-0 bg-gray-100 z-10 pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Canlı Önizleme</h2>
              <p className="text-sm text-gray-600 mt-1">Değişiklikleriniz anında görünür</p>
            </div>
            
            <div className="flex justify-center">
              <div 
                className="p-4 w-full max-w-md"
                style={{ backgroundColor: bgColor }}
              >
                <div className="relative w-full">
                {/* Avatar - Above position (taşan profil resmi) - kapak resmi varsa da çalışır */}
                {currentCard.profileImage && avatarPos === 'above' && (
                  <div className="flex justify-center mb-[-60px] relative z-10">
                    <div 
                      className="relative overflow-hidden shadow-xl"
                      style={{
                        width: `${editorSettings.avatarSize}px`,
                        height: `${editorSettings.avatarSize}px`,
                        borderRadius: editorSettings.avatarShape === 'round' ? '50%' :
                                     editorSettings.avatarShape === 'square' ? '0' :
                                     '16px',
                        border: `${editorSettings.avatarBorderWidth}px solid ${editorSettings.avatarBorderColor}`,
                      }}
                    >
                      <Image
                        src={currentCard.profileImage}
                        alt={currentCard.fullName || 'Profile'}
                        width={parseInt(editorSettings.avatarSize)}
                        height={parseInt(editorSettings.avatarSize)}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div 
                  className="w-full overflow-hidden"
                  style={{ 
                    backgroundColor: containerBg,
                    borderRadius: `${editorSettings.containerBorderRadius}px`,
                    boxShadow: editorSettings.containerShadow === 'none' ? 'none' :
                              editorSettings.containerShadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
                              editorSettings.containerShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' :
                              editorSettings.containerShadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' :
                              editorSettings.containerShadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' :
                              '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                  }}
                >
                  {/* Kapak Resmi */}
                  {editorSettings.coverUrl && (
                    <div 
                      className="w-full relative overflow-hidden"
                      style={{ height: `${editorSettings.coverHeight}px` }}
                    >
                      <Image
                        src={editorSettings.coverUrl}
                        alt="Cover"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Avatar Section - Kapak resmi varsa ve cover pozisyonları seçiliyse */}
                  {editorSettings.coverUrl && (avatarPos === 'cover-left' || avatarPos === 'cover-center' || avatarPos === 'cover-right') && currentCard.profileImage && (
                    <div 
                      className="relative px-6"
                      style={{ 
                        marginTop: `-${parseInt(editorSettings.avatarSize) / 2}px`,
                        marginBottom: `${parseInt(editorSettings.avatarSize) / 2}px`,
                      }}
                    >
                      <div 
                        className={`flex ${avatarPos === 'cover-left' ? 'justify-start' : avatarPos === 'cover-center' ? 'justify-center' : 'justify-end'}`}
                      >
                        <div 
                          className="relative overflow-hidden shadow-xl"
                          style={{
                            width: `${editorSettings.avatarSize}px`,
                            height: `${editorSettings.avatarSize}px`,
                            borderRadius: editorSettings.avatarShape === 'round' ? '50%' :
                                         editorSettings.avatarShape === 'square' ? '0' :
                                         '16px',
                            border: `${editorSettings.avatarBorderWidth}px solid ${editorSettings.avatarBorderColor}`,
                          }}
                        >
                          <Image
                            src={currentCard.profileImage}
                            alt={currentCard.fullName || 'Profile'}
                            width={parseInt(editorSettings.avatarSize)}
                            height={parseInt(editorSettings.avatarSize)}
                            unoptimized
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Avatar Section */}
                  <div className={`relative ${
                    editorSettings.coverUrl && (avatarPos === 'cover-left' || avatarPos === 'cover-center' || avatarPos === 'cover-right')
                      ? 'pt-0'
                      : avatarPos === 'above' 
                        ? (editorSettings.coverUrl ? 'pt-8' : 'pt-20') 
                        : avatarPos === 'top' 
                          ? 'pt-8' 
                          : 'py-12'
                  } px-6 text-center`}>
                    {/* Avatar - Top or Center position (kapak resmi yoksa veya cover pozisyonları değilse veya above değilse) */}
                    {currentCard.profileImage && avatarPos !== 'above' && !(editorSettings.coverUrl && (avatarPos === 'cover-left' || avatarPos === 'cover-center' || avatarPos === 'cover-right')) && (
                      <div className="mb-4 flex justify-center">
                        <div 
                          className="relative overflow-hidden shadow-lg"
                          style={{
                            width: `${editorSettings.avatarSize}px`,
                            height: `${editorSettings.avatarSize}px`,
                            borderRadius: editorSettings.avatarShape === 'round' ? '50%' :
                                         editorSettings.avatarShape === 'square' ? '0' :
                                         '16px',
                            border: `${editorSettings.avatarBorderWidth}px solid ${editorSettings.avatarBorderColor}`,
                          }}
                        >
                          <Image
                            src={currentCard.profileImage}
                            alt={currentCard.fullName || 'Profile'}
                            width={parseInt(editorSettings.avatarSize)}
                            height={parseInt(editorSettings.avatarSize)}
                            unoptimized
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                  
                  {/* User Info */}
                  <h1 
                    className="text-2xl font-bold mb-1"
                    style={{ 
                      color: textColor,
                      fontSize: editorSettings.headingFontSize,
                      fontWeight: editorSettings.headingWeight,
                      fontFamily: editorSettings.fontFamily,
                      lineHeight: editorSettings.lineHeight,
                      letterSpacing: `${editorSettings.letterSpacing}px`,
                    }}
                  >
                    {currentCard.fullName || 'Kullanıcı'}
                  </h1>
                  
                  {currentCard.username && (
                    <p 
                      className="text-sm opacity-60 mb-2"
                      style={{ 
                        color: textColor,
                        fontSize: editorSettings.bodyFontSize,
                        fontFamily: editorSettings.fontFamily,
                      }}
                    >
                      @{currentCard.username}
                    </p>
                  )}
                  
                  {currentCard.title && (
                    <p 
                      className="text-sm font-medium mb-1"
                      style={{ 
                        color: textColor,
                        fontSize: editorSettings.bodyFontSize,
                        fontFamily: editorSettings.fontFamily,
                      }}
                    >
                      {currentCard.title}{currentCard.company && ` - ${currentCard.company}`}
                    </p>
                  )}
                  
                  {currentCard.bio && (
                    <p 
                      className="text-sm opacity-75 mt-3 mb-4"
                      style={{ 
                        color: textColor,
                        fontSize: editorSettings.bodyFontSize,
                        fontFamily: editorSettings.fontFamily,
                        lineHeight: editorSettings.lineHeight,
                      }}
                    >
                      {currentCard.bio}
                    </p>
                  )}
                </div>
                </div>

                {/* Contact Info */}
                <div className="px-6 pb-4 space-y-3">
                  {currentCard.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                      <Phone size={18} style={{ color: textColor }} />
                      <div className="flex-1">
                        <p className="text-xs opacity-60" style={{ color: textColor }}>Telefon</p>
                        <p className="text-sm font-medium" style={{ color: textColor }}>{currentCard.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentCard.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                      <Mail size={18} style={{ color: textColor }} />
                      <div className="flex-1">
                        <p className="text-xs opacity-60" style={{ color: textColor }}>E-posta</p>
                        <p className="text-sm font-medium" style={{ color: textColor }}>{currentCard.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentCard.website && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                      <Globe size={18} style={{ color: textColor }} />
                      <div className="flex-1">
                        <p className="text-xs opacity-60" style={{ color: textColor }}>Website</p>
                        <p className="text-sm font-medium" style={{ color: textColor }}>{currentCard.website}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentCard.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                      <MapPin size={18} style={{ color: textColor }} />
                      <div className="flex-1">
                        <p className="text-xs opacity-60" style={{ color: textColor }}>Konum</p>
                        <p className="text-sm font-medium" style={{ color: textColor }}>{currentCard.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="px-6 pb-6">
                    <div 
                      className="grid"
                      style={{ 
                        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                        gap: `${editorSettings.iconSpacing}px`,
                      }}
                    >
                      {socialLinks.map((link, idx) => {
                        const Icon = link.icon;
                        const iconBgStyle = editorSettings.iconBackground === 'circle' ? 'rounded-full' :
                                          editorSettings.iconBackground === 'square' ? 'rounded-none' :
                                          editorSettings.iconBackground === 'rounded' ? '' :
                                          '';
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center justify-center gap-2 p-4 bg-black/5 hover:bg-black/10 transition-all ${
                              editorSettings.iconBackground !== 'transparent' ? iconBgStyle : ''
                            }`}
                            style={{
                              backgroundColor: editorSettings.iconBackground !== 'transparent' 
                                ? `${editorSettings.iconColor}15` 
                                : undefined,
                              borderRadius: editorSettings.iconBackground === 'rounded' 
                                ? `${editorSettings.iconBorderRadius}px`
                                : iconBgStyle === 'rounded-full' 
                                ? '50%'
                                : iconBgStyle === 'rounded-none'
                                ? '0'
                                : `${editorSettings.iconBorderRadius}px`,
                            }}
                          >
                            <Icon 
                              size={parseInt(editorSettings.iconSize)} 
                              style={{ color: editorSettings.iconColor || textColor }} 
                            />
                            {editorSettings.layoutStyle === 'icons-with-title' && (
                              <span 
                                className="text-xs font-medium capitalize"
                                style={{ 
                                  color: textColor,
                                  fontSize: editorSettings.bodyFontSize,
                                  fontFamily: editorSettings.fontFamily,
                                }}
                              >
                                {link.platform}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                  <p 
                    className="text-xs opacity-50"
                    style={{ 
                      color: textColor,
                      fontSize: editorSettings.bodyFontSize,
                      fontFamily: editorSettings.fontFamily,
                    }}
                  >
                    Powered by <span className="font-semibold">notouchness</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}