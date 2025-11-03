
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cardDb } from '@/lib/supabase-cards';
import Image from 'next/image';
import * as PlatformIcons from '@/components/PlatformIcons';
import { 
  Mail, Phone, Globe, MapPin, User, 
  Instagram, Linkedin, Twitter, Facebook, Youtube, 
  MessageCircle, Send, Github, Link2,
  TrendingUp, ShoppingBag, DollarSign, Music, Video,
  Briefcase, Code, Users, Calendar
} from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.username as string;
  const [card, setCard] = useState<any>(null);
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

  // Platform icon mapping
  const getPlatformIcon = (platform: string) => {
    const icons: any = {
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

  // Collect all social links
  const socialLinks: Array<{ platform: string; url: string; icon: any }> = [];
  
  // Social media platforms
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
    card.customLinks.forEach((link: any) => {
      if (link.url && link.title) {
        socialLinks.push({
          platform: link.title,
          url: link.url,
          icon: Link2
        });
      }
    });
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative w-full max-w-md">
        {/* Avatar - Above position (taşan profil resmi) */}
        {card.profileImage && avatarPos === 'above' && (
          <div className="flex justify-center mb-[-60px] relative z-10">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <Image
                src={card.profileImage}
                alt={card.fullName || 'Profile'}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div 
          className="w-full rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: containerBg }}
        >
          {/* Avatar Section */}
          <div className={`relative ${avatarPos === 'above' ? 'pt-20' : avatarPos === 'top' ? 'pt-8' : 'py-12'} px-6 text-center`}>
            {/* Avatar - Top or Center position */}
            {card.profileImage && avatarPos !== 'above' && (
              <div className="mb-4 flex justify-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={card.profileImage}
                    alt={card.fullName || 'Profile'}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          
          {/* User Info */}
          <h1 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
            {card.fullName || 'Kullanıcı'}
          </h1>
          
          {card.username && (
            <p className="text-sm opacity-60 mb-2" style={{ color: textColor }}>
              @{card.username}
            </p>
          )}
          
          {card.title && (
            <p className="text-sm font-medium mb-1" style={{ color: textColor }}>
              {card.title}{card.company && `, ${card.company}`}
            </p>
          )}
          
          {card.bio && (
            <p className="text-sm opacity-75 mt-3 mb-4" style={{ color: textColor }}>
              {card.bio}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="px-6 pb-4 space-y-3">
          {card.phone && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
              <Phone size={18} style={{ color: textColor }} />
              <div className="flex-1">
                <p className="text-xs opacity-60" style={{ color: textColor }}>Telefon</p>
                <p className="text-sm font-medium" style={{ color: textColor }}>{card.phone}</p>
              </div>
              <a
                href={`tel:${card.phone}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: bgColor }}
              >
                Rehbere Ekle
              </a>
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
            <div 
              className={`grid gap-3`}
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {socialLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-black/5 hover:bg-black/10 transition-all"
                  >
                    <Icon size={24} style={{ color: textColor }} />
                    {card.layoutStyle === 'icons-with-title' && (
                      <span className="text-xs font-medium capitalize" style={{ color: textColor }}>
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
          <p className="text-xs opacity-50" style={{ color: textColor }}>
            Powered by <span className="font-semibold">notouchness</span>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
