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
  Sparkles,
  Menu,
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
  Calendar,
  Pen,
  CreditCard,
  Dribbble,
  MoreVertical
} from 'lucide-react';
import * as PlatformIcons from '@/components/PlatformIcons';
import { cardDb } from '@/lib/supabase-cards';
import CardSidebar from '../components/CardSidebar';

interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  platform?: string;
}

interface SocialLinkItem {
  id: string;
  value: string;
  title: string;
}

interface SocialMediaState {
  [key: string]: SocialLinkItem[];
}

const SOCIAL_PLATFORMS = [
  // Sosyal Medya
  { id: 'instagram', label: 'Instagram', icon: Instagram, prefix: 'instagram.com/', category: 'Sosyal Medya' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, prefix: 'facebook.com/', category: 'Sosyal Medya' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, prefix: 'twitter.com/', category: 'Sosyal Medya' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, prefix: 'linkedin.com/in/', category: 'Sosyal Medya' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, prefix: 'youtube.com/', category: 'Sosyal Medya' },
  { id: 'tiktok', label: 'TikTok', icon: PlatformIcons.TiktokIcon, prefix: 'tiktok.com/@', category: 'Sosyal Medya' },
  { id: 'snapchat', label: 'Snapchat', icon: PlatformIcons.SnapchatIcon, prefix: 'snapchat.com/add/', category: 'Sosyal Medya' },
  { id: 'pinterest', label: 'Pinterest', icon: PlatformIcons.PinterestIcon, prefix: 'pinterest.com/', category: 'Sosyal Medya' },
  { id: 'reddit', label: 'Reddit', icon: PlatformIcons.RedditIcon, prefix: 'reddit.com/user/', category: 'Sosyal Medya' },
  { id: 'twitch', label: 'Twitch', icon: PlatformIcons.TwitchIcon, prefix: 'twitch.tv/', category: 'Sosyal Medya' },
  { id: 'discord', label: 'Discord', icon: PlatformIcons.DiscordIcon, prefix: '', placeholder: 'kullanici#1234', category: 'Sosyal Medya' },
  { id: 'spotify', label: 'Spotify', icon: PlatformIcons.SpotifyIcon, prefix: 'open.spotify.com/user/', category: 'Sosyal Medya' },
  { id: 'threads', label: 'Threads', icon: PlatformIcons.ThreadsIcon, prefix: 'threads.net/@', category: 'Sosyal Medya' },
  { id: 'clubhouse', label: 'Clubhouse', icon: PlatformIcons.ClubhouseIcon, prefix: 'clubhouse.com/@', category: 'Sosyal Medya' },

  // Mesajlaşma
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, prefix: '', placeholder: '+905555555555', category: 'Mesajlaşma' },
  { id: 'telegram', label: 'Telegram', icon: Send, prefix: 't.me/', category: 'Mesajlaşma' },
  { id: 'signal', label: 'Signal', icon: MessageCircle, prefix: '', placeholder: '+905555555555', category: 'Mesajlaşma' },
  { id: 'viber', label: 'Viber', icon: Phone, prefix: '', placeholder: '+905555555555', category: 'Mesajlaşma' },
  { id: 'wechat', label: 'WeChat', icon: PlatformIcons.WeChatIcon, prefix: '', placeholder: 'ID', category: 'Mesajlaşma' },
  { id: 'line', label: 'LINE', icon: PlatformIcons.LineIcon, prefix: '', placeholder: 'ID', category: 'Mesajlaşma' },

  // Profesyonel
  { id: 'github', label: 'GitHub', icon: Github, prefix: 'github.com/', category: 'Profesyonel' },
  { id: 'gitlab', label: 'GitLab', icon: PlatformIcons.GitLabIcon, prefix: 'gitlab.com/', category: 'Profesyonel' },
  { id: 'behance', label: 'Behance', icon: PlatformIcons.BehanceIcon, prefix: 'behance.net/', category: 'Profesyonel' },
  { id: 'dribbble', label: 'Dribbble', icon: Dribbble, prefix: 'dribbble.com/', category: 'Profesyonel' },
  { id: 'medium', label: 'Medium', icon: Pen, prefix: 'medium.com/@', category: 'Profesyonel' },
  { id: 'devto', label: 'Dev.to', icon: PlatformIcons.DevToIcon, prefix: 'dev.to/', category: 'Profesyonel' },
  { id: 'stackoverflow', label: 'Stack Overflow', icon: PlatformIcons.StackOverflowIcon, prefix: 'stackoverflow.com/users/', category: 'Profesyonel' },
  { id: 'figma', label: 'Figma', icon: PlatformIcons.FigmaIcon, prefix: 'figma.com/@', category: 'Profesyonel' },
  { id: 'notion', label: 'Notion', icon: PlatformIcons.NotionIcon, prefix: '', placeholder: 'Workspace URL', category: 'Profesyonel' },
  { id: 'calendly', label: 'Calendly', icon: Calendar, prefix: 'calendly.com/', category: 'Profesyonel' },
  { id: 'linktree', label: 'Linktree', icon: Link2, prefix: 'linktr.ee/', category: 'Profesyonel' },
  { id: 'substack', label: 'Substack', icon: PlatformIcons.SubstackIcon, prefix: '', suffix: '.substack.com', category: 'Profesyonel' },
  { id: 'patreon', label: 'Patreon', icon: PlatformIcons.PatreonIcon, prefix: 'patreon.com/', category: 'Profesyonel' },
  { id: 'kofi', label: 'Ko-fi', icon: PlatformIcons.KoFiIcon, prefix: 'ko-fi.com/', category: 'Profesyonel' },
  { id: 'buymeacoffee', label: 'Buy Me a Coffee', icon: PlatformIcons.BuyMeACoffeeIcon, prefix: 'buymeacoffee.com/', category: 'Profesyonel' },

  // Ödeme
  { id: 'iban', label: 'IBAN', icon: DollarSign, prefix: '', placeholder: 'TR00 0000 0000 0000 0000 0000 00', category: 'Ödeme Bilgileri' },
  { id: 'paypal', label: 'PayPal', icon: CreditCard, prefix: 'paypal.me/', category: 'Ödeme Bilgileri' },
  { id: 'cashapp', label: 'Cash App', icon: DollarSign, prefix: 'cash.app/$', category: 'Ödeme Bilgileri' },
  { id: 'venmo', label: 'Venmo', icon: DollarSign, prefix: 'venmo.com/', category: 'Ödeme Bilgileri' },
  { id: 'revolut', label: 'Revolut', icon: PlatformIcons.RevolutIcon, prefix: 'revolut.me/', category: 'Ödeme Bilgileri' },
  { id: 'wise', label: 'Wise', icon: PlatformIcons.WiseIcon, prefix: '', placeholder: 'email@example.com', category: 'Ödeme Bilgileri' },
  { id: 'papara', label: 'Papara', icon: PlatformIcons.PaparaIcon, prefix: '', placeholder: 'Papara No', category: 'Ödeme Bilgileri' },

  // E-ticaret
  { id: 'etsy', label: 'Etsy', icon: PlatformIcons.EtsyIcon, prefix: 'etsy.com/shop/', category: 'E-ticaret & Satış Kanalları' },
  { id: 'amazon', label: 'Amazon', icon: PlatformIcons.AmazonIcon, prefix: '', placeholder: 'Mağaza URL', category: 'E-ticaret & Satış Kanalları' },
  { id: 'ebay', label: 'eBay', icon: PlatformIcons.EbayIcon, prefix: 'ebay.com/usr/', category: 'E-ticaret & Satış Kanalları' },
  { id: 'shopify', label: 'Shopify', icon: PlatformIcons.ShopifyIcon, prefix: '', suffix: '.myshopify.com', category: 'E-ticaret & Satış Kanalları' },
  { id: 'trendyol', label: 'Trendyol', icon: PlatformIcons.TrendyolIcon, prefix: 'trendyol.com/magaza/', category: 'E-ticaret & Satış Kanalları' },
  { id: 'hepsiburada', label: 'Hepsiburada', icon: PlatformIcons.HepsiburadaIcon, prefix: 'hepsiburada.com/magaza/', category: 'E-ticaret & Satış Kanalları' },
  { id: 'temu', label: 'Temu', icon: PlatformIcons.TemuIcon, prefix: '', placeholder: 'Mağaza URL', category: 'E-ticaret & Satış Kanalları' },
  { id: 'aliexpress', label: 'AliExpress', icon: PlatformIcons.AliExpressIcon, prefix: 'aliexpress.com/store/', category: 'E-ticaret & Satış Kanalları' },
  { id: 'sahibinden', label: 'Sahibinden', icon: PlatformIcons.SahibindenIcon, prefix: '', suffix: '.sahibinden.com', category: 'E-ticaret & Satış Kanalları' },
  { id: 'gittigidiyor', label: 'GittiGidiyor', icon: PlatformIcons.GittigidiyorIcon, prefix: '', placeholder: 'Mağaza adı', category: 'E-ticaret & Satış Kanalları' },
  { id: 'n11', label: 'N11', icon: PlatformIcons.N11Icon, prefix: 'n11.com/magaza/', category: 'E-ticaret & Satış Kanalları' },

  // Müzik
  { id: 'soundcloud', label: 'SoundCloud', icon: PlatformIcons.SoundCloudIcon, prefix: 'soundcloud.com/', category: 'Müzik Platformları' },
  { id: 'bandcamp', label: 'Bandcamp', icon: PlatformIcons.BandcampIcon, prefix: '', suffix: '.bandcamp.com', category: 'Müzik Platformları' },
  { id: 'applemusic', label: 'Apple Music', icon: PlatformIcons.AppleMusicIcon, prefix: '', placeholder: 'Sanatçı profili', category: 'Müzik Platformları' },
  { id: 'deezer', label: 'Deezer', icon: PlatformIcons.DeezerIcon, prefix: '', placeholder: 'Sanatçı profili', category: 'Müzik Platformları' },

  // Video
  { id: 'vimeo', label: 'Vimeo', icon: PlatformIcons.VimeoIcon, prefix: 'vimeo.com/', category: 'Video & Streaming' },
  { id: 'dailymotion', label: 'Dailymotion', icon: PlatformIcons.DailymotionIcon, prefix: 'dailymotion.com/', category: 'Video & Streaming' },
  { id: 'rumble', label: 'Rumble', icon: PlatformIcons.RumbleIcon, prefix: 'rumble.com/c/', category: 'Video & Streaming' },
  { id: 'kick', label: 'Kick', icon: PlatformIcons.KickIcon, prefix: 'kick.com/', category: 'Video & Streaming' },

  // Profesyonel Ağlar
  { id: 'xing', label: 'Xing', icon: PlatformIcons.XingIcon, prefix: 'xing.com/profile/', category: 'Profesyonel Ağlar' },
  { id: 'angellist', label: 'AngelList', icon: PlatformIcons.AngelListIcon, prefix: 'angel.co/', category: 'Profesyonel Ağlar' },
  { id: 'crunchbase', label: 'Crunchbase', icon: PlatformIcons.CrunchbaseIcon, prefix: 'crunchbase.com/', category: 'Profesyonel Ağlar' },
  { id: 'producthunt', label: 'Product Hunt', icon: PlatformIcons.ProductHuntIcon, prefix: 'producthunt.com/@', category: 'Profesyonel Ağlar' },

  // Rezervasyon
  { id: 'booking', label: 'Booking.com', icon: PlatformIcons.BookingIcon, prefix: '', placeholder: 'Property ID', category: 'Rezervasyon & Servis' },
  { id: 'airbnb', label: 'Airbnb', icon: PlatformIcons.AirbnbIcon, prefix: '', placeholder: 'Listing URL', category: 'Rezervasyon & Servis' },
  { id: 'tripadvisor', label: 'TripAdvisor', icon: PlatformIcons.TripAdvisorIcon, prefix: '', placeholder: 'İşletme URL', category: 'Rezervasyon & Servis' },
  { id: 'uber', label: 'Uber', icon: PlatformIcons.UberIcon, prefix: '', placeholder: 'Profil', category: 'Rezervasyon & Servis' },
  { id: 'bolt', label: 'Bolt', icon: PlatformIcons.BoltIcon, prefix: '', placeholder: 'Profil', category: 'Rezervasyon & Servis' },
];

