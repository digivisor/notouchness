/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { Save, Eye, User, LogOut, Home, Palette, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { Mail, Phone, Globe, Instagram, Linkedin, Twitter, Facebook, Youtube, MessageCircle, Send, Github, Link2, Music, Video, MoreVertical } from 'lucide-react';

type ThemeType = {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  containerBackgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  layoutStyle: 'icons-only' | 'icons-with-title' | 'full-description' | 'full-width-buttons';
  gridCols: number;
  hasCover: boolean;
  coverUrl?: string;
  coverHeight?: string;
  avatarPosition: 'top' | 'center' | 'above' | 'cover-left' | 'cover-center' | 'cover-right';
};

export default function AppearancePage() {
  const router = useRouter();
  const { currentCard, isOwner, updateCard } = useCard();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 4-5 Farklı Tema
  const themes: ThemeType[] = [
    {
      id: 'theme-1',
      name: 'Modern Profesyonel',
      description: 'Kapak fotoğrafı ile 4\'lü düzen',
      backgroundColor: '#dc2626',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#dc2626',
      secondaryColor: '#fef2f2',
      textColor: '#111827',
      accentColor: '#991b1b',
      layoutStyle: 'icons-with-title',
      gridCols: 4,
      hasCover: true,
      coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      coverHeight: '200',
      avatarPosition: 'cover-center',
    },
    {
      id: 'theme-2',
      name: 'Minimalist',
      description: 'Kapak fotoğrafı olmadan 4\'lü düzen',
      backgroundColor: '#f3f4f6',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#4b5563',
      secondaryColor: '#f9fafb',
      textColor: '#374151',
      accentColor: '#6b7280',
      layoutStyle: 'icons-with-title',
      gridCols: 4,
      hasCover: false,
      avatarPosition: 'above',
    },
    {
      id: 'theme-3',
      name: 'Yatay Butonlar',
      description: 'Kapak fotoğrafı ile yatay buton düzeni',
      backgroundColor: '#1e3a8a',
      containerBackgroundColor: '#ffffff',
      primaryColor: '#1e40af',
      secondaryColor: '#dbeafe',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      layoutStyle: 'full-width-buttons',
      gridCols: 3,
      hasCover: true,
      coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      coverHeight: '200',
      avatarPosition: 'cover-center',
    },
    {
      id: 'theme-4',
      name: 'Sade Yatay',
      description: 'Kapak fotoğrafı olmadan yatay buton düzeni',
      backgroundColor: '#0f172a',
      containerBackgroundColor: '#fefce8',
      primaryColor: '#d4af37',
      secondaryColor: '#fef9c3',
      textColor: '#0f172a',
      accentColor: '#fde047',
      layoutStyle: 'full-width-buttons',
      gridCols: 3,
      hasCover: false,
      avatarPosition: 'above',
    },
    {
      id: 'theme-5',
      name: 'Kreatif',
      description: 'Kapak fotoğrafı ile ikon + başlık düzeni',
      backgroundColor: '#ec4899',
      containerBackgroundColor: '#fff1f2',
      primaryColor: '#f472b6',
      secondaryColor: '#fce7f3',
      textColor: '#831843',
      accentColor: '#f9a8d4',
      layoutStyle: 'icons-with-title',
      gridCols: 3,
      hasCover: true,
      coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      coverHeight: '200',
      avatarPosition: 'cover-left',
    },
  ];

  useEffect(() => {
    if (!isOwner || !currentCard) {
      router.push('/card/login');
      return;
    }
  }, [currentCard, isOwner, router]);

  const handleThemeClick = (theme: ThemeType) => {
    setSelectedTheme(theme);
    setShowModal(true);
  };

  const handleApplyTheme = async () => {
    if (!currentCard || !selectedTheme) return;

    const success = await updateCard({
      ...currentCard,
      theme: selectedTheme.id as any,
      layoutStyle: selectedTheme.layoutStyle,
      primaryColor: selectedTheme.primaryColor,
      secondaryColor: selectedTheme.secondaryColor,
      backgroundColor: selectedTheme.backgroundColor,
      containerBackgroundColor: selectedTheme.containerBackgroundColor,
      textColor: selectedTheme.textColor,
      gridCols: selectedTheme.gridCols,
      avatarPosition: selectedTheme.avatarPosition,
      coverUrl: selectedTheme.hasCover ? selectedTheme.coverUrl || '' : '',
      coverHeight: selectedTheme.hasCover ? selectedTheme.coverHeight || '200' : '',
    });

    if (success) {
      setShowModal(false);
      alert('✅ Tema başarıyla uygulandı!');
    } else {
      alert('❌ Tema uygulanamadı!');
    }
  };

  if (!currentCard) return null;

  // Platform icon mapping
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, any> = {
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

  // Collect social links for preview
  const getSocialLinks = (card: any) => {
    const links: Array<{ platform: string; url: string; icon: any }> = [];
    const platforms = [
      { key: 'instagram', value: card.instagram },
      { key: 'linkedin', value: card.linkedin },
      { key: 'twitter', value: card.twitter },
      { key: 'facebook', value: card.facebook },
      { key: 'youtube', value: card.youtube },
      { key: 'github', value: card.github },
    ];
    platforms.forEach(p => {
      if (p.value && p.value.trim()) {
        links.push({
          platform: p.key,
          url: '#',
          icon: getPlatformIcon(p.key)
        });
      }
    });
    // Add some demo links if no social links exist
    if (links.length === 0) {
      links.push(
        { platform: 'instagram', url: '#', icon: Instagram },
        { platform: 'linkedin', url: '#', icon: Linkedin },
        { platform: 'twitter', url: '#', icon: Twitter },
      );
    }
    return links;
  };

  // Modal için önizleme verileri
  const previewCard = selectedTheme ? {
    ...currentCard,
    backgroundColor: selectedTheme.backgroundColor,
    containerBackgroundColor: selectedTheme.containerBackgroundColor,
    primaryColor: selectedTheme.primaryColor,
    secondaryColor: selectedTheme.secondaryColor,
    textColor: selectedTheme.textColor,
    layoutStyle: selectedTheme.layoutStyle,
    gridCols: selectedTheme.gridCols,
    avatarPosition: selectedTheme.avatarPosition,
    coverUrl: selectedTheme.hasCover ? selectedTheme.coverUrl || '' : '',
    coverHeight: selectedTheme.hasCover ? selectedTheme.coverHeight || '200' : '',
  } : null;

  const previewSocialLinks = previewCard ? getSocialLinks(previewCard) : [];

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
            <span>Tema</span>
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
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tema</h1>
            <p className="text-gray-600">Profilinin görünümünü özelleştir ve hazır temalardan seç</p>
          </div>

          {/* Tema Seçimi */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Tema Seçimi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  className="p-0 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition overflow-hidden hover:shadow-lg text-left"
                >
                  {/* Önizleme - Gerçekçi Kart */}
                  <div className="relative" style={{ backgroundColor: theme.backgroundColor, minHeight: '320px', padding: '8px' }}>
                    {/* Container */}
                    <div 
                      className="w-full rounded-2xl overflow-hidden shadow-lg"
                      style={{ backgroundColor: theme.containerBackgroundColor }}
                    >
                      {/* Kapak Resmi */}
                      {theme.hasCover && theme.coverUrl && (
                        <div className="w-full h-24 relative overflow-hidden">
                          <Image
                            src={theme.coverUrl}
                            alt="Cover"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Avatar */}
                      {currentCard.profileImage && (
                        <div className={`flex relative ${theme.hasCover && theme.avatarPosition === 'cover-center' ? 'justify-center -mt-10 mb-2' : theme.hasCover && theme.avatarPosition === 'cover-left' ? 'justify-start px-4 -mt-10 mb-2' : theme.hasCover && theme.avatarPosition === 'cover-right' ? 'justify-end px-4 -mt-10 mb-2' : 'justify-center pt-6 pb-2'}`}>
                          <div 
                            className="relative overflow-hidden shadow-xl rounded-full border-2"
                            style={{
                              width: '64px',
                              height: '64px',
                              borderColor: theme.containerBackgroundColor,
                              backgroundColor: theme.containerBackgroundColor
                            }}
                          >
                            <Image
                              src={currentCard.profileImage}
                              alt="Avatar"
                              width={64}
                              height={64}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* User Info */}
                      <div className={`px-4 pb-3 ${theme.hasCover && (theme.avatarPosition === 'cover-left' || theme.avatarPosition === 'cover-right') ? 'text-left' : 'text-center'}`}>
                        <div 
                          className="font-bold text-sm mb-1"
                          style={{ color: theme.textColor }}
                        >
                          {currentCard.fullName || currentCard.username}
                        </div>
                        {currentCard.title && (
                          <div 
                            className="text-xs opacity-70"
                            style={{ color: theme.textColor }}
                          >
                            {currentCard.title}
                          </div>
                        )}
                      </div>
                      
                      {/* Social Links */}
                      <div className="px-4 pb-4">
                        {theme.layoutStyle === 'full-width-buttons' ? (
                          <div className="space-y-2">
                            {['Instagram', 'LinkedIn'].map((platform) => {
                              const Icon = getPlatformIcon(platform.toLowerCase());
                              return (
                                <div
                                  key={platform}
                                  className="flex items-center gap-2 w-full p-2 rounded-full"
                                  style={{ backgroundColor: theme.primaryColor }}
                                >
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Icon size={12} className="text-white" />
                                  </div>
                                  <span className="flex-1 text-xs font-semibold text-white capitalize text-center">{platform}</span>
                                  <MoreVertical size={12} className="text-white opacity-70 flex-shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div 
                            className="grid gap-2"
                            style={{ gridTemplateColumns: `repeat(${theme.gridCols}, minmax(0, 1fr))` }}
                          >
                            {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].slice(0, theme.gridCols).map((platform) => {
                              const Icon = getPlatformIcon(platform.toLowerCase());
                              return (
                                <div
                                  key={platform}
                                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg"
                                  style={{ backgroundColor: theme.secondaryColor }}
                                >
                                  <Icon 
                                    size={16} 
                                    style={{ color: theme.primaryColor }} 
                                  />
                                  {theme.layoutStyle === 'icons-with-title' && (
                                    <div 
                                      className="text-[8px] font-medium capitalize text-center leading-tight"
                                      style={{ color: theme.textColor }}
                                    >
                                      {platform}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 mb-1">{theme.name}</h3>
                    <p className="text-xs text-gray-600">{theme.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tema Önizleme Modal */}
      {showModal && selectedTheme && previewCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTheme.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedTheme.description}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content - Önizleme */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: selectedTheme.backgroundColor }}>
              <div className="max-w-md mx-auto">
                {/* Avatar - Above position */}
                {previewCard.profileImage && selectedTheme.avatarPosition === 'above' && (
                  <div className="flex justify-center mb-[-60px] relative z-10">
                    <div 
                      className="relative overflow-hidden shadow-xl rounded-full border-2"
                      style={{
                        width: '128px',
                        height: '128px',
                        borderColor: selectedTheme.containerBackgroundColor,
                      }}
                    >
                      <Image
                        src={previewCard.profileImage}
                        alt={previewCard.fullName || 'Profile'}
                        width={128}
                        height={128}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Önizleme Kartı */}
                <div 
                  className="w-full overflow-hidden shadow-2xl"
                  style={{ 
                    backgroundColor: selectedTheme.containerBackgroundColor,
                    borderRadius: '24px',
                  }}
                >
                  {/* Kapak Resmi */}
                  {selectedTheme.hasCover && previewCard.coverUrl && (
                    <div 
                      className="w-full relative overflow-hidden"
                      style={{ height: `${selectedTheme.coverHeight || 200}px` }}
                    >
                      <Image
                        src={previewCard.coverUrl}
                        alt="Cover"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Avatar Section - Cover positions */}
                  {selectedTheme.hasCover && (selectedTheme.avatarPosition === 'cover-left' || selectedTheme.avatarPosition === 'cover-center' || selectedTheme.avatarPosition === 'cover-right') && previewCard.profileImage ? (
                    <>
                      {selectedTheme.avatarPosition === 'cover-center' && (
                        <div className="relative px-6 -mt-16 mb-2">
                          <div className="flex justify-center">
                            <div 
                              className="relative overflow-hidden shadow-xl rounded-full border-2"
                              style={{
                                width: '128px',
                                height: '128px',
                                borderColor: selectedTheme.containerBackgroundColor,
                              }}
                            >
                              <Image
                                src={previewCard.profileImage}
                                alt={previewCard.fullName || 'Profile'}
                                width={128}
                                height={128}
                                unoptimized
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative pt-4">
                        {(selectedTheme.avatarPosition === 'cover-right' || selectedTheme.avatarPosition === 'cover-left') && (
                          <div 
                            className={`absolute top-0 ${selectedTheme.avatarPosition === 'cover-right' ? 'right-6' : 'left-6'}`}
                            style={{ marginTop: '-64px' }}
                          >
                            <div 
                              className="relative overflow-hidden shadow-xl rounded-full border-2"
                              style={{
                                width: '128px',
                                height: '128px',
                                borderColor: selectedTheme.containerBackgroundColor,
                              }}
                            >
                              <Image
                                src={previewCard.profileImage}
                                alt={previewCard.fullName || 'Profile'}
                                width={128}
                                height={128}
                                unoptimized
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* User Info */}
                        <div 
                          className={`px-6 ${selectedTheme.avatarPosition === 'cover-center' ? 'text-center' : selectedTheme.avatarPosition === 'cover-left' ? 'text-left pl-40' : 'text-left pr-40'}`}
                        >
                          <h1 
                            className="text-2xl font-bold mb-1" 
                            style={{ color: selectedTheme.textColor }}
                          >
                            {previewCard.fullName || previewCard.username}
                          </h1>
                          {previewCard.username && (
                            <p 
                              className="text-sm opacity-60 mb-2" 
                              style={{ color: selectedTheme.textColor }}
                            >
                              @{previewCard.username}
                            </p>
                          )}
                          {previewCard.title && (
                            <p 
                              className="text-sm font-medium mb-1" 
                              style={{ color: selectedTheme.textColor }}
                            >
                              {previewCard.title}
                            </p>
                          )}
                          {previewCard.bio && (
                            <p 
                              className="text-sm opacity-75 mt-3 mb-4" 
                              style={{ color: selectedTheme.textColor }}
                            >
                              {previewCard.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Normal Avatar Positions */
                    <div className={`relative ${selectedTheme.avatarPosition === 'above' ? 'pt-20' : selectedTheme.avatarPosition === 'top' ? 'pt-8' : 'py-12'} px-6 text-center`}>
                      {previewCard.profileImage && selectedTheme.avatarPosition !== 'above' && (
                        <div className="mb-4 flex justify-center">
                          <div 
                            className="relative overflow-hidden shadow-lg rounded-full border-2"
                            style={{
                              width: '128px',
                              height: '128px',
                              borderColor: selectedTheme.containerBackgroundColor,
                            }}
                          >
                            <Image
                              src={previewCard.profileImage}
                              alt={previewCard.fullName || 'Profile'}
                              width={128}
                              height={128}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      
                      <h1 
                        className="text-2xl font-bold mb-1" 
                        style={{ color: selectedTheme.textColor }}
                      >
                        {previewCard.fullName || previewCard.username}
                      </h1>
                      {previewCard.username && (
                        <p 
                          className="text-sm opacity-60 mb-2" 
                          style={{ color: selectedTheme.textColor }}
                        >
                          @{previewCard.username}
                        </p>
                      )}
                      {previewCard.title && (
                        <p 
                          className="text-sm font-medium mb-1" 
                          style={{ color: selectedTheme.textColor }}
                        >
                          {previewCard.title}
                        </p>
                      )}
                      {previewCard.bio && (
                        <p 
                          className="text-sm opacity-75 mt-3 mb-4" 
                          style={{ color: selectedTheme.textColor }}
                        >
                          {previewCard.bio}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Contact Info */}
                  {(previewCard.email || previewCard.phone || previewCard.website) && (
                    <div className="px-6 pb-4 space-y-2">
                      {previewCard.phone && (
                        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: `${selectedTheme.textColor}08` }}>
                          <Phone size={16} style={{ color: selectedTheme.textColor, opacity: 0.7 }} />
                          <p className="text-xs font-medium" style={{ color: selectedTheme.textColor }}>{previewCard.phone}</p>
                        </div>
                      )}
                      {previewCard.email && (
                        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: `${selectedTheme.textColor}08` }}>
                          <Mail size={16} style={{ color: selectedTheme.textColor, opacity: 0.7 }} />
                          <p className="text-xs font-medium" style={{ color: selectedTheme.textColor }}>{previewCard.email}</p>
                        </div>
                      )}
                      {previewCard.website && (
                        <div className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: `${selectedTheme.textColor}08` }}>
                          <Globe size={16} style={{ color: selectedTheme.textColor, opacity: 0.7 }} />
                          <p className="text-xs font-medium" style={{ color: selectedTheme.textColor }}>{previewCard.website}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Links Preview */}
                  {previewSocialLinks.length > 0 && (
                    <div className="px-6 pb-6">
                      {selectedTheme.layoutStyle === 'full-width-buttons' ? (
                        <div className="space-y-2">
                          {previewSocialLinks.slice(0, 3).map((link, idx) => {
                            const Icon = link.icon;
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-3 w-full p-3 rounded-full"
                                style={{ backgroundColor: selectedTheme.primaryColor }}
                              >
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                  <Icon size={14} className="text-white" />
                                </div>
                                <span 
                                  className="flex-1 text-sm font-semibold capitalize text-white" 
                                >
                                  {link.platform}
                                </span>
                                <MoreVertical size={14} className="text-white opacity-70" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div 
                          className="grid gap-2"
                          style={{ gridTemplateColumns: `repeat(${selectedTheme.gridCols}, minmax(0, 1fr))` }}
                        >
                          {previewSocialLinks.slice(0, selectedTheme.gridCols * 2).map((link, idx) => {
                            const Icon = link.icon;
                            return (
                              <div
                                key={idx}
                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg"
                                style={{ backgroundColor: selectedTheme.secondaryColor }}
                              >
                                <Icon 
                                  size={20} 
                                  style={{ color: selectedTheme.primaryColor }} 
                                />
                                {selectedTheme.layoutStyle === 'icons-with-title' && (
                                  <span 
                                    className="text-xs font-medium capitalize"
                                    style={{ color: selectedTheme.textColor }}
                                  >
                                    {link.platform}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleApplyTheme}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                <Save size={20} />
                Temayı Uygula
              </button>
            </div>
          </div>
        </div>
      )}

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
