/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cardDb } from '@/lib/supabase-cards';
import Image from 'next/image';
import { 
  Mail, Phone, Globe, MapPin,
  Instagram, Linkedin, Twitter, Facebook, Youtube,
  MessageCircle, Send, Github, Link2,
  Music, Video,
  MoreVertical,
  ShoppingBag, DollarSign, CreditCard,
  Ghost, Pin, AtSign, Gamepad2, Code, Dribbble, Palette, FileText,
  type LucideIcon,
  Copy
} from 'lucide-react';
import type { CardProfile } from '@/app/context/CardContext';
import * as PlatformIcons from '@/components/PlatformIcons';

// Özel SVG İkon Bileşenleri
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WhatsappIcon = ({ color, size, style }: { color?: string, size?: number | string, style?: any }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 32 32" 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg" 
    fill={color || 'currentColor'}
    style={style}
  >
    <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path>
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TelegramIcon = ({ color, size, style }: { color?: string, size?: number | string, style?: any }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path d="M12 4C10.4178 4 8.87103 4.46919 7.55544 5.34824C6.23985 6.22729 5.21447 7.47672 4.60897 8.93853C4.00347 10.4003 3.84504 12.0089 4.15372 13.5607C4.4624 15.1126 5.22433 16.538 6.34315 17.6569C7.46197 18.7757 8.88743 19.5376 10.4393 19.8463C11.9911 20.155 13.5997 19.9965 15.0615 19.391C16.5233 18.7855 17.7727 17.7602 18.6518 16.4446C19.5308 15.129 20 13.5823 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4ZM15.93 9.48L14.62 15.67C14.52 16.11 14.26 16.21 13.89 16.01L11.89 14.53L10.89 15.46C10.8429 15.5215 10.7824 15.5715 10.7131 15.6062C10.6438 15.6408 10.5675 15.6592 10.49 15.66L10.63 13.66L14.33 10.31C14.5 10.17 14.33 10.09 14.09 10.23L9.55 13.08L7.55 12.46C7.12 12.33 7.11 12.03 7.64 11.83L15.35 8.83C15.73 8.72 16.05 8.94 15.93 9.48Z" fill={color || 'currentColor'}></path>
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IbanIcon = ({ color, size, style }: { color?: string, size?: number | string, style?: any }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M11.948 1.25H12.052C12.9505 1.24997 13.6997 1.24995 14.2945 1.32991C14.9223 1.41432 15.4891 1.59999 15.9445 2.05546C16.4 2.51093 16.5857 3.07773 16.6701 3.70552C16.7292 4.14512 16.7446 4.66909 16.7486 5.27533C17.3971 5.29614 17.9752 5.33406 18.489 5.40314C19.6614 5.56076 20.6104 5.89288 21.3588 6.64124C22.1071 7.38961 22.4392 8.33856 22.5969 9.51098C22.75 10.6502 22.75 12.1058 22.75 13.9436V14.0564C22.75 15.8942 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0564 22.75H9.94359C8.10583 22.75 6.65019 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V13.9436C1.24998 12.1058 1.24997 10.6502 1.40314 9.51098C1.56076 8.33856 1.89288 7.38961 2.64124 6.64124C3.38961 5.89288 4.33856 5.56076 5.51098 5.40314C6.02475 5.33406 6.60288 5.29614 7.2514 5.27533C7.2554 4.66909 7.27081 4.14512 7.32991 3.70552C7.41432 3.07773 7.59999 2.51093 8.05546 2.05546C8.51093 1.59999 9.07773 1.41432 9.70552 1.32991C10.3003 1.24995 11.0495 1.24997 11.948 1.25ZM8.7518 5.25178C9.12993 5.24999 9.52694 5.25 9.94358 5.25H14.0564C14.4731 5.25 14.8701 5.24999 15.2482 5.25178C15.244 4.68146 15.23 4.25125 15.1835 3.90539C15.1214 3.44393 15.0142 3.24644 14.8839 3.11612C14.7536 2.9858 14.5561 2.87858 14.0946 2.81654C13.6116 2.7516 12.964 2.75 12 2.75C11.036 2.75 10.3884 2.7516 9.90539 2.81654C9.44393 2.87858 9.24643 2.9858 9.11612 3.11612C8.9858 3.24644 8.87858 3.44393 8.81654 3.90539C8.77004 4.25125 8.75601 4.68146 8.7518 5.25178ZM5.71085 6.88976C4.70476 7.02503 4.12511 7.2787 3.7019 7.70191C3.27869 8.12511 3.02502 8.70476 2.88976 9.71085C2.75159 10.7385 2.75 12.0932 2.75 14C2.75 15.9068 2.75159 17.2615 2.88976 18.2892C3.02502 19.2952 3.27869 19.8749 3.7019 20.2981C4.12511 20.7213 4.70476 20.975 5.71085 21.1102C6.73851 21.2484 8.09318 21.25 10 21.25H14C15.9068 21.25 17.2615 21.2484 18.2892 21.1102C19.2952 20.975 19.8749 20.7213 20.2981 20.2981C20.7213 19.8749 20.975 19.2952 21.1102 18.2892C21.2484 17.2615 21.25 15.9068 21.25 14C21.25 12.0932 21.2484 10.7385 21.1102 9.71085C20.975 8.70476 20.7213 8.12511 20.2981 7.70191C19.8749 7.2787 19.2952 7.02503 18.2892 6.88976C17.2615 6.7516 15.9068 6.75 14 6.75H10C8.09318 6.75 6.73851 6.7516 5.71085 6.88976ZM12 9.25C12.4142 9.25 12.75 9.58579 12.75 10V10.0102C13.8388 10.2845 14.75 11.143 14.75 12.3333C14.75 12.7475 14.4142 13.0833 14 13.0833C13.5858 13.0833 13.25 12.7475 13.25 12.3333C13.25 11.9493 12.8242 11.4167 12 11.4167C11.1758 11.4167 10.75 11.9493 10.75 12.3333C10.75 12.7174 11.1758 13.25 12 13.25C13.3849 13.25 14.75 14.2098 14.75 15.6667C14.75 16.857 13.8388 17.7155 12.75 17.9898V18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18V17.9898C10.1612 17.7155 9.25 16.857 9.25 15.6667C9.25 15.2525 9.58579 14.9167 10 14.9167C10.4142 14.9167 10.75 15.2525 10.75 15.6667C10.75 16.0507 11.1758 16.5833 12 16.5833C12.8242 16.5833 13.25 16.0507 13.25 15.6667C13.25 15.2826 12.8242 14.75 12 14.75C10.6151 14.75 9.25 13.7903 9.25 12.3333C9.25 11.143 10.1612 10.2845 11.25 10.0102V10C11.25 9.58579 11.5858 9.25 12 9.25Z" fill={color || 'currentColor'}></path>
  </svg>
);

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.username as string;
  const [card, setCard] = useState<CardProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      try {
        // Önce username ile dene
        let foundCard = await cardDb.getByUsername(identifier);
        
        // Username ile bulunamadıysa hash ile dene
        if (!foundCard) {
          foundCard = await cardDb.getByHash(identifier);
        }
        
        if (foundCard && foundCard.isActive) {
          console.log('Card loaded:', foundCard);
          setCard(foundCard);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading card:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadCard();
  }, [identifier, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (!card) return null;

  // Theme colors
  const bgColor = card.backgroundColor || card.primaryColor || '#dc2626';
  const containerBg = card.containerBackgroundColor || '#ffffff';
  const textColor = card.textColor || '#111827';
  const gridCols = card.gridCols || 3;
  const avatarPos = card.avatarPosition || 'above';
  
  // Editor settings
  const avatarShape = (card as any).avatarShape || 'round';
  const avatarSize = (card as any).avatarSize || '128';
  const avatarBorderWidth = (card as any).avatarBorderWidth || '4';
  const avatarBorderColor = (card as any).avatarBorderColor || '#ffffff';
  const avatarVerticalOffset = (card as any).avatarVerticalOffset || '50';
  const coverUrl = card.coverUrl || '';
  const coverHeight = (card as any).coverHeight || '200';
  const containerBorderRadius = (card as any).containerBorderRadius || '24';
  const containerShadow = (card as any).containerShadow || '2xl';
  const iconSize = (card as any).iconSize || '24';
  const iconColor = (card as any).iconColor || textColor;
  const iconSpacing = (card as any).iconSpacing || '12';
  const iconBorderRadius = (card as any).iconBorderRadius || '12';
  const iconBackground = (card as any).iconBackground || 'transparent';
  const fontFamily = (card as any).fontFamily || 'Poppins';
  const headingFontSize = (card as any).headingFontSize || '2rem';
  const bodyFontSize = (card as any).bodyFontSize || '1rem';
  const headingWeight = (card as any).headingWeight || '700';
  const lineHeight = (card as any).lineHeight || '1.5';
  const letterSpacing = (card as any).letterSpacing || '0';
  const logoUrl = (card as any).logoUrl || '';
  const logoSize = (card as any).logoSize || '80';
  const backgroundImage = (card as any).backgroundImage || '';
  
  // Platform icon mapping
  // Type definition for both Lucide icons and custom SVG components
  type IconType = LucideIcon | React.FC<{ color?: string, size?: number | string, style?: any }> | React.FC<{ size?: number, className?: string, color?: string }>;
  
  const getPlatformIcon = (platform: string): IconType => {
    const icons: Record<string, IconType> = {
      // Özel SVG'ler
      whatsapp: WhatsappIcon,
      telegram: TelegramIcon,
      iban: IbanIcon,
      
      // PlatformIcons componentinden gelenler
      spotify: PlatformIcons.SpotifyIcon as IconType,
      behance: PlatformIcons.BehanceIcon as IconType,
      amazon: PlatformIcons.AmazonIcon as IconType,
      tiktok: PlatformIcons.TiktokIcon as IconType,
      snapchat: PlatformIcons.SnapchatIcon as IconType,
      reddit: PlatformIcons.RedditIcon as IconType,
      discord: PlatformIcons.DiscordIcon as IconType,
      pinterest: PlatformIcons.PinterestIcon as IconType,
      twitch: PlatformIcons.TwitchIcon as IconType,
      threads: PlatformIcons.ThreadsIcon as IconType,
      
      // Mevcut Lucide İkonları
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook,
      youtube: Youtube,
      github: Github,
      
      // Yeni Eklenenler (Lucide İkonları ile)
      // Mesajlaşma
      signal: MessageCircle,
      viber: Phone,
      wechat: PlatformIcons.WeChatIcon as IconType,
      line: PlatformIcons.LineIcon as IconType,
      
      // E-ticaret & Satış
      etsy: PlatformIcons.EtsyIcon as IconType,
      ebay: PlatformIcons.EbayIcon as IconType,
      shopify: PlatformIcons.ShopifyIcon as IconType,
      trendyol: PlatformIcons.TrendyolIcon as IconType,
      hepsiburada: PlatformIcons.HepsiburadaIcon as IconType,
      temu: PlatformIcons.TemuIcon as IconType,
      aliexpress: PlatformIcons.AliExpressIcon as IconType,
      sahibinden: PlatformIcons.SahibindenIcon as IconType,
      gittigidiyor: PlatformIcons.GittigidiyorIcon as IconType,
      n11: PlatformIcons.N11Icon as IconType,
      
      // Ödeme
      paypal: CreditCard,
      cashapp: DollarSign,
      venmo: DollarSign,
      revolut: PlatformIcons.RevolutIcon as IconType,
      wise: PlatformIcons.WiseIcon as IconType,
      papara: PlatformIcons.PaparaIcon as IconType,
      
      // Müzik & Video
      soundcloud: PlatformIcons.SoundCloudIcon as IconType,
      bandcamp: PlatformIcons.BandcampIcon as IconType,
      applemusic: PlatformIcons.AppleMusicIcon as IconType,
      deezer: PlatformIcons.DeezerIcon as IconType,
      vimeo: PlatformIcons.VimeoIcon as IconType,
      dailymotion: PlatformIcons.DailymotionIcon as IconType,
      rumble: PlatformIcons.RumbleIcon as IconType,
      kick: PlatformIcons.KickIcon as IconType,
      
      // Sosyal & Diğer
      clubhouse: PlatformIcons.ClubhouseIcon as IconType,
      
      // Profesyonel
      gitlab: PlatformIcons.GitLabIcon as IconType,
      dribbble: Dribbble,
      medium: FileText,
      devto: PlatformIcons.DevToIcon as IconType,
      stackoverflow: PlatformIcons.StackOverflowIcon as IconType,
      figma: PlatformIcons.FigmaIcon as IconType,
      notion: PlatformIcons.NotionIcon as IconType,
      calendly: FileText,
      linktree: Link2,
      substack: PlatformIcons.SubstackIcon as IconType,
      patreon: PlatformIcons.PatreonIcon as IconType,
      kofi: PlatformIcons.KoFiIcon as IconType,
      buymeacoffee: PlatformIcons.BuyMeACoffeeIcon as IconType,
      
      // Profesyonel Ağlar
      xing: PlatformIcons.XingIcon as IconType,
      angellist: PlatformIcons.AngelListIcon as IconType,
      crunchbase: PlatformIcons.CrunchbaseIcon as IconType,
      producthunt: PlatformIcons.ProductHuntIcon as IconType,
      
      // Rezervasyon
      booking: PlatformIcons.BookingIcon as IconType,
      airbnb: PlatformIcons.AirbnbIcon as IconType,
      tripadvisor: PlatformIcons.TripAdvisorIcon as IconType,
      uber: PlatformIcons.UberIcon as IconType,
      bolt: PlatformIcons.BoltIcon as IconType,
    };
    
    return icons[platform.toLowerCase()] || Link2;
  };

  // Buton arka plan rengi, font boyutu ve border radius
  const buttonBackgroundColor = (card as any).buttonBackgroundColor || '#000000';
  const buttonFontSize = (card as any).buttonFontSize || '0.95rem';
  const buttonBorderRadius = (card as any).buttonBorderRadius || '999';

  // Collect all social links
  const socialLinks: Array<{ platform: string; url: string; icon: IconType }> = [];
  
  // Social media platforms
  const platforms = [
    // Mevcutlar
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
    
    // Yeni Eklenenler - Mesajlaşma
    { key: 'signal', value: card.signal, urlPattern: (v: string) => `https://signal.me/#p/${v}` }, // URL pattern tahmini
    { key: 'viber', value: card.viber, urlPattern: (v: string) => `viber://chat?number=${v}` },
    { key: 'wechat', value: card.wechat, urlPattern: (v: string) => v }, // WeChat genellikle ID
    { key: 'line', value: card.line, urlPattern: (v: string) => `https://line.me/ti/p/~${v}` },
    
    // E-ticaret & Satış
    { key: 'etsy', value: card.etsy, urlPattern: (v: string) => `https://www.etsy.com/shop/${v}` },
    { key: 'amazon', value: card.amazon, urlPattern: (v: string) => v.startsWith('http') ? v : `https://www.amazon.com/s?me=${v}` },
    { key: 'ebay', value: card.ebay, urlPattern: (v: string) => `https://www.ebay.com/usr/${v}` },
    { key: 'shopify', value: card.shopify, urlPattern: (v: string) => v.includes('.') ? (v.startsWith('http') ? v : `https://${v}`) : `https://${v}.myshopify.com` },
    { key: 'trendyol', value: card.trendyol, urlPattern: (v: string) => `https://www.trendyol.com/magaza/${v}` },
    { key: 'hepsiburada', value: card.hepsiburada, urlPattern: (v: string) => `https://www.hepsiburada.com/magaza/${v}` },
    { key: 'temu', value: card.temu, urlPattern: (v: string) => v }, // URL bekleniyor
    { key: 'aliexpress', value: card.aliexpress, urlPattern: (v: string) => v.startsWith('http') ? v : `https://aliexpress.com/store/${v}` },
    { key: 'sahibinden', value: card.sahibinden, urlPattern: (v: string) => `https://${v}.sahibinden.com` },
    { key: 'gittigidiyor', value: card.gittigidiyor, urlPattern: (v: string) => `https://www.gittigidiyor.com/magaza/${v}` }, // Kapandı ama veride varsa dursun
    { key: 'n11', value: card.n11, urlPattern: (v: string) => `https://www.n11.com/magaza/${v}` },
    
    // Ödeme
    { key: 'iban', value: card.iban, urlPattern: (v: string) => v }, // Kopyalama işlemi için özel handle gerekebilir ama şimdilik text
    { key: 'paypal', value: card.paypal, urlPattern: (v: string) => `https://paypal.me/${v}` },
    { key: 'cashapp', value: card.cashapp, urlPattern: (v: string) => `https://cash.app/$${v}` },
    { key: 'venmo', value: card.venmo, urlPattern: (v: string) => `https://venmo.com/${v}` },
    { key: 'revolut', value: card.revolut, urlPattern: (v: string) => `https://revolut.me/${v}` },
    { key: 'wise', value: card.wise, urlPattern: (v: string) => v }, // Genelde email
    { key: 'papara', value: card.papara, urlPattern: (v: string) => v }, // Papara no
    
    // Müzik & Video
    { key: 'soundcloud', value: card.soundcloud, urlPattern: (v: string) => `https://soundcloud.com/${v}` },
    { key: 'bandcamp', value: card.bandcamp, urlPattern: (v: string) => `https://${v}.bandcamp.com` },
    { key: 'applemusic', value: card.applemusic, urlPattern: (v: string) => v }, // URL beklenir
    { key: 'deezer', value: card.deezer, urlPattern: (v: string) => v }, // URL beklenir
    { key: 'vimeo', value: card.vimeo, urlPattern: (v: string) => `https://vimeo.com/${v}` },
    { key: 'dailymotion', value: card.dailymotion, urlPattern: (v: string) => `https://www.dailymotion.com/${v}` },
    { key: 'rumble', value: card.rumble, urlPattern: (v: string) => `https://rumble.com/c/${v}` },
    { key: 'kick', value: card.kick, urlPattern: (v: string) => `https://kick.com/${v}` },
    
    // Sosyal & Diğer
    { key: 'snapchat', value: card.snapchat, urlPattern: (v: string) => `https://www.snapchat.com/add/${v}` },
    { key: 'pinterest', value: card.pinterest, urlPattern: (v: string) => `https://www.pinterest.com/${v}` },
    { key: 'reddit', value: card.reddit, urlPattern: (v: string) => `https://www.reddit.com/user/${v}` },
    { key: 'threads', value: card.threads, urlPattern: (v: string) => `https://www.threads.net/@${v}` },
    { key: 'clubhouse', value: card.clubhouse, urlPattern: (v: string) => `https://www.clubhouse.com/@${v}` },
    
    // Profesyonel
    { key: 'gitlab', value: card.gitlab, urlPattern: (v: string) => `https://gitlab.com/${v}` },
    { key: 'behance', value: card.behance, urlPattern: (v: string) => `https://www.behance.net/${v}` },
    { key: 'dribbble', value: card.dribbble, urlPattern: (v: string) => `https://dribbble.com/${v}` },
    { key: 'medium', value: card.medium, urlPattern: (v: string) => `https://medium.com/@${v}` },
    { key: 'devto', value: card.devto, urlPattern: (v: string) => `https://dev.to/${v}` },
    { key: 'stackoverflow', value: card.stackoverflow, urlPattern: (v: string) => `https://stackoverflow.com/users/${v}` },
    { key: 'figma', value: card.figma, urlPattern: (v: string) => `https://www.figma.com/@${v}` },
    { key: 'notion', value: card.notion, urlPattern: (v: string) => v }, // URL
    { key: 'calendly', value: card.calendly, urlPattern: (v: string) => `https://calendly.com/${v}` },
    { key: 'linktree', value: card.linktree, urlPattern: (v: string) => `https://linktr.ee/${v}` },
    { key: 'substack', value: card.substack, urlPattern: (v: string) => `https://${v}.substack.com` },
    { key: 'patreon', value: card.patreon, urlPattern: (v: string) => `https://www.patreon.com/${v}` },
    { key: 'kofi', value: card.kofi, urlPattern: (v: string) => `https://ko-fi.com/${v}` },
    { key: 'buymeacoffee', value: card.buymeacoffee, urlPattern: (v: string) => `https://www.buymeacoffee.com/${v}` },
    
    // Profesyonel Ağlar
    { key: 'xing', value: card.xing, urlPattern: (v: string) => `https://www.xing.com/profile/${v}` },
    { key: 'angellist', value: card.angellist, urlPattern: (v: string) => `https://angel.co/${v}` },
    { key: 'crunchbase', value: card.crunchbase, urlPattern: (v: string) => `https://www.crunchbase.com/${v}` },
    { key: 'producthunt', value: card.producthunt, urlPattern: (v: string) => `https://www.producthunt.com/@${v}` },
    
    // Rezervasyon
    { key: 'booking', value: card.booking, urlPattern: (v: string) => v }, // URL
    { key: 'airbnb', value: card.airbnb, urlPattern: (v: string) => v }, // URL
    { key: 'tripadvisor', value: card.tripadvisor, urlPattern: (v: string) => v }, // URL
    { key: 'uber', value: card.uber, urlPattern: (v: string) => v }, // URL
    { key: 'bolt', value: card.bolt, urlPattern: (v: string) => v }, // URL
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
      if (link.url) {
        // Eğer platform tanımlıysa (çoklu sosyal medya linki)
        if (link.platform) {
          socialLinks.push({
            platform: link.title || link.platform, // Başlık varsa başlığı, yoksa platform adını kullan
            url: link.url, // Custom linklerde zaten tam URL olmalı
            icon: getPlatformIcon(link.platform)
          });
        } else if (link.title) {
          // Standart custom link
          socialLinks.push({
            platform: link.title,
            url: link.url,
            icon: Link2 // Custom ikon desteği eklenebilir
          });
        }
      }
    });
  }

  // Shadow mapping
  const getShadowStyle = (shadow: string) => {
    switch (shadow) {
      case 'none': return 'none';
      case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
      case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
      case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1)';
      case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1)';
      case '2xl': return '0 25px 50px -12px rgb(0 0 0 / 0.25)';
      default: return '0 25px 50px -12px rgb(0 0 0 / 0.25)';
    }
  };

  // Handle special links like IBAN (copy instead of open)
  const handleLinkClick = (e: React.MouseEvent, link: { platform: string, url: string }) => {
    if (['iban', 'papara', 'wise', 'wechat', 'line'].includes(link.platform)) {
      e.preventDefault();
      navigator.clipboard.writeText(link.url);
      alert(`${link.platform.toUpperCase()} kopyalandı: ${link.url}`);
    }
  };

  // Helper to truncate IBAN if needed
  const formatDisplayValue = (value: string, platform: string) => {
    if (platform === 'iban') {
      // Sadece gösterim için uzun IBAN'ları kırpabiliriz veya olduğu gibi gösterebiliriz
      // Kullanıcı "iban no olarak ne girdiyse o yazsın" dediği için olduğu gibi bırakıyoruz
      // CSS ile taşmayı engelleyeceğiz
      return value;
    }
    return platform;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: backgroundImage ? 'transparent' : bgColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      <div className="relative w-full max-w-md">
        {/* Avatar - Above position (taşan profil resmi) - kapak resmi varsa da çalışır */}
        {card.profileImage && avatarPos === 'above' && (
          <div className="flex justify-center mb-[-60px] relative z-10">
            <div 
              className="relative overflow-hidden shadow-xl"
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
                borderRadius: avatarShape === 'round' ? '50%' :
                             avatarShape === 'square' ? '0' :
                             '16px',
                border: `${avatarBorderWidth}px solid ${avatarBorderColor}`,
              }}
            >
              <Image
                src={card.profileImage}
                alt={card.fullName || 'Profile'}
                width={parseInt(avatarSize)}
                height={parseInt(avatarSize)}
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
            borderRadius: `${containerBorderRadius}px`,
            boxShadow: getShadowStyle(containerShadow),
          }}
        >
          {/* Kapak Resmi */}
          {coverUrl && (
            <div 
              className="w-full relative overflow-hidden"
              style={{ height: `${coverHeight}px` }}
            >
              <Image
                src={coverUrl}
                alt="Cover"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          {/* Avatar Section - Kapak resmi varsa ve cover pozisyonları seçiliyse */}
          {coverUrl && (avatarPos === 'cover-left' || avatarPos === 'cover-center' || avatarPos === 'cover-right') && card.profileImage ? (
            <>
              {/* Avatar - Kapak resminin üzerine çıkabilir - sadece center için */}
              {avatarPos === 'cover-center' && (
                <div 
                  className="relative px-6"
                  style={{ 
                    marginTop: `-${parseInt(avatarSize) * parseInt(avatarVerticalOffset) / 100}px`,
                    marginBottom: 0,
                  }}
                >
                  <div className="flex justify-center">
                    <div 
                      className="relative overflow-hidden shadow-xl flex-shrink-0"
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        borderRadius: avatarShape === 'round' ? '50%' :
                                     avatarShape === 'square' ? '0' :
                                     '16px',
                        border: `${avatarBorderWidth}px solid ${avatarBorderColor}`,
                      }}
                    >
                      <Image
                        src={card.profileImage}
                        alt={card.fullName || 'Profile'}
                        width={parseInt(avatarSize)}
                        height={parseInt(avatarSize)}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User Info - Kapak resminin altında */}
              <div 
                className="relative"
                style={{ 
                  paddingTop: '16px',
                }}
              >
                {/* Avatar absolute position - sağda veya solda */}
                {avatarPos === 'cover-right' && (
                  <div 
                    className="absolute top-0 right-6"
                    style={{
                      marginTop: `-${parseInt(avatarSize) * parseInt(avatarVerticalOffset) / 100}px`,
                    }}
                  >
                    <div 
                      className="relative overflow-hidden shadow-xl"
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        borderRadius: avatarShape === 'round' ? '50%' :
                                     avatarShape === 'square' ? '0' :
                                     '16px',
                        border: `${avatarBorderWidth}px solid ${avatarBorderColor}`,
                      }}
                    >
                      <Image
                        src={card.profileImage}
                        alt={card.fullName || 'Profile'}
                        width={parseInt(avatarSize)}
                        height={parseInt(avatarSize)}
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
                      marginTop: `-${parseInt(avatarSize) * parseInt(avatarVerticalOffset) / 100}px`,
                    }}
                  >
                    <div 
                      className="relative overflow-hidden shadow-xl"
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        borderRadius: avatarShape === 'round' ? '50%' :
                                     avatarShape === 'square' ? '0' :
                                     '16px',
                        border: `${avatarBorderWidth}px solid ${avatarBorderColor}`,
                      }}
                    >
                      <Image
                        src={card.profileImage}
                        alt={card.fullName || 'Profile'}
                        width={parseInt(avatarSize)}
                        height={parseInt(avatarSize)}
                        unoptimized
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div 
                  className={`px-6 ${avatarPos === 'cover-center' ? 'text-center' : 'text-left'}`}
                  style={{
                    paddingRight: avatarPos === 'cover-right' ? `${parseInt(avatarSize) + 48}px` : undefined,
                    paddingLeft: avatarPos === 'cover-left' ? `${parseInt(avatarSize) + 48}px` : undefined,
                  }}
                >
                  <h1 
                    className="text-2xl font-bold mb-1" 
                    style={{ 
                      color: textColor,
                      fontSize: headingFontSize,
                      fontWeight: headingWeight,
                      fontFamily: fontFamily,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                    }}
                  >
                    {card.fullName || 'Kullanıcı'}
                  </h1>
                  
                  {card.username && (
                    <p 
                      className="text-sm opacity-60 mb-2" 
                      style={{ 
                        color: textColor,
                        fontSize: bodyFontSize,
                        fontFamily: fontFamily,
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
                        fontSize: bodyFontSize,
                        fontFamily: fontFamily,
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
                        fontSize: bodyFontSize,
                        fontFamily: fontFamily,
                        lineHeight: lineHeight,
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
            <div className={`relative ${
              avatarPos === 'above' 
                ? (coverUrl ? 'pt-8' : 'pt-20') 
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
                      width: `${avatarSize}px`,
                      height: `${avatarSize}px`,
                      borderRadius: avatarShape === 'round' ? '50%' :
                                   avatarShape === 'square' ? '0' :
                                   '16px',
                      border: `${avatarBorderWidth}px solid ${avatarBorderColor}`,
                    }}
                  >
                    <Image
                      src={card.profileImage}
                      alt={card.fullName || 'Profile'}
                      width={parseInt(avatarSize)}
                      height={parseInt(avatarSize)}
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
                  fontSize: headingFontSize,
                  fontWeight: headingWeight,
                  fontFamily: fontFamily,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                }}
              >
                {card.fullName || 'Kullanıcı'}
              </h1>
              
              {card.username && (
                <p 
                  className="text-sm opacity-60 mb-2" 
                  style={{ 
                    color: textColor,
                    fontSize: bodyFontSize,
                    fontFamily: fontFamily,
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
                    fontSize: bodyFontSize,
                    fontFamily: fontFamily,
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
                    fontSize: bodyFontSize,
                    fontFamily: fontFamily,
                    lineHeight: lineHeight,
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
            <a href={`tel:${card.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors group">
              <Phone size={18} style={{ color: textColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-60" style={{ color: textColor }}>Telefon</p>
                <p className="text-sm font-medium truncate" style={{ color: textColor }}>{card.phone}</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition flex-shrink-0 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/api/vcard/${card.username}`;
                }}
                style={{ backgroundColor: bgColor }}
              >
                Rehbere Ekle
              </div>
            </a>
          )}
          
          {card.email && (
            <a href={`mailto:${card.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors">
              <Mail size={18} style={{ color: textColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-60" style={{ color: textColor }}>E-posta</p>
                <p className="text-sm font-medium truncate" style={{ color: textColor }}>{card.email}</p>
              </div>
            </a>
          )}
          
          {card.website && (
            <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-colors">
              <Globe size={18} style={{ color: textColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-60" style={{ color: textColor }}>Website</p>
                <p className="text-sm font-medium truncate" style={{ color: textColor }}>{card.website}</p>
              </div>
            </a>
          )}
          
          {card.location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
              <MapPin size={18} style={{ color: textColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs opacity-60" style={{ color: textColor }}>Konum</p>
                <p className="text-sm font-medium truncate" style={{ color: textColor }}>{card.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="px-6 pb-6">
            {card.layoutStyle === 'full-width-buttons' ? (
              /* Tam Genişlik Buton Layout */
              <div className="space-y-3">
                {socialLinks.map((link, idx) => {
                  const Icon = link.icon;
                  const isIban = link.platform === 'iban';
                  
                  return (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e, link)}
                      className="flex items-center gap-4 w-full p-4 shadow-md hover:shadow-lg transition-all group relative"
                      style={{
                        backgroundColor: buttonBackgroundColor,
                        borderRadius: `${buttonBorderRadius}px`,
                      }}
                    >
                      <div 
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: `${parseInt(iconSize) + 16}px`,
                          height: `${parseInt(iconSize) + 16}px`,
                          backgroundColor: iconBackground !== 'transparent'
                            ? `${iconColor}15`
                            : 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: iconBackground === 'transparent' ? 'blur(4px)' : 'none',
                          borderRadius: iconBackground === 'circle' ? '50%' :
                            iconBackground === 'square' ? '0' :
                              iconBackground === 'rounded' ? `${iconBorderRadius}px` :
                                '50%',
                        }}
                      >
                        <Icon 
                          size={parseInt(iconSize)} 
                          style={{ color: iconColor }} 
                          color={iconColor}
                        />
                      </div>
                      
                      {/* Metin Alanı */}
                      <span 
                        className="flex-1 text-center font-semibold capitalize text-white truncate px-2" 
                        style={{ 
                          fontSize: buttonFontSize,
                          fontFamily: fontFamily,
                        }}
                      >
                        {isIban ? formatDisplayValue(link.url, 'iban') : link.platform}
                      </span>
                      
                      {/* Sağ İkon - Iban ise Kopyala ikonu, değilse 3 nokta */}
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        {isIban ? (
                           <div 
                             style={{
                                width: `${parseInt(iconSize) + 8}px`,
                                height: `${parseInt(iconSize) + 8}px`,
                                backgroundColor: iconBackground !== 'transparent'
                                  ? `${iconColor}15`
                                  : 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: iconBackground === 'transparent' ? 'blur(4px)' : 'none',
                                borderRadius: '50%', // Her zaman yuvarlak kopyalama butonu
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                             }}
                           >
                             <Copy size={16} style={{ color: iconColor }} />
                           </div>
                        ) : (
                          <MoreVertical size={16} style={{ color: iconColor }} />
                        )}
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
                gap: `${iconSpacing}px`,
              }}
            >
              {socialLinks.map((link, idx) => {
                const Icon = link.icon;
                const isIban = link.platform === 'iban';
                const iconBgStyle = iconBackground === 'circle' ? 'rounded-full' :
                                  iconBackground === 'square' ? 'rounded-none' :
                                  iconBackground === 'rounded' ? '' :
                                  '';
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 bg-black/5 hover:bg-black/10 transition-all relative group ${
                      iconBackground !== 'transparent' ? iconBgStyle : ''
                    }`}
                    style={{
                      backgroundColor: iconBackground !== 'transparent' 
                        ? `${iconColor}15` 
                        : undefined,
                      borderRadius: iconBackground === 'rounded' 
                        ? `${iconBorderRadius}px`
                        : iconBgStyle === 'rounded-full' 
                        ? '50%'
                        : iconBgStyle === 'rounded-none'
                        ? '0'
                        : `${iconBorderRadius}px`,
                    }}
                  >
                    <Icon size={parseInt(iconSize)} style={{ color: iconColor || textColor }} color={iconColor || textColor} />
                    {card.layoutStyle === 'icons-with-title' && (
                      <span 
                        className="text-xs font-medium capitalize truncate w-full text-center px-1" 
                        style={{ 
                          color: textColor,
                          fontSize: bodyFontSize,
                          fontFamily: fontFamily,
                        }}
                      >
                        {isIban ? 'IBAN' : link.platform}
                      </span>
                    )}
                    
                    {/* IBAN Grid görünümü için küçük kopyala ikonu */}
                    {isIban && (
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Copy size={12} style={{ color: textColor }} />
                      </div>
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
            {logoUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={parseInt(logoSize)}
                  height={parseInt(logoSize)}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <div className={`text-xs opacity-50 ${logoUrl ? 'text-right ml-auto' : 'text-center w-full'}`}>
              <p 
                style={{ 
                  color: textColor,
                  fontSize: bodyFontSize,
                  fontFamily: fontFamily,
                }}
              >
                Powered by <span className="font-semibold">notouchness</span>
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div className={`mt-4 text-[10px] text-center space-x-3 opacity-70`}>
            <a
              href="/gizlilik-sozlesmesi"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: textColor, fontFamily: fontFamily }}
              className="hover:underline"
            >
              Gizlilik Politikası
            </a>
            <span style={{ color: textColor }}>•</span>
            <a
              href="/kvkk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: textColor, fontFamily: fontFamily }}
              className="hover:underline"
            >
              KVKK / Açık Rıza Metni
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