// Kategorileri grupla
const CATEGORIES = Array.from(new Set(SOCIAL_PLATFORMS.map(p => p.category)));

export default function CardSetupPage() {
  const router = useRouter();
  const { currentCard, isOwner, updateCard, logoutFromCard } = useCard();
  
  const [profileImage, setProfileImage] = useState<string>('');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [usernameError, setUsernameError] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Sosyal Medya Linkleri State'i
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaState>({});

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
    // İletişim
    email: '',
    phone: '',
    website: '',
    location: '',
  });

  useEffect(() => {
    if (!currentCard || !isOwner) {
      router.push('/card/login');
      return;
    }

    // Temel bilgileri yükle
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
    });
    
    setProfileImage(currentCard.profileImage || '');
    setCustomLinks(currentCard.customLinks?.filter(link => !link.platform) || []); // Platformu olmayanlar gerçek custom linktir

    // Sosyal medya linklerini yükle
    const initialSocialLinks: SocialMediaState = {};
    
    SOCIAL_PLATFORMS.forEach(platform => {
      const links: SocialLinkItem[] = [];
      
      // 1. Sabit sütundan gelen veri
      const mainValue = (currentCard as any)[platform.id];
      if (mainValue) {
        links.push({
          id: `main-${platform.id}`,
          value: mainValue,
          title: '' // Sabit sütunda başlık yok
        });
      }
      
      // 2. customLinks içinden gelen platform verileri
      if (currentCard.customLinks) {
        const platformLinks = currentCard.customLinks.filter(link => link.platform === platform.id);
        platformLinks.forEach(link => {
          // Eğer sabit sütundaki değerle aynıysa ekleme (duplicate önleme)
          if (!links.some(l => l.value === link.url)) {
             links.push({
              id: link.id,
              value: link.url,
              title: link.title
            });
          } else {
            // Eğer varsa ve başlığı varsa güncelle
            const existing = links.find(l => l.value === link.url);
            if (existing) existing.title = link.title;
          }
        });
      }
      
      if (links.length > 0) {
        initialSocialLinks[platform.id] = links;
      }
    });
    
    setSocialMediaLinks(initialSocialLinks);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'username') {
      setUsernameError('');
    }
  };

  // Sosyal Medya İşlemleri
  const addSocialLink = (platformId: string) => {
    setSocialMediaLinks(prev => {
      const currentLinks = prev[platformId] || [];
      return {
        ...prev,
        [platformId]: [
          ...currentLinks,
          { id: `new-${Date.now()}`, value: '', title: '' }
        ]
      };
    });
  };

  const updateSocialLink = (platformId: string, id: string, field: 'value' | 'title', value: string) => {
    setSocialMediaLinks(prev => {
      const currentLinks = prev[platformId] || [];
      return {
        ...prev,
        [platformId]: currentLinks.map(link => 
          link.id === id ? { ...link, [field]: value } : link
        )
      };
    });
  };

  const removeSocialLink = (platformId: string, id: string) => {
    setSocialMediaLinks(prev => {
      const currentLinks = prev[platformId] || [];
      const filtered = currentLinks.filter(link => link.id !== id);
      if (filtered.length === 0) {
        const newState = { ...prev };
        delete newState[platformId];
        return newState;
      }
      return { ...prev, [platformId]: filtered };
    });
  };

  // Kullanıcı adı kontrolü
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username.trim();
      
      if (!username || username === currentCard?.username) {
        setUsernameError('');
        return;
      }
      
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (isSaving) return; // Çift tıklamayı önle
    
    if (usernameError) {
      showModal('error', 'Geçersiz Kullanıcı Adı', usernameError);
      return;
    }
    
    if (isCheckingUsername) {
      showModal('warning', 'Lütfen Bekleyin', 'Kullanıcı adı kontrol ediliyor...');
      return;
    }
    
    setIsSaving(true);
    
    if (formData.username && formData.username !== currentCard?.username) {
      const isAvailable = await cardDb.checkUsernameAvailability(formData.username, currentCard?.id);
      if (!isAvailable) {
        setUsernameError('Bu kullanıcı adı zaten kullanılıyor');
        showModal('error', 'Kullanıcı Adı Kullanımda', 'Bu kullanıcı adı zaten başka bir kart tarafından kullanılıyor.');
        setIsSaving(false);
        return;
      }
    }

    // Sosyal medya linklerini işle
    const socialMediaUpdates: any = {};
    const newCustomLinks = [...customLinks]; // Mevcut custom linkler

    // Validasyon kontrolü: Çoklu link varsa başlık zorunlu
    for (const platform of SOCIAL_PLATFORMS) {
      const links = socialMediaLinks[platform.id] || [];
      // Boş value olanları filtrele
      const validLinks = links.filter(l => l.value.trim() !== '');
      
      if (validLinks.length > 1) {
        const missingTitle = validLinks.some(l => !l.title.trim());
        if (missingTitle) {
          showModal('error', 'Eksik Bilgi', `${platform.label} için birden fazla link eklediğinizde, her biri için açıklama girmelisiniz.`);
          return;
        }
      }
    }

    // Veriyi hazırla
    for (const platform of SOCIAL_PLATFORMS) {
      const links = socialMediaLinks[platform.id] || [];
      const validLinks = links.filter(l => l.value.trim() !== '');

      if (validLinks.length === 0) {
        socialMediaUpdates[platform.id] = '';
      } else if (validLinks.length === 1 && !validLinks[0].title.trim()) {
        // Tek link ve başlıksız -> Ana sütuna yaz
        socialMediaUpdates[platform.id] = validLinks[0].value;
      } else {
        // Çoklu link veya başlıklı tek link -> customLinks'e ekle
        socialMediaUpdates[platform.id] = ''; // Ana sütunu boşalt
        validLinks.forEach(link => {
          newCustomLinks.push({
            id: link.id.startsWith('new') ? Date.now().toString() + Math.random() : link.id,
            title: link.title || platform.label, // Başlık yoksa platform adı
            url: link.value,
            platform: platform.id
          });
        });
      }
    }
    
    try {
      const success = await updateCard({
        ...formData,
        ...socialMediaUpdates,
        profileImage,
        customLinks: newCustomLinks
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
    } catch (error) {
      console.error('Save error:', error);
      showModal('error', 'Hata!', 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
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

  if (!currentCard || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <CardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout}
      />

      <div className="w-full flex-1 overflow-auto flex flex-col">
        <div className="lg:hidden p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-30">
          <h1 className="text-lg font-bold">Kart Ayarları</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="w-full px-4 lg:px-8 py-6">
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
                      <Image src={profileImage} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={36} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="w-full flex-1">
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm">
                      <Upload size={16} />
                      <span>Resim Yükle</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG veya GIF. Max 2MB.</p>
                  {profileImage && (
                    <button type="button" onClick={() => setProfileImage('')} className="text-red-600 text-xs mt-1.5 hover:underline">Kaldır</button>
                  )}
                </div>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Temel Bilgiler</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kullanıcı Adı *</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-gray-500">notouchness.com/</span>
                    <div className="w-full flex-1 relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900 ${usernameError ? 'border-red-500' : 'border-gray-200'}`}
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
                  {usernameError && <p className="mt-1 text-sm text-red-500">{usernameError}</p>}
                  {!usernameError && formData.username && formData.username !== currentCard?.username && !isCheckingUsername && (
                    <p className="mt-1 text-sm text-green-600">✓ Kullanıcı adı kullanılabilir</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Ad Soyad" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ünvan</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Ünvan" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Briefcase size={16} /> Şirket</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Şirket" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><MapPin size={16} /> Konum</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Konum" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hakkında</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="Kendinden kısaca bahset..." />
                </div>
              </div>
            </div>

            {/* İletişim */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">İletişim</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Mail size={16} /> E-posta</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Phone size={16} /> Telefon</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="+90 555 555 55 55" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5"><Globe size={16} /> Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900" placeholder="https://example.com" />
                </div>
              </div>
            </div>

            {/* Dinamik Sosyal Medya Bölümleri */}
            {CATEGORIES.map(category => (
              <div key={category} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">{category}</h2>
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                  {SOCIAL_PLATFORMS.filter(p => p.category === category).map(platform => {
                    const links = socialMediaLinks[platform.id] || [];
                    // Varsayılan boş link göster (eğer hiç yoksa)
                    const displayLinks = links.length > 0 ? links : [{ id: `default-${platform.id}`, value: '', title: '' }];
                    const Icon = platform.icon;

                    return (
                      <div key={platform.id} className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <Icon size={16} /> {platform.label}
                        </label>
                        
                        {displayLinks.map((link, index) => (
                          <div key={link.id} className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              {platform.prefix && <span className="text-gray-500 text-sm whitespace-nowrap">{platform.prefix}</span>}
                              <input
                                type="text"
                                value={link.value}
                                onChange={(e) => {
                                  if (links.length === 0) {
                                    // İlk kez veri giriliyorsa state'e ekle
                                    setSocialMediaLinks(prev => ({
                                      ...prev,
                                      [platform.id]: [{ id: `new-${Date.now()}`, value: e.target.value, title: '' }]
                                    }));
                                  } else {
                                    updateSocialLink(platform.id, link.id, 'value', e.target.value);
                                  }
                                }}
                                className={`w-full flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-base focus:border-transparent text-gray-900 ${platform.prefix ? '' : 'text-left'} ${platform.suffix ? 'text-right' : ''}`}
                                placeholder={platform.placeholder || 'kullaniciadi'}
                              />
                              {platform.suffix && <span className="text-gray-500 text-sm whitespace-nowrap">{platform.suffix}</span>}
                            </div>
                            
                            {/* Çoklu link veya isteğe bağlı başlık */}
                            {(links.length > 1 || link.title) && (
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateSocialLink(platform.id, link.id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-black text-sm text-gray-900"
                                placeholder="Açıklama (Örn: Kişisel Hesabım)"
                              />
                            )}

                            {/* Sil Butonu (sadece çoklu ise veya değer varsa) */}
                            {links.length > 0 && (
                              <button 
                                type="button"
                                onClick={() => removeSocialLink(platform.id, link.id)}
                                className="text-xs text-red-500 hover:text-red-700 self-end"
                              >
                                Kaldır
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => addSocialLink(platform.id)}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 self-start"
                        >
                          <Plus size={14} /> Başka Ekle
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

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
          <div className="fixed bottom-0 lg:left-60 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{modal.title}</h3>
            <p className="text-gray-600 text-center mb-6">{modal.message}</p>
            <div className="flex gap-3">
              {modal.onConfirm ? (
                <>
                  <button onClick={closeModal} className="w-full flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">{modal.cancelText || 'İptal'}</button>
                  <button onClick={() => { modal.onConfirm?.(); closeModal(); }} className={`flex-1 px-4 py-2.5 rounded-lg transition font-medium text-white ${modal.type === 'error' || modal.type === 'warning' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}>{modal.confirmText || 'Tamam'}</button>
                </>
              ) : (
                <button onClick={closeModal} className="w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium">Tamam</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
