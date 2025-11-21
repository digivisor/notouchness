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
  type LucideIcon
} from 'lucide-react';
import type { CardProfile } from '@/app/context/CardContext';

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
  



  // Platform icon mapping
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

  // Buton arka plan rengi, font boyutu ve border radius
  const buttonBackgroundColor = (card as any).buttonBackgroundColor || '#000000';
  const buttonFontSize = (card as any).buttonFontSize || '0.95rem';
  const buttonBorderRadius = (card as any).buttonBorderRadius || '999';

  // Collect all social links
  const socialLinks: Array<{ platform: string; url: string; icon: IconType }> = [];
  
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5">
              <Phone size={18} style={{ color: textColor }} />
              <div className="flex-1">
                <p className="text-xs opacity-60" style={{ color: textColor }}>Telefon</p>
                <a 
                  href={`tel:${card.phone}`}
                  className="text-sm font-medium hover:underline" 
                  style={{ color: textColor }}
                >
                  {card.phone}
                </a>
              </div>
              <a
                href={`/api/vcard/${card.username}`}
                download={`${card.fullName || card.username}.vcf`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition"
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
            {card.layoutStyle === 'full-width-buttons' ? (
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
                        />
                      </div>
                      <span 
                        className="flex-1 text-center font-semibold capitalize text-white" 
                        style={{ 
                          fontSize: buttonFontSize,
                          fontFamily: fontFamily,
                        }}
                      >
                        {link.platform}
                      </span>
                      <div className="w-6 h-6 flex items-center justify-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} style={{ color: iconColor }} />
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
                    className={`flex flex-col items-center justify-center gap-2 p-4 bg-black/5 hover:bg-black/10 transition-all ${
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
                    <Icon size={parseInt(iconSize)} style={{ color: iconColor || textColor }} />
                    {card.layoutStyle === 'icons-with-title' && (
                      <span 
                        className="text-xs font-medium capitalize" 
                        style={{ 
                          color: textColor,
                          fontSize: bodyFontSize,
                          fontFamily: fontFamily,
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
        </div>
        </div>
      </div>
    </div>
  );
}
