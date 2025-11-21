/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { Save, Eye, User, LogOut, Home, Palette, Type, Image as ImageIcon, Sparkles, Layout, Grid, Upload, X, Menu, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Toast from '../../components/Toast';
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
  const [activeTab, setActiveTab] = useState('layout');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

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
    fontFamily: 'Poppins',
    headingFontSize: '2rem',
    bodyFontSize: '1rem',
    buttonFontSize: '0.95rem',
    fontWeight: '400',
    headingWeight: '700',
    lineHeight: '1.5',
    letterSpacing: '0',

    // İkon Ayarları
    iconSize: '24',
    iconStyle: 'filled', // filled, outlined, rounded
    iconBackground: 'transparent', // transparent, circle, square, rounded

    // Layout
    layoutStyle: 'icons-with-title' as 'icons-only' | 'icons-with-title' | 'full-description' | 'full-width-buttons',
    gridCols: 3,
    avatarPosition: 'above' as 'top' | 'center' | 'above' | 'cover-left' | 'cover-center' | 'cover-right',

    // Profil Fotoğrafı
    avatarShape: 'round' as 'round' | 'square' | 'rounded-square',
    avatarSize: '128', // px
    avatarBorderWidth: '4', // px
    avatarBorderColor: '#ffffff',
    avatarVerticalOffset: '50', // % (0-100, avatarın ne kadarı yukarı taşacak)

    // Kapak Resmi
    coverUrl: '',
    coverHeight: '200', // px

    // Logo
    logoUrl: '',
    logoSize: '80', // px

    // Container
    containerBorderRadius: '24', // px (rounded-3xl = 24px)
    containerShadow: '2xl', // none, sm, md, lg, xl, 2xl

    // İkon Spacing
    iconSpacing: '12', // px (gap)
    iconBorderRadius: '12', // px (rounded-xl = 12px)
    
    // Tam Genişlik Buton Rengi
    buttonBackgroundColor: '#000000', // Tam genişlik butonlar için arka plan rengi
    buttonBorderRadius: '999', // px (rounded-full = 999px, tam genişlik butonlar için)

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
        fontFamily: (currentCard as any).fontFamily || 'Poppins',
        headingFontSize: (currentCard as any).headingFontSize || '2rem',
        bodyFontSize: (currentCard as any).bodyFontSize || '1rem',
        buttonFontSize: (currentCard as any).buttonFontSize || '0.95rem',
        buttonBorderRadius: (currentCard as any).buttonBorderRadius || '999',
        fontWeight: (currentCard as any).fontWeight || '400',
        headingWeight: (currentCard as any).headingWeight || '700',
        lineHeight: (currentCard as any).lineHeight || '1.5',
        letterSpacing: (currentCard as any).letterSpacing || '0',
        iconSize: (currentCard as any).iconSize || '24',
        iconStyle: (currentCard as any).iconStyle || 'filled',
        iconBackground: (currentCard as any).iconBackground || 'transparent',
        layoutStyle: currentCard?.layoutStyle || 'icons-with-title',
        gridCols: currentCard?.gridCols || 3,
        avatarPosition: currentCard?.avatarPosition || 'above',
        avatarShape: (currentCard as any).avatarShape || 'round',
        avatarSize: (currentCard as any).avatarSize || '128',
        avatarBorderWidth: (currentCard as any).avatarBorderWidth || '4',
        avatarBorderColor: (currentCard as any).avatarBorderColor || '#ffffff',
        avatarVerticalOffset: (currentCard as any).avatarVerticalOffset || '50',
        coverUrl: currentCard?.coverUrl || '',
        coverHeight: (currentCard as any).coverHeight || '200',
        logoUrl: (currentCard as any).logoUrl || '',
        logoSize: (currentCard as any).logoSize || '80',
        containerBorderRadius: (currentCard as any).containerBorderRadius || '24',
        containerShadow: (currentCard as any).containerShadow || '2xl',
        iconSpacing: (currentCard as any).iconSpacing || '12',
        iconBorderRadius: (currentCard as any).iconBorderRadius || '12',
        buttonBackgroundColor: (currentCard as any).buttonBackgroundColor || '#000000',
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingChange('logoUrl', reader.result as string);
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
      setToast({ message: 'Değişiklikler başarıyla kaydedildi!', type: 'success' });
    } else {
      setToast({ message: 'Kaydetme işlemi başarısız oldu.', type: 'error' });
    }
  };

  if (!currentCard) return null;

  // TypeScript için currentCard'ın null olmadığını garanti et
  const card = currentCard;

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
    { key: 'instagram', value: card.instagram, urlPattern: (v: string) => `https://instagram.com/${v}` },
    { key: 'linkedin', value: card.linkedin, urlPattern: (v: string) => `https://linkedin.com/in/${v}` },
    { key: 'twitter', value: card.twitter, urlPattern: (v: string) => `https://twitter.com/${v}` },
    { key: 'facebook', value: card.facebook, urlPattern: (v: string) => `https://facebook.com/${v}` },
    { key: 'youtube', value: card.youtube, urlPattern: (v: string) => `https://youtube.com/${v}` },
    { key: 'github', value: card.github, urlPattern: (v: string) => `https://github.com/${v}` },
    { key: 'tiktok', value: card.tiktok, urlPattern: (v: string) => `https://tiktok.com/@${v}` },
    { key: 'whatsapp', value: card.whatsapp, urlPattern: (v: string) => `https://wa.me/${v.replace(/\D/g, '')}` },
    { key: 'telegram', value: card.telegram, urlPattern: (v: string) => `https://t.me/${v}` },
    { key: 'spotify', value: card.spotify, urlPattern: (v: string) => v.startsWith('http') ? v : `https://open.spotify.com/user/${v}` },
    { key: 'twitch', value: card.twitch, urlPattern: (v: string) => `https://twitch.tv/${v}` },
    { key: 'discord', value: card.discord, urlPattern: (v: string) => v },
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
  if (Array.isArray(card.customLinks)) {
    card.customLinks.forEach((link) => {
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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sol Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-60 bg-black text-white flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close Button - Mobile Only */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <h1 className="text-2xl font-bold">Kart Ayarları</h1>
          <p className="text-gray-400 text-sm mt-1">{card.username || card.fullName}</p>
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
            onClick={() => router.push(`/${card.username}`)}
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

      {/* Sağ Taraf - Tab Navigation + Editor + Önizleme */}
      <div className="flex flex-col flex-1 lg:ml-0">
        {/* Tab Navigation - Header (Sidebar'ın yanında) */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            {/* Sol Sidebar Toggle - Mobile */}
            <div className="lg:hidden p-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide relative px-4 lg:px-6">
              {/* Scroll indicator - Left */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 hidden lg:block" />
              {/* Scroll indicator - Right */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 hidden lg:block" />
              <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('layout')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'layout'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Layout size={14} className="inline mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Düzen & Layout</span>
                <span className="sm:hidden">Düzen</span>
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'colors'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Palette size={14} className="inline mr-1 lg:mr-2" />
                Renkler
              </button>
              <button
                onClick={() => setActiveTab('typography')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'typography'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Type size={14} className="inline mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Yazı Stilleri</span>
                <span className="sm:hidden">Yazı</span>
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'avatar'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <User size={14} className="inline mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Profil Fotoğrafı</span>
                <span className="sm:hidden">Profil</span>
              </button>
              <button
                onClick={() => setActiveTab('cover')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'cover'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ImageIcon size={14} className="inline mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Kapak Resmi</span>
                <span className="sm:hidden">Kapak</span>
              </button>
              <button
                onClick={() => setActiveTab('container')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'container'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Layout size={14} className="inline mr-1 lg:mr-2" />
                Container
              </button>
              <button
                onClick={() => setActiveTab('icons')}
                className={`px-3 lg:px-4 py-3 text-xs lg:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === 'icons'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Grid size={14} className="inline mr-1 lg:mr-2" />
                İkonlar
              </button>
              </div>
              
              {/* Kaydet Butonu */}
              <div className="ml-auto flex items-center flex-shrink-0 pr-2 lg:pr-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-black text-white px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor + Önizleme */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Orta - Editor Kontrolleri */}
          <div className="flex-1 bg-white border-r border-gray-200 overflow-y-auto flex flex-col lg:mr-[650px]">
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {/* Layout Ayarları */}
              {activeTab === 'layout' && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Layout size={18} />
                    Düzen & Layout
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Layout Stili</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Sadece İkonlar */}
                        <button
                          onClick={() => handleSettingChange('layoutStyle', 'icons-only')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.layoutStyle === 'icons-only'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-center gap-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                            </div>
                            <div className="flex justify-center gap-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Sadece İkonlar</p>
                          {editorSettings.layoutStyle === 'icons-only' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* İkon + Başlık */}
                        <button
                          onClick={() => handleSettingChange('layoutStyle', 'icons-with-title')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.layoutStyle === 'icons-with-title'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-center gap-2">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                <div className="w-12 h-2 bg-gray-200 rounded"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                <div className="w-12 h-2 bg-gray-200 rounded"></div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                <div className="w-12 h-2 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">İkon + Başlık</p>
                          {editorSettings.layoutStyle === 'icons-with-title' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* Tam Açıklama */}
                        <button
                          onClick={() => handleSettingChange('layoutStyle', 'full-description')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.layoutStyle === 'full-description'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                              <div className="w-6 h-6 bg-gray-300 rounded flex-shrink-0"></div>
                              <div className="flex-1 space-y-1">
                                <div className="w-full h-2 bg-gray-200 rounded"></div>
                                <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                              <div className="w-6 h-6 bg-gray-300 rounded flex-shrink-0"></div>
                              <div className="flex-1 space-y-1">
                                <div className="w-full h-2 bg-gray-200 rounded"></div>
                                <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Tam Açıklama</p>
                          {editorSettings.layoutStyle === 'full-description' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* Tam Genişlik Butonlar */}
                        <button
                          onClick={() => handleSettingChange('layoutStyle', 'full-width-buttons')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.layoutStyle === 'full-width-buttons'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="w-full h-10 bg-gray-800 rounded-full flex items-center gap-2 px-3">
                              <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                              <div className="flex-1 h-2 bg-gray-600 rounded"></div>
                              <div className="w-4 h-4 bg-gray-400 rounded"></div>
                            </div>
                            <div className="w-full h-10 bg-gray-800 rounded-full flex items-center gap-2 px-3">
                              <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                              <div className="flex-1 h-2 bg-gray-600 rounded"></div>
                              <div className="w-4 h-4 bg-gray-400 rounded"></div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Tam Genişlik Butonlar</p>
                          {editorSettings.layoutStyle === 'full-width-buttons' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Grid Sütun Sayısı</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* 3 Sütun */}
                        <button
                          onClick={() => handleSettingChange('gridCols', 3)}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.gridCols === 3
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-center gap-1.5 mb-2">
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex justify-center gap-1.5">
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded"></div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">3 Sütun</p>
                          {editorSettings.gridCols === 3 && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* 4 Sütun */}
                        <button
                          onClick={() => handleSettingChange('gridCols', 4)}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.gridCols === 4
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-center gap-1 mb-2">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex justify-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">4 Sütun</p>
                          {editorSettings.gridCols === 4 && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Profil Resmi Pozisyonu</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Üstte Taşan */}
                        <button
                          onClick={() => handleSettingChange('avatarPosition', 'above')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.avatarPosition === 'above'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="relative h-20 bg-gray-100 rounded">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-400 rounded-full border-2 border-white"></div>
                            <div className="pt-6 px-2">
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Üstte Taşan</p>
                          {editorSettings.avatarPosition === 'above' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* Üst */}
                        <button
                          onClick={() => handleSettingChange('avatarPosition', 'top')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.avatarPosition === 'top'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="relative h-20 bg-gray-100 rounded">
                            <div className="pt-2 flex justify-center">
                              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="px-2 mt-2">
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Üst</p>
                          {editorSettings.avatarPosition === 'top' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* Ortada */}
                        <button
                          onClick={() => handleSettingChange('avatarPosition', 'center')}
                          className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            editorSettings.avatarPosition === 'center'
                              ? 'border-black bg-black/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="relative h-20 bg-gray-100 rounded flex flex-col items-center justify-center">
                            <div className="w-8 h-8 bg-gray-400 rounded-full mb-2"></div>
                            <div className="w-full px-2">
                              <div className="h-2 bg-gray-200 rounded mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-center mt-2 text-gray-700">Ortada</p>
                          {editorSettings.avatarPosition === 'center' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>

                        {/* Kapak Altı - Sol (sadece kapak varsa göster) */}
                        {editorSettings.coverUrl && (
                          <button
                            onClick={() => handleSettingChange('avatarPosition', 'cover-left')}
                            className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                              editorSettings.avatarPosition === 'cover-left'
                                ? 'border-black bg-black/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="relative h-20 bg-gray-100 rounded">
                              <div className="h-8 bg-gray-300 rounded-t"></div>
                              <div className="relative px-2 pt-2">
                                <div className="absolute -top-4 left-2 w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
                                <div className="pt-2">
                                  <div className="h-2 bg-gray-200 rounded mb-1 ml-8"></div>
                                  <div className="h-2 bg-gray-200 rounded w-2/3 ml-8"></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-center mt-2 text-gray-700">Kapak Altı - Sol</p>
                            {editorSettings.avatarPosition === 'cover-left' && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        )}

                        {/* Kapak Altı - Orta (sadece kapak varsa göster) */}
                        {editorSettings.coverUrl && (
                          <button
                            onClick={() => handleSettingChange('avatarPosition', 'cover-center')}
                            className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                              editorSettings.avatarPosition === 'cover-center'
                                ? 'border-black bg-black/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="relative h-20 bg-gray-100 rounded">
                              <div className="h-8 bg-gray-300 rounded-t"></div>
                              <div className="relative pt-2">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
                                <div className="pt-2 px-2">
                                  <div className="h-2 bg-gray-200 rounded mb-1"></div>
                                  <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-center mt-2 text-gray-700">Kapak Altı - Orta</p>
                            {editorSettings.avatarPosition === 'cover-center' && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        )}

                        {/* Kapak Altı - Sağ (sadece kapak varsa göster) */}
                        {editorSettings.coverUrl && (
                          <button
                            onClick={() => handleSettingChange('avatarPosition', 'cover-right')}
                            className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                              editorSettings.avatarPosition === 'cover-right'
                                ? 'border-black bg-black/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="relative h-20 bg-gray-100 rounded">
                              <div className="h-8 bg-gray-300 rounded-t"></div>
                              <div className="relative px-2 pt-2">
                                <div className="absolute -top-4 right-2 w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
                                <div className="pt-2">
                                  <div className="h-2 bg-gray-200 rounded mb-1 mr-8"></div>
                                  <div className="h-2 bg-gray-200 rounded w-2/3 ml-auto mr-8"></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-center mt-2 text-gray-700">Kapak Altı - Sağ</p>
                            {editorSettings.avatarPosition === 'cover-right' && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                      {editorSettings.coverUrl && (
                        <p className="text-xs text-gray-500 mt-2">
                          Kapak resmi varsa profil fotoğrafı kapak ile container arasında konumlanır
                        </p>
                      )}
                    </div>

                    {/* Logo Ayarları */}
                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                      <div className="space-y-3">
                        {editorSettings.logoUrl && (
                          <div className="relative inline-block">
                            <Image
                              src={editorSettings.logoUrl}
                              alt="Logo"
                              width={parseInt(editorSettings.logoSize)}
                              height={parseInt(editorSettings.logoSize)}
                              className="rounded-lg object-contain"
                            />
                            <button
                              onClick={() => handleSettingChange('logoUrl', '')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <label className="block">
                          <span className="sr-only">Logo Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                          />
                        </label>
                        {editorSettings.logoUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo Boyutu: {editorSettings.logoSize}px
                            </label>
                            <input
                              type="range"
                              min="40"
                              max="150"
                              step="10"
                              value={editorSettings.logoSize}
                              onChange={(e) => handleSettingChange('logoSize', e.target.value)}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Renkler */}
              {activeTab === 'colors' && (
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Arka Plan Rengi
                        <span className="text-xs text-gray-500 ml-1">(Tam Genişlik Butonlar)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editorSettings.buttonBackgroundColor}
                          onChange={(e) => handleSettingChange('buttonBackgroundColor', e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editorSettings.buttonBackgroundColor}
                          onChange={(e) => handleSettingChange('buttonBackgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          placeholder="#000000"
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
              )}

              {/* Yazı Stilleri */}
              {activeTab === 'typography' && (
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
                        <option value="Poppins">Poppins</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buton Yazı Boyutu: {editorSettings.buttonFontSize}
                        <span className="text-xs text-gray-500 ml-1">(Tam Genişlik Butonlar)</span>
                      </label>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.05"
                        value={parseFloat(editorSettings.buttonFontSize)}
                        onChange={(e) => handleSettingChange('buttonFontSize', `${e.target.value}rem`)}
                        className="w-full accent-blue-600"
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
              )}

              {/* Profil Fotoğrafı Ayarları */}
              {activeTab === 'avatar' && (
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
                        Avatar Dikey Pozisyon (Kapak Üzerinde): %{editorSettings.avatarVerticalOffset}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editorSettings.avatarVerticalOffset}
                        onChange={(e) => handleSettingChange('avatarVerticalOffset', e.target.value)}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Aşağıda</span>
                        <span>Yukarıda</span>
                      </div>
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
              )}

              {/* Kapak Resmi */}
              {activeTab === 'cover' && (
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
              )}

              {/* Container Ayarları */}
              {activeTab === 'container' && (
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

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Tam Genişlik Butonlar</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buton Border Radius: {editorSettings.buttonBorderRadius === '999' ? 'Tam Yuvarlak' : `${editorSettings.buttonBorderRadius}px`}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="2"
                          value={editorSettings.buttonBorderRadius === '999' ? '50' : editorSettings.buttonBorderRadius}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleSettingChange('buttonBorderRadius', value === '50' ? '999' : value);
                          }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Köşeli</span>
                          <span>Yuvarlak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* İkon Ayarları */}
              {activeTab === 'icons' && (
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
              )}
            </div>

            {/* Kaydet Butonu */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-4 lg:px-6 flex-shrink-0">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                <Save size={18} />
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          {/* Sağ - Canlı Önizleme (Gerçek Kart Yapısı) */}
          <div className="hidden lg:block fixed top-[64px] right-0 w-[650px] bg-gray-100 h-[calc(100vh-64px)] overflow-y-auto z-20 flex flex-col">
            {/* Preview Mode Tabs */}
            <div className="flex gap-2 p-3 border-b border-gray-200 bg-white">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  previewMode === 'desktop'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Masaüstü Görünüm
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  previewMode === 'mobile'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mobil Görünüm
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className={`${previewMode === 'mobile' ? 'flex items-center justify-center p-4' : 'p-2'}`}>
                <div
                  className={`min-h-screen flex items-center justify-center ${previewMode === 'mobile' ? 'w-full max-w-[375px] p-2' : 'p-4'}`}
                  style={{ backgroundColor: bgColor }}
                >
                <div className={`relative w-full ${previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-md'}`}>
                  {/* Avatar - Above position (taşan profil resmi) - kapak resmi varsa da çalışır */}
                  {card.profileImage && avatarPos === 'above' && (
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
                          src={card.profileImage}
                          alt={card.fullName || 'Profile'}
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
                    {editorSettings.coverUrl && (avatarPos === 'cover-left' || avatarPos === 'cover-center' || avatarPos === 'cover-right') && card.profileImage ? (
                      <>
                        {/* Avatar - Kapak resminin üzerine çıkabilir - sadece center için */}
                        {avatarPos === 'cover-center' && (
                          <div
                            className="relative px-6"
                            style={{
                              marginTop: `-${parseInt(editorSettings.avatarSize) * parseInt(editorSettings.avatarVerticalOffset) / 100}px`,
                              marginBottom: 0,
                            }}
                          >
                            <div className="flex justify-center">
                              <div
                                className="relative overflow-hidden shadow-xl flex-shrink-0"
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
                                  src={card.profileImage}
                                  alt={card.fullName || 'Profile'}
                                  width={parseInt(editorSettings.avatarSize)}
                                  height={parseInt(editorSettings.avatarSize)}
                                  unoptimized
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* User Info - Kapak resminin altında */}
                        <div
                          className="px-6 relative"
                          style={{
                            paddingTop: '16px',
                            paddingRight: avatarPos === 'cover-right' ? `${parseInt(editorSettings.avatarSize) + 48}px` : '0',
                            paddingLeft: avatarPos === 'cover-left' ? `${parseInt(editorSettings.avatarSize) + 48}px` : '0',
                          }}
                        >
                          {/* Avatar absolute position - sağda veya solda */}
                          {avatarPos === 'cover-right' && (
                            <div
                              className="absolute top-0 right-6"
                              style={{
                                marginTop: `-${parseInt(editorSettings.avatarSize) * parseInt(editorSettings.avatarVerticalOffset) / 100}px`,
                              }}
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
                                  src={card.profileImage}
                                  alt={card.fullName || 'Profile'}
                                  width={parseInt(editorSettings.avatarSize)}
                                  height={parseInt(editorSettings.avatarSize)}
                                  unoptimized
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                          )}

                          {avatarPos === 'cover-left' && (
                            <div
                              className="absolute top-0 left-6"
                              style={{
                                marginTop: `-${parseInt(editorSettings.avatarSize) * parseInt(editorSettings.avatarVerticalOffset) / 100}px`,
                              }}
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
                                  src={card.profileImage}
                                  alt={card.fullName || 'Profile'}
                                  width={parseInt(editorSettings.avatarSize)}
                                  height={parseInt(editorSettings.avatarSize)}
                                  unoptimized
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                          )}

                          {/* User Info */}
                          <div className={`${avatarPos === 'cover-center' ? 'text-center' : avatarPos === 'cover-right' ? 'text-right' : avatarPos === 'cover-left' ? 'text-left' : ''}`}>
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
                              {card.fullName || 'Kullanıcı'}
                            </h1>

                            {card.username && (
                              <p
                                className="text-sm opacity-60 mb-2"
                                style={{
                                  color: textColor,
                                  fontSize: editorSettings.bodyFontSize,
                                  fontFamily: editorSettings.fontFamily,
                                }}
                              >
                                @{card.username}
                              </p>
                            )}

                            {card.title && (
                              <p
                                className="text-sm font-medium mb-1"
                                style={{
                                  color: textColor,
                                  fontSize: editorSettings.bodyFontSize,
                                  fontFamily: editorSettings.fontFamily,
                                }}
                              >
                                {card.title}{card.company && ` - ${card.company}`}
                              </p>
                            )}

                            {card.bio && (
                              <p
                                className="text-sm opacity-75 mt-3 mb-4"
                                style={{
                                  color: textColor,
                                  fontSize: editorSettings.bodyFontSize,
                                  fontFamily: editorSettings.fontFamily,
                                  lineHeight: editorSettings.lineHeight,
                                }}
                              >
                                {card.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Avatar Section - Normal pozisyonlar */
                      <div className={`relative ${avatarPos === 'above'
                        ? (editorSettings.coverUrl ? 'pt-8' : 'pt-20')
                        : avatarPos === 'top'
                          ? 'pt-8'
                          : 'py-12'
                        } px-6 text-center`}>
                        {/* Avatar - Top or Center position */}
                        {card.profileImage && avatarPos !== 'above' && (
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
                                src={card.profileImage}
                                alt={card.fullName || 'Profile'}
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
                          {card.fullName || 'Kullanıcı'}
                        </h1>

                        {card.username && (
                          <p
                            className="text-sm opacity-60 mb-2"
                            style={{
                              color: textColor,
                              fontSize: editorSettings.bodyFontSize,
                              fontFamily: editorSettings.fontFamily,
                            }}
                          >
                            @{card.username}
                          </p>
                        )}

                        {card.title && (
                          <p
                            className="text-sm font-medium mb-1"
                            style={{
                              color: textColor,
                              fontSize: editorSettings.bodyFontSize,
                              fontFamily: editorSettings.fontFamily,
                            }}
                          >
                            {card.title}{card.company && ` - ${card.company}`}
                          </p>
                        )}

                        {card.bio && (
                          <p
                            className="text-sm opacity-75 mt-3 mb-4"
                            style={{
                              color: textColor,
                              fontSize: editorSettings.bodyFontSize,
                              fontFamily: editorSettings.fontFamily,
                              lineHeight: editorSettings.lineHeight,
                            }}
                          >
                            {card.bio}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="px-6 pb-4 space-y-3">
                      {card.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                          <Phone size={18} style={{ color: textColor }} />
                          <div className="flex-1">
                            <p className="text-xs opacity-60" style={{ color: textColor }}>Telefon</p>
                            <p className="text-sm font-medium" style={{ color: textColor }}>{card.phone}</p>
                          </div>
                        </div>
                      )}

                      {card.email && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                          <Mail size={18} style={{ color: textColor }} />
                          <div className="flex-1">
                            <p className="text-xs opacity-60" style={{ color: textColor }}>E-posta</p>
                            <p className="text-sm font-medium" style={{ color: textColor }}>{card.email}</p>
                          </div>
                        </div>
                      )}

                      {card.website && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                          <Globe size={18} style={{ color: textColor }} />
                          <div className="flex-1">
                            <p className="text-xs opacity-60" style={{ color: textColor }}>Website</p>
                            <p className="text-sm font-medium" style={{ color: textColor }}>{card.website}</p>
                          </div>
                        </div>
                      )}

                      {card.location && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
                          <MapPin size={18} style={{ color: textColor }} />
                          <div className="flex-1">
                            <p className="text-xs opacity-60" style={{ color: textColor }}>Konum</p>
                            <p className="text-sm font-medium" style={{ color: textColor }}>{card.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {socialLinks.length > 0 && (
                      <div className="px-6 pb-6">
                        {editorSettings.layoutStyle === 'full-width-buttons' ? (
                          /* Tam Genişlik Buton Layout */
                          <div className="space-y-3">
                            {socialLinks.map((link, idx) => {
                              const Icon = link.icon;
                              return (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-4 w-full p-4 shadow-md hover:shadow-lg transition-all group"
                                  style={{
                                    backgroundColor: editorSettings.buttonBackgroundColor,
                                    borderRadius: `${editorSettings.buttonBorderRadius}px`,
                                  }}
                                >
                                  <div 
                                    className="flex items-center justify-center shrink-0"
                                    style={{
                                      width: `${parseInt(editorSettings.iconSize) + 16}px`,
                                      height: `${parseInt(editorSettings.iconSize) + 16}px`,
                                      backgroundColor: editorSettings.iconBackground !== 'transparent'
                                        ? `${editorSettings.iconColor}15`
                                        : 'rgba(255, 255, 255, 0.2)',
                                      backdropFilter: editorSettings.iconBackground === 'transparent' ? 'blur(4px)' : 'none',
                                      borderRadius: editorSettings.iconBackground === 'circle' ? '50%' :
                                        editorSettings.iconBackground === 'square' ? '0' :
                                          editorSettings.iconBackground === 'rounded' ? `${editorSettings.iconBorderRadius}px` :
                                            '50%',
                                    }}
                                  >
                                    <Icon 
                                      size={parseInt(editorSettings.iconSize)} 
                                      style={{ color: editorSettings.iconColor }} 
                                    />
                                  </div>
                                  <span 
                                    className="flex-1 text-center font-semibold capitalize text-white" 
                                    style={{ 
                                      fontSize: editorSettings.buttonFontSize,
                                      fontFamily: editorSettings.fontFamily,
                                    }}
                                  >
                                    {link.platform}
                                  </span>
                                  <div className="w-6 h-6 flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={16} style={{ color: editorSettings.iconColor }} />
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          /* Grid Layout (Mevcut) */
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
                                  className={`flex flex-col items-center justify-center gap-2 p-4 bg-black/5 hover:bg-black/10 transition-all ${editorSettings.iconBackground !== 'transparent' ? iconBgStyle : ''
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
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between">
                        {editorSettings.logoUrl && (
                          <div className="flex-shrink-0">
                            <Image
                              src={editorSettings.logoUrl}
                              alt="Logo"
                              width={parseInt(editorSettings.logoSize)}
                              height={parseInt(editorSettings.logoSize)}
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className={`text-xs opacity-50 ${editorSettings.logoUrl ? 'text-right ml-auto' : 'text-center w-full'}`}>
                          <p
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}