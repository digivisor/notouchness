'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCard } from '../context/CardContext';
import Image from 'next/image';
import { 
  Instagram, Linkedin, Twitter, Facebook, Youtube, MessageCircle, Send, Link2, 
  User, Mail, Phone, Globe, MapPin
} from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.username as string;
  const { getCardByUsername, getCardByHash } = useCard();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      // Önce hash olarak dene (kart ID olabilir)
      let foundCard = await getCardByHash(identifier);
      
      if (foundCard) {
        // Kart bulundu, aktif mi kontrol et
        if (foundCard.isActive && foundCard.username) {
          // Aktif ve username var, profil sayfasını göster
          setCard(foundCard);
          setLoading(false);
          return;
        } else if (!foundCard.isActive) {
          // Kart var ama aktif değil (henüz register olmamış), register sayfasına yönlendir
          router.push(`/card/register?hash=${identifier}`);
          return;
        }
      }
      
      // Hash ile bulunamadı, username olarak dene
      foundCard = await getCardByUsername(identifier);
      if (foundCard) {
        setCard(foundCard);
        setLoading(false);
        return;
      }
      
      // Hiçbir şey bulunamadı
      router.push('/');
      setLoading(false);
    };
    
    fetchCard();
  }, [identifier, getCardByUsername, getCardByHash, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  if (!card) return null;

  // Tüm linkleri birleştir
  const socialLinkDefs = [
    { name: 'Instagram', icon: Instagram, value: card.instagram, url: (val: string) => `https://instagram.com/${val}` },
    { name: 'LinkedIn', icon: Linkedin, value: card.linkedin, url: (val: string) => `https://linkedin.com/in/${val}` },
    { name: 'Twitter', icon: Twitter, value: card.twitter, url: (val: string) => `https://twitter.com/${val}` },
    { name: 'Facebook', icon: Facebook, value: card.facebook, url: (val: string) => `https://facebook.com/${val}` },
    { name: 'YouTube', icon: Youtube, value: card.youtube, url: (val: string) => `https://youtube.com/${val}` },
    { name: 'WhatsApp', icon: MessageCircle, value: card.whatsapp, url: (val: string) => `https://wa.me/${val.replace(/\D/g, '')}` },
    { name: 'Telegram', icon: Send, value: card.telegram, url: (val: string) => `https://t.me/${val}` },
  ];
  const allLinks: Array<{title: string, url: string, icon: any, description: string}> = [];
  socialLinkDefs.forEach(link => {
    if (link.value) {
      allLinks.push({
        title: link.name,
        url: link.url(link.value),
        icon: link.icon,
        description: card.platformDescriptions?.[link.name.toLowerCase()] || '',
      });
    }
  });
  if (Array.isArray(card.customLinks)) {
    card.customLinks.forEach((cl: any) => {
      allLinks.push({
        title: cl.title,
        url: cl.url,
        icon: cl.icon || Link2,
        description: cl.description || '',
      });
    });
  }

  const primaryColor = card.primaryColor || '#dc2626';
  const bgColor = card.backgroundColor || primaryColor || '#dc2626';
  const containerBgColor = card.containerBackgroundColor || '#ffffff';
  const textColor = card.textColor || '#111827';
  const gridCols = card.gridCols || 3;
  const avatarPosition = card.avatarPosition || 'above';

  // Rehbere ekleme fonksiyonu
  const addToContacts = () => {
    if (!card.phone && !card.fullName) return;
    
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.fullName || card.username}`,
      card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
      card.email ? `EMAIL:${card.email}` : '',
      card.website ? `URL:${card.website}` : '',
      card.location ? `ADR:;;${card.location};;;` : '',
      card.company ? `ORG:${card.company}` : '',
      card.title ? `TITLE:${card.title}` : '',
      'END:VCARD'
    ].filter(line => line).join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.fullName || card.username || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Profile Container - Beyaz Bölüm */}
      <div className="px-4 pb-20 pt-12">
        <div className="max-w-lg mx-auto">
          <div 
            className="rounded-3xl shadow-2xl p-6 mb-4 border border-gray-100"
            style={{ backgroundColor: containerBgColor }}
          >
            {/* Profile Picture - Container içinde */}
            <div className={`flex justify-center mb-4 ${
              avatarPosition === 'above' ? '-mt-16' : 
              avatarPosition === 'top' ? 'mt-0' : 
              'mt-4'
            }`}>
              <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                {card.profileImage ? (
                  card.profileImage.startsWith('data:') ? (
                    <img 
                      src={card.profileImage} 
                      alt={card.fullName || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image 
                      src={card.profileImage} 
                      alt={card.fullName || 'Profile'} 
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={60} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6 pt-4">
              <h1 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                {card.fullName || card.username || 'Kullanıcı'}
              </h1>
              {card.username && (
                <p className="text-sm mb-3" style={{ color: textColor, opacity: 0.7 }}>
                  @{card.username}
                </p>
              )}
              {(card.title || card.company) && (
                <p className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
                  {card.title && card.company ? `${card.title}, ${card.company}` : card.title || card.company}
                </p>
              )}
              {card.bio && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: textColor, opacity: 0.9 }}>
                  {card.bio}
                </p>
              )}
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-2">
              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] group"
                  style={{ 
                    backgroundColor: containerBgColor === '#ffffff' ? '#f9fafb' : containerBgColor,
                    borderColor: textColor + '30',
                    opacity: 0.9
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: containerBgColor === '#ffffff' ? '#f3f4f6' : containerBgColor, opacity: 0.8 }}
                  >
                    <Phone size={20} style={{ color: textColor, opacity: 0.8 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base" style={{ color: textColor }}>Telefon</p>
                    <p className="text-sm truncate" style={{ color: textColor, opacity: 0.7 }}>{card.phone}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToContacts();
                    }}
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: containerBgColor === '#ffffff' ? '#ffffff' : textColor
                    }}
                  >
                    Rehbere Ekle
                  </button>
                </a>
              )}

              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]"
                  style={{ 
                    backgroundColor: containerBgColor === '#ffffff' ? '#f9fafb' : containerBgColor,
                    borderColor: textColor + '30',
                    opacity: 0.9
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: containerBgColor === '#ffffff' ? '#f3f4f6' : containerBgColor, opacity: 0.8 }}
                  >
                    <Mail size={20} style={{ color: textColor, opacity: 0.8 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base" style={{ color: textColor }}>E-posta</p>
                    <p className="text-sm truncate" style={{ color: textColor, opacity: 0.7 }}>{card.email}</p>
                  </div>
                </a>
              )}

              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]"
                  style={{ 
                    backgroundColor: containerBgColor === '#ffffff' ? '#f9fafb' : containerBgColor,
                    borderColor: textColor + '30',
                    opacity: 0.9
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: containerBgColor === '#ffffff' ? '#f3f4f6' : containerBgColor, opacity: 0.8 }}
                  >
                    <Globe size={20} style={{ color: textColor, opacity: 0.8 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base" style={{ color: textColor }}>Website</p>
                    <p className="text-sm truncate" style={{ color: textColor, opacity: 0.7 }}>{card.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
                  </div>
                </a>
              )}

              {card.location && (
                <div 
                  className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ 
                    backgroundColor: containerBgColor === '#ffffff' ? '#f9fafb' : containerBgColor,
                    borderColor: textColor + '30',
                    opacity: 0.9
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: containerBgColor === '#ffffff' ? '#f3f4f6' : containerBgColor, opacity: 0.8 }}
                  >
                    <MapPin size={20} style={{ color: textColor, opacity: 0.8 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base" style={{ color: textColor }}>Konum</p>
                    <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>{card.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sosyal Medya Linkleri - Yan yana küçük kartlar */}
            {allLinks.length > 0 && (
              <div className="mt-6">
                <div className={`grid gap-3 ${gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {allLinks.map((link, idx) => {
                    const Icon = link.icon;
                    const isImageIcon = typeof Icon === 'string';
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:shadow-md transition-all duration-200 active:scale-[0.95]"
                      style={{ 
                        backgroundColor: containerBgColor === '#ffffff' ? '#f9fafb' : containerBgColor,
                        borderColor: textColor + '30'
                      }}
                      >
                        {/* Icon */}
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center border shadow-sm"
                          style={{ 
                            backgroundColor: containerBgColor,
                            borderColor: textColor + '40'
                          }}
                        >
                          {isImageIcon ? (
                            <img 
                              src={Icon as string} 
                              alt={link.title} 
                              className="w-10 h-10 object-contain rounded" 
                            />
                          ) : (
                            <Icon size={32} style={{ color: textColor, opacity: 0.8 }} />
                          )}
                        </div>
                        {/* Label */}
                        <span className="text-xs font-medium text-center" style={{ color: textColor }}>
                          {link.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
