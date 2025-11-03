'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardProfile, useCard } from '../../context/CardContext';
import Image from 'next/image';
import { 
  Save, 
  Eye, 
  User, 
  LogOut,
  Home,
  Upload,
  Plus,
  Trash2,
  Palette,
  Mail,
  Phone,
  Globe,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Github,
  Briefcase,
  DollarSign,
  Link2,
  Music,
  Video,
  TrendingUp,
  Users,
  Clock,
  Code,
  Pen,
  ShoppingBag,
  CreditCard,
  Calendar
} from 'lucide-react';
import * as PlatformIcons from '@/components/PlatformIcons';
import { cardDb } from '@/lib/supabase-cards';

interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export default function CardSetupPage() {
  const router = useRouter();
  const { currentCard, isOwner, updateCard, logoutFromCard } = useCard();
  
  const [profileImage, setProfileImage] = useState<string>('');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [usernameError, setUsernameError] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  
  const [formData, setFormData] = useState({
    // Temel
    username: '',
    fullName: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    // Sosyal Medya
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    snapchat: '',
    pinterest: '',
    reddit: '',
    twitch: '',
    discord: '',
    spotify: '',
    threads: '',
    clubhouse: '',
    // Mesajlaşma
    whatsapp: '',
    telegram: '',
    signal: '',
    viber: '',
    wechat: '',
    line: '',
    // Profesyonel/İş
    github: '',
    gitlab: '',
    behance: '',
    dribbble: '',
    medium: '',
    devto: '',
    stackoverflow: '',
    figma: '',
    notion: '',
    calendly: '',
    linktree: '',
    substack: '',
    patreon: '',
    kofi: '',
    buymeacoffee: '',
    // E-ticaret/Satış
    etsy: '',
    amazon: '',
    ebay: '',
    shopify: '',
    trendyol: '',
    hepsiburada: '',
    temu: '',
    aliexpress: '',
    sahibinden: '',
    gittigidiyor: '',
    n11: '',
    // Ödeme
    iban: '',
    paypal: '',
    cashapp: '',
    venmo: '',
    revolut: '',
    wise: '',
    papara: '',
    // Video/Streaming
    vimeo: '',
    dailymotion: '',
    rumble: '',
    kick: '',
    // Müzik
    soundcloud: '',
    bandcamp: '',
    applemusic: '',
    deezer: '',
    // Profesyonel Ağlar
    xing: '',
    angellist: '',
    crunchbase: '',
    producthunt: '',
    // Rezervasyon/Servis
    booking: '',
    airbnb: '',
    tripadvisor: '',
    uber: '',
    bolt: '',
    // Görünüm
    theme: 'dark' as CardProfile['theme'],
    layoutStyle: 'icons-with-title' as 'icons-only' | 'icons-with-title' | 'full-description',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
  });

  useEffect(() => {
    if (!currentCard || !isOwner) {
      router.push('/card/login');
      return;
    }

    // setFormData'yı callback içinde çağır
    const initializeForm = () => {
      setFormData({
        username: currentCard.username || '',
        fullName: currentCard.fullName || '',
        title: currentCard.title || '',
        company: currentCard.company || '',
        bio: currentCard.bio || '',
        email: currentCard.email || '',
        phone: currentCard.phone || '',
        website: currentCard.website || '',
        location: currentCard.location || '',
        instagram: currentCard.instagram || '',
        facebook: currentCard.facebook || '',
        twitter: currentCard.twitter || '',
        linkedin: currentCard.linkedin || '',
        youtube: currentCard.youtube || '',
        tiktok: currentCard.tiktok || '',
      snapchat: currentCard.snapchat || '',
      pinterest: currentCard.pinterest || '',
      reddit: currentCard.reddit || '',
      twitch: currentCard.twitch || '',
      discord: currentCard.discord || '',
      spotify: currentCard.spotify || '',
      threads: currentCard.threads || '',
      clubhouse: currentCard.clubhouse || '',
      whatsapp: currentCard.whatsapp || '',
      telegram: currentCard.telegram || '',
      signal: currentCard.signal || '',
      viber: currentCard.viber || '',
      wechat: currentCard.wechat || '',
      line: currentCard.line || '',
      github: currentCard.github || '',
      gitlab: currentCard.gitlab || '',
      behance: currentCard.behance || '',
      dribbble: currentCard.dribbble || '',
      medium: currentCard.medium || '',
      devto: currentCard.devto || '',
      stackoverflow: currentCard.stackoverflow || '',
      figma: currentCard.figma || '',
      notion: currentCard.notion || '',
      calendly: currentCard.calendly || '',
      linktree: currentCard.linktree || '',
      substack: currentCard.substack || '',
      patreon: currentCard.patreon || '',
      kofi: currentCard.kofi || '',
      buymeacoffee: currentCard.buymeacoffee || '',
      etsy: currentCard.etsy || '',
      amazon: currentCard.amazon || '',
      ebay: currentCard.ebay || '',
      shopify: currentCard.shopify || '',
      trendyol: currentCard.trendyol || '',
      hepsiburada: currentCard.hepsiburada || '',
      temu: currentCard.temu || '',
      aliexpress: currentCard.aliexpress || '',
      sahibinden: currentCard.sahibinden || '',
      gittigidiyor: currentCard.gittigidiyor || '',
      n11: currentCard.n11 || '',
      iban: currentCard.iban || '',
      paypal: currentCard.paypal || '',
      cashapp: currentCard.cashapp || '',
      venmo: currentCard.venmo || '',
      revolut: currentCard.revolut || '',
      wise: currentCard.wise || '',
      papara: currentCard.papara || '',
      vimeo: currentCard.vimeo || '',
      dailymotion: currentCard.dailymotion || '',
      rumble: currentCard.rumble || '',
      kick: currentCard.kick || '',
      soundcloud: currentCard.soundcloud || '',
      bandcamp: currentCard.bandcamp || '',
      applemusic: currentCard.applemusic || '',
      deezer: currentCard.deezer || '',
      xing: currentCard.xing || '',
      angellist: currentCard.angellist || '',
      crunchbase: currentCard.crunchbase || '',
      producthunt: currentCard.producthunt || '',
      booking: currentCard.booking || '',
      airbnb: currentCard.airbnb || '',
      tripadvisor: currentCard.tripadvisor || '',
      uber: currentCard.uber || '',
      bolt: currentCard.bolt || '',
      theme: currentCard.theme,
      layoutStyle: currentCard.layoutStyle || 'icons-with-title',
      primaryColor: currentCard.primaryColor || '#000000',
      secondaryColor: currentCard.secondaryColor || '#ffffff',
    });
    
    setProfileImage(currentCard.profileImage || '');
    setCustomLinks(currentCard.customLinks || []);
    };
    
    initializeForm();
  }, [currentCard, isOwner, router]);

  // Modal helper fonksiyonları
  const showModal = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Kullanıcı adı değiştiğinde kontrolü temizle
    if (name === 'username') {
      setUsernameError('');
    }
  };

  // Kullanıcı adı kontrolü için debounce fonksiyonu
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username.trim();
      
      // Boş veya mevcut kullanıcı adıyla aynıysa kontrol yapma
      if (!username || username === currentCard?.username) {
        setUsernameError('');
        return;
      }
      
      // Kullanıcı adı formatı kontrolü
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        setUsernameError('Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir');
        return;
      }
      
      if (username.length < 3) {
        setUsernameError('Kullanıcı adı en az 3 karakter olmalıdır');
        return;
      }
      
      setIsCheckingUsername(true);
      
      try {
        const isAvailable = await cardDb.checkUsernameAvailability(username, currentCard?.id);
        
        if (!isAvailable) {
          setUsernameError('Bu kullanıcı adı zaten kullanılıyor');
        } else {
          setUsernameError('');
        }
      } catch (error) {
        console.error('Username check error:', error);
        setUsernameError('Kullanıcı adı kontrol edilemedi');
      } finally {
        setIsCheckingUsername(false);
      }
    };
    
    // Debounce: Kullanıcı yazmayı bıraktıktan 500ms sonra kontrol et
    const timeoutId = setTimeout(checkUsername, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.username, currentCard?.id, currentCard?.username]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: '',
      url: '',
      icon: ''
    };
    setCustomLinks([...customLinks, newLink]);
  };

  const updateCustomLink = (id: string, field: keyof CustomLink, value: string) => {
    setCustomLinks(customLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  const handleCustomLinkIconUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCustomLink(id, 'icon', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kullanıcı adı hatası varsa kaydetme
    if (usernameError) {
      showModal('error', 'Geçersiz Kullanıcı Adı', usernameError);
      return;
    }
    
    // Kullanıcı adı kontrolü devam ediyorsa bekle
    if (isCheckingUsername) {
      showModal('warning', 'Lütfen Bekleyin', 'Kullanıcı adı kontrol ediliyor...');
      return;
    }
    
    // Kullanıcı adı değiştiyse son bir kez daha kontrol et
    if (formData.username && formData.username !== currentCard?.username) {
      const isAvailable = await cardDb.checkUsernameAvailability(formData.username, currentCard?.id);
      if (!isAvailable) {
        setUsernameError('Bu kullanıcı adı zaten kullanılıyor');
        showModal('error', 'Kullanıcı Adı Kullanımda', 'Bu kullanıcı adı zaten başka bir kart tarafından kullanılıyor.');
        return;
      }
    }
    
    const success = await updateCard({
      ...formData,
      profileImage,
      customLinks
    });
    
    if (success) {
      showModal('success', 'Başarılı!', 'Profil bilgileriniz başarıyla güncellendi.', () => {
        if (formData.username) {
          router.push(`/${formData.username}`);
        }
      }, 'Profili Görüntüle');
    } else {
      showModal('error', 'Hata!', 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handlePreview = () => {
    if (formData.username) {
      window.open(`/${formData.username}`, '_blank');
    } else {
      showModal('warning', 'Uyarı', 'Profili görüntülemek için önce bir kullanıcı adı belirlemelisiniz.');
    }
  };

  const handleLogout = () => {
    showModal(
      'warning',
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      () => {
        logoutFromCard();
        router.push('/');
      },
      'Çıkış Yap',
      'İptal'
    );
  };

  useEffect(() => {
    if (!currentCard || !isOwner) {
      router.push('/card/login');
    }
  }, [currentCard, isOwner, router]);

  if (!currentCard || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Sol Sidebar */}
      <div className="w-60 bg-black text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Kart Ayarları</h1>
          <p className="text-gray-400 text-sm mt-1">{currentCard.username || currentCard.fullName}</p>
        </div>
        
        <nav className="flex-1 px-3">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black rounded-lg transition mb-2"
          >
            <User size={20} />
            <span>Profil Düzenle</span>
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/card/appearance')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition mb-2"
          >
            <Palette size={20} />
            <span>Görünüm & Tema</span>
          </button>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Eye size={18} />
            Profili Görüntüle
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Home size={18} />
            Ana Sayfa
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-8 py-6">
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profil Düzenle</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kart ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{currentCard.id}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pb-24">
            
            {/* Profil Resmi */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Profil Resmi</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profileImage ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image 
                        src={profileImage} 
                        alt="Profile" 
                        width={80} 
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={36} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm">
                      <Upload size={16} />
                      <span>Resim Yükle</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG veya GIF. Max 2MB.
                  </p>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => setProfileImage('')}
                      className="text-red-600 text-xs mt-1.5 hover:underline"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Temel Bilgiler</h2>
              <div className="grid md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Kullanıcı Adı *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">notouchness.com/</span>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900 ${
                          usernameError ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="kullaniciadi"
                        required
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-500">{usernameError}</p>
                  )}
                  {!usernameError && formData.username && formData.username !== currentCard?.username && !isCheckingUsername && (
                    <p className="mt-1 text-sm text-green-600">✓ Kullanıcı adı kullanılabilir</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Fazıl Can Akbaş"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ünvan</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Briefcase size={16} />
                    Şirket
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Digivisor"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <MapPin size={16} />
                    Konum
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="İstanbul, Türkiye"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hakkında</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Kendinden kısaca bahset..."
                  />
                </div>
              </div>
            </div>

            {/* İletişim */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">İletişim</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Mail size={16} />
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Phone size={16} />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="+90 555 555 55 55"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Globe size={16} />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Sosyal Medya</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Instagram size={16} />Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Facebook size={16} />
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Twitter size={16} />
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Linkedin size={16} />
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Youtube size={16} />
                    YouTube
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kanaladi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Video size={16} />TikTok</label>
                  <input
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Users size={16} />Snapchat</label>
                  <input
                    type="text"
                    name="snapchat"
                    value={formData.snapchat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Palette size={16} />Pinterest</label>
                  <input
                    type="text"
                    name="pinterest"
                    value={formData.pinterest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><MessageCircle size={16} />Reddit</label>
                  <input
                    type="text"
                    name="reddit"
                    value={formData.reddit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="u/kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Video size={16} />Twitch</label>
                  <input
                    type="text"
                    name="twitch"
                    value={formData.twitch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Users size={16} />Discord</label>
                  <input
                    type="text"
                    name="discord"
                    value={formData.discord}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullanici#1234"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Music size={16} />Spotify</label>
                  <input
                    type="text"
                    name="spotify"
                    value={formData.spotify}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Profil URL"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.ThreadsIcon size={16} />Threads</label>
                  <input
                    type="text"
                    name="threads"
                    value={formData.threads}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.ClubhouseIcon size={16} />Clubhouse</label>
                  <input
                    type="text"
                    name="clubhouse"
                    value={formData.clubhouse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
              </div>
            </div>

            {/* Mesajlaşma */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Mesajlaşma</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <MessageCircle size={16} />
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="+905555555555"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5">
                    <Send size={16} />
                    Telegram
                  </label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><MessageCircle size={16} />Signal</label>
                  <input
                    type="text"
                    name="signal"
                    value={formData.signal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="+905555555555"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Phone size={16} />Viber</label>
                  <input
                    type="text"
                    name="viber"
                    value={formData.viber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="+905555555555"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.WeChatIcon size={16} />WeChat</label>
                  <input
                    type="text"
                    name="wechat"
                    value={formData.wechat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="ID"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.LineIcon size={16} />LINE</label>
                  <input
                    type="text"
                    name="line"
                    value={formData.line}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="ID"
                  />
                </div>
              </div>
            </div>

            {/* Profesyonel */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Profesyonel</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Github size={16} />GitHub</label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.GitLabIcon size={16} />GitLab</label>
                  <input
                    type="text"
                    name="gitlab"
                    value={formData.gitlab}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Palette size={16} />Behance</label>
                  <input
                    type="text"
                    name="behance"
                    value={formData.behance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Palette size={16} />Dribbble</label>
                  <input
                    type="text"
                    name="dribbble"
                    value={formData.dribbble}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Pen size={16} />Medium</label>
                  <input
                    type="text"
                    name="medium"
                    value={formData.medium}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.DevToIcon size={16} />Dev.to</label>
                  <input
                    type="text"
                    name="devto"
                    value={formData.devto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.StackOverflowIcon size={16} />Stack Overflow</label>
                  <input
                    type="text"
                    name="stackoverflow"
                    value={formData.stackoverflow}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="user/12345"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.FigmaIcon size={16} />Figma</label>
                  <input
                    type="text"
                    name="figma"
                    value={formData.figma}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.NotionIcon size={16} />Notion</label>
                  <input
                    type="text"
                    name="notion"
                    value={formData.notion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Workspace URL"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Calendar size={16} />Calendly</label>
                  <input
                    type="text"
                    name="calendly"
                    value={formData.calendly}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Link2 size={16} />Linktree</label>
                  <input
                    type="text"
                    name="linktree"
                    value={formData.linktree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.SubstackIcon size={16} />Substack</label>
                  <input
                    type="text"
                    name="substack"
                    value={formData.substack}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="newsletter-adi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.PatreonIcon size={16} />Patreon</label>
                  <input
                    type="text"
                    name="patreon"
                    value={formData.patreon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.KoFiIcon size={16} />Ko-fi</label>
                  <input
                    type="text"
                    name="kofi"
                    value={formData.kofi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.BuyMeACoffeeIcon size={16} />Buy Me a Coffee</label>
                  <input
                    type="text"
                    name="buymeacoffee"
                    value={formData.buymeacoffee}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="kullaniciadi"
                  />
                </div>
              </div>
            </div>

            {/* Ödeme */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Ödeme Bilgileri</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><DollarSign size={16} />IBAN</label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900 font-mono"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><CreditCard size={16} />PayPal</label>
                  <input
                    type="text"
                    name="paypal"
                    value={formData.paypal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="paypal.me/kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><DollarSign size={16} />Cash App</label>
                  <input
                    type="text"
                    name="cashapp"
                    value={formData.cashapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="$kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><DollarSign size={16} />Venmo</label>
                  <input
                    type="text"
                    name="venmo"
                    value={formData.venmo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.RevolutIcon size={16} />Revolut</label>
                  <input
                    type="text"
                    name="revolut"
                    value={formData.revolut}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.WiseIcon size={16} />Wise</label>
                  <input
                    type="text"
                    name="wise"
                    value={formData.wise}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.PaparaIcon size={16} />Papara</label>
                  <input
                    type="text"
                    name="papara"
                    value={formData.papara}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                    placeholder="Papara No"
                  />
                </div>
              </div>
            </div>

            {/* E-ticaret & Satış Kanalları */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">E-ticaret & Satış Kanalları</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.EtsyIcon size={16} />Etsy</label>
                  <input type="text" name="etsy" value={formData.etsy} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="magaza-adi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.AmazonIcon size={16} />Amazon</label>
                  <input type="text" name="amazon" value={formData.amazon} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza URL" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.EbayIcon size={16} />eBay</label>
                  <input type="text" name="ebay" value={formData.ebay} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.ShopifyIcon size={16} />Shopify</label>
                  <input type="text" name="shopify" value={formData.shopify} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="magaza.myshopify.com" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.TrendyolIcon size={16} />Trendyol</label>
                  <input type="text" name="trendyol" value={formData.trendyol} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.HepsiburadaIcon size={16} />Hepsiburada</label>
                  <input type="text" name="hepsiburada" value={formData.hepsiburada} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.TemuIcon size={16} />Temu</label>
                  <input type="text" name="temu" value={formData.temu} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza URL" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.AliExpressIcon size={16} />AliExpress</label>
                  <input type="text" name="aliexpress" value={formData.aliexpress} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.SahibindenIcon size={16} />Sahibinden</label>
                  <input type="text" name="sahibinden" value={formData.sahibinden} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Profil adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.GittigidiyorIcon size={16} />GittiGidiyor</label>
                  <input type="text" name="gittigidiyor" value={formData.gittigidiyor} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.N11Icon size={16} />N11</label>
                  <input type="text" name="n11" value={formData.n11} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Mağaza adı" />
                </div>
              </div>
            </div>

            {/* Müzik Platformları */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Müzik Platformları</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.SoundCloudIcon size={16} />SoundCloud</label>
                  <input type="text" name="soundcloud" value={formData.soundcloud} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.BandcampIcon size={16} />Bandcamp</label>
                  <input type="text" name="bandcamp" value={formData.bandcamp} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="sanatci" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.AppleMusicIcon size={16} />Apple Music</label>
                  <input type="text" name="applemusic" value={formData.applemusic} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Sanatçı profili" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.DeezerIcon size={16} />Deezer</label>
                  <input type="text" name="deezer" value={formData.deezer} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Sanatçı profili" />
                </div>
              </div>
            </div>

            {/* Video & Streaming */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Video & Streaming</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.VimeoIcon size={16} />Vimeo</label>
                  <input type="text" name="vimeo" value={formData.vimeo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.DailymotionIcon size={16} />Dailymotion</label>
                  <input type="text" name="dailymotion" value={formData.dailymotion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.RumbleIcon size={16} />Rumble</label>
                  <input type="text" name="rumble" value={formData.rumble} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.KickIcon size={16} />Kick</label>
                  <input type="text" name="kick" value={formData.kick} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
              </div>
            </div>

            {/* Profesyonel Ağlar */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Profesyonel Ağlar</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.XingIcon size={16} />Xing</label>
                  <input type="text" name="xing" value={formData.xing} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.AngelListIcon size={16} />AngelList</label>
                  <input type="text" name="angellist" value={formData.angellist} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="kullaniciadi" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.CrunchbaseIcon size={16} />Crunchbase</label>
                  <input type="text" name="crunchbase" value={formData.crunchbase} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="organization/sirket" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.ProductHuntIcon size={16} />Product Hunt</label>
                  <input type="text" name="producthunt" value={formData.producthunt} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="@kullaniciadi" />
                </div>
              </div>
            </div>

            {/* Rezervasyon & Servis */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Rezervasyon & Servis</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.BookingIcon size={16} />Booking.com</label>
                  <input type="text" name="booking" value={formData.booking} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Property ID" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.AirbnbIcon size={16} />Airbnb</label>
                  <input type="text" name="airbnb" value={formData.airbnb} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Listing URL" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.TripAdvisorIcon size={16} />TripAdvisor</label>
                  <input type="text" name="tripadvisor" value={formData.tripadvisor} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="İşletme URL" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.UberIcon size={16} />Uber</label>
                  <input type="text" name="uber" value={formData.uber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Profil" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><PlatformIcons.BoltIcon size={16} />Bolt</label>
                  <input type="text" name="bolt" value={formData.bolt} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Profil" />
                </div>
              </div>
            </div>

            {/* Özel Linkler */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Özel Linkler</h2>
                <button
                  type="button"
                  onClick={addCustomLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm"
                >
                  <Plus size={16} />
                  Ekle
                </button>
              </div>
              
              {customLinks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Henüz link yok. Kendi linklerini ekleyebilirsin.
                </p>
              ) : (
                <div className="space-y-4">
                  {customLinks.map((link) => (
                    <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Başlık</label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateCustomLink(link.id, 'title', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                            placeholder="Portfolyo, Blog, vs."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateCustomLink(link.id, 'url', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {link.icon ? (
                            <Image 
                              src={link.icon} 
                              alt="Icon" 
                              width={48} 
                              height={48}
                              className="rounded-lg border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Upload size={20} className="text-gray-400" />
                            </div>
                          )}
                          <label className="cursor-pointer">
                            <div className="text-sm text-blue-600 hover:underline">
                              {link.icon ? 'Değiştir' : 'İkon Yükle'}
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleCustomLinkIconUpload(link.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeCustomLink(link.id)}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-gray-200 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                <Save size={18} />
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {modal.type === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modal.type === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modal.type === 'warning' && (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {modal.type === 'info' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {modal.title}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {modal.message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              {modal.onConfirm ? (
                <>
                  <button
                    onClick={() => {
                      closeModal();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    {modal.cancelText || 'İptal'}
                  </button>
                  <button
                    onClick={() => {
                      modal.onConfirm?.();
                      closeModal();
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg transition font-medium text-white ${
                      modal.type === 'error' || modal.type === 'warning'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {modal.confirmText || 'Tamam'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                >
                  Tamam
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
