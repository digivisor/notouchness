'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cardDb } from '../../lib/supabase-cards';

// NFC Kart Profil Interface
interface CardProfile {
  id: string; // Benzersiz hash (örn: dwferwqferver)
  username: string; // Kullanıcı adı (örn: fazilcanakbas)
  
  // Kullanıcı Bilgileri
  fullName: string;
  title: string; // İş unvanı
  company: string;
  bio: string;
  
  // İletişim
  email: string;
  phone: string;
  website: string;
  location: string;
  
  // Sosyal Medya
  instagram: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  snapchat: string;
  pinterest: string;
  reddit: string;
  twitch: string;
  discord: string;
  spotify: string;
  threads: string;
  clubhouse: string;
  
  // Mesajlaşma
  whatsapp: string;
  telegram: string;
  signal: string;
  viber: string;
  wechat: string;
  line: string;
  
  // Profesyonel/İş
  github: string;
  gitlab: string;
  behance: string;
  dribbble: string;
  medium: string;
  devto: string;
  stackoverflow: string;
  figma: string;
  notion: string;
  calendly: string;
  linktree: string;
  substack: string;
  patreon: string;
  kofi: string;
  buymeacoffee: string;
  
  // E-ticaret/Satış
  etsy: string;
  amazon: string;
  ebay: string;
  shopify: string;
  trendyol: string;
  hepsiburada: string;
  temu: string;
  aliexpress: string;
  sahibinden: string;
  gittigidiyor: string;
  n11: string;
  
  // Ödeme
  iban: string;
  paypal: string;
  cashapp: string;
  venmo: string;
  revolut: string;
  wise: string;
  papara: string;
  
  // Video/Streaming
  vimeo: string;
  dailymotion: string;
  rumble: string;
  kick: string;
  
  // Müzik
  soundcloud: string;
  bandcamp: string;
  applemusic: string;
  deezer: string;
  
  // Profesyonel Ağlar
  xing: string;
  angellist: string;
  crunchbase: string;
  producthunt: string;
  
  // Rezervasyon/Servis
  booking: string;
  airbnb: string;
  tripadvisor: string;
  uber: string;
  bolt: string;
  
  // Profil Görünümü
  theme: 'dark' | 'light' | 'gradient' | 'minimal' | 'lawyer' | 'ceo' | 'sales' | 'developer' | 'retail' | 'creative';
  layoutStyle: 'icons-only' | 'icons-with-title' | 'full-description';
  avatarUrl: string;
  coverUrl: string;
  primaryColor: string;
  secondaryColor: string;
  profileImage: string;
  customLinks: Array<{ id: string; title: string; url: string; icon?: string; description?: string }>;
  
  // Gelişmiş Görünüm Ayarları
  backgroundColor?: string; // Sayfa arka plan rengi
  containerBackgroundColor?: string; // Container arka plan rengi
  textColor?: string; // Yazı rengi
  gridCols?: number; // İkon grid sütun sayısı (3 veya 4)
  avatarPosition?: 'top' | 'center' | 'above'; // Profil resmi pozisyonu
  
  // Platform Açıklamaları
  platformDescriptions: {
    [key: string]: string; // Her platform için açıklama
  };
  
  // Güvenlik
  ownerEmail: string; // Kart sahibinin giriş email'i
  hashedPassword: string; // Şifre (gerçek uygulamada backend'de)
  
  // Meta
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

interface CardContextType {
  currentCard: CardProfile | null;
  isOwner: boolean;
  isLoading: boolean;
  
  // Kart İşlemleri
  getCardByHash: (hash: string) => Promise<CardProfile | null>;
  getCardByUsername: (username: string) => Promise<CardProfile | null>;
  createCard: (hash: string, ownerEmail: string, password: string) => Promise<boolean>;
  createCardByAdmin: (customHash?: string) => Promise<CardProfile | null>; // Admin için kart oluştur
  getAllCards: () => Promise<CardProfile[]>; // Tüm kartları getir
  updateCard: (cardData: Partial<CardProfile>) => Promise<boolean>;
  
  // Auth
  loginToCard: (email: string, password: string) => Promise<boolean>;
  logoutFromCard: () => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

// Örnek kartlar (gerçek uygulamada backend'den gelecek)
const DEMO_CARDS: { [key: string]: CardProfile } = {
  'dwferwqferver': {
    id: 'dwferwqferver',
    username: 'fazilcanakbas',
    fullName: 'Fazıl Can Akbaş',
    title: 'Full Stack Developer',
    company: 'Digivisor',
    bio: 'Dijital dünyada iz bırakanlar için NFC kartvizit çözümleri',
    email: 'fazilcanakbas5@gmail.com',
    phone: '+90 555 555 55 55',
    website: 'https://fazilcanakbas.com',
    location: 'Istanbul, Turkey',
    instagram: 'fazilcanakbas',
    facebook: '',
    twitter: '',
    linkedin: 'fazilcanakbas',
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
    whatsapp: '+905555555555',
    telegram: '',
    signal: '',
    viber: '',
    wechat: '',
    line: '',
    github: 'fazilcanakbas',
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
    iban: '',
    paypal: '',
    cashapp: '',
    venmo: '',
    revolut: '',
    wise: '',
    papara: '',
    vimeo: '',
    dailymotion: '',
    rumble: '',
    kick: '',
    soundcloud: '',
    bandcamp: '',
    applemusic: '',
    deezer: '',
    xing: '',
    angellist: '',
    crunchbase: '',
    producthunt: '',
    booking: '',
    airbnb: '',
    tripadvisor: '',
    uber: '',
    bolt: '',
    theme: 'dark',
    layoutStyle: 'icons-with-title',
    avatarUrl: '',
    coverUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    profileImage: '',
    customLinks: [],
    platformDescriptions: {},
    ownerEmail: 'fazilcanakbas5@gmail.com',
    hashedPassword: 'demo123',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 142,
  },
  'abc123xyz': {
    id: 'abc123xyz',
    username: '', // Henüz profil oluşturulmamış
    fullName: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
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
    whatsapp: '',
    telegram: '',
    signal: '',
    viber: '',
    wechat: '',
    line: '',
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
    iban: '',
    paypal: '',
    cashapp: '',
    venmo: '',
    revolut: '',
    wise: '',
    papara: '',
    vimeo: '',
    dailymotion: '',
    rumble: '',
    kick: '',
    soundcloud: '',
    bandcamp: '',
    applemusic: '',
    deezer: '',
    xing: '',
    angellist: '',
    crunchbase: '',
    producthunt: '',
    booking: '',
    airbnb: '',
    tripadvisor: '',
    uber: '',
    bolt: '',
    theme: 'dark',
    layoutStyle: 'icons-with-title',
    avatarUrl: '',
    coverUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    profileImage: '',
    customLinks: [],
    platformDescriptions: {},
    ownerEmail: '', // Henüz kayıt olmamış
    hashedPassword: '',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
  },
};

export function CardProvider({ children }: { children: ReactNode }) {
  const [currentCard, setCurrentCard] = useState<CardProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // LocalStorage'dan currentCard ve isOwner yükle (session için)
  useEffect(() => {
    const savedCurrentCard = localStorage.getItem('notouchness_current_card');
    if (savedCurrentCard) {
      try {
        setCurrentCard(JSON.parse(savedCurrentCard));
      } catch (e) {
        console.error('Error parsing saved card:', e);
      }
    }
    
    const savedIsOwner = localStorage.getItem('notouchness_is_owner');
    if (savedIsOwner) {
      setIsOwner(JSON.parse(savedIsOwner) === true);
    }
    
    setIsLoading(false);
  }, []);

  const getCardByHash = async (hash: string): Promise<CardProfile | null> => {
    try {
      const card = await cardDb.getByHash(hash);
      return card;
    } catch (error) {
      console.error('Error fetching card by hash:', error);
      return null;
    }
  };

  const getCardByUsername = async (username: string): Promise<CardProfile | null> => {
    try {
      const card = await cardDb.getByUsername(username);
      return card;
    } catch (error) {
      console.error('Error fetching card by username:', error);
      return null;
    }
  };

  const getAllCards = async (): Promise<CardProfile[]> => {
    try {
      const allCards = await cardDb.getAll();
      return allCards;
    } catch (error) {
      console.error('Error fetching all cards:', error);
      return [];
    }
  };

  const generateHash = (): string => {
    // Benzersiz hash üret
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createCardByAdmin = async (customHash?: string): Promise<CardProfile | null> => {
    let finalHash = customHash || generateHash();
    
    // Hash kontrolü için önce database'den kontrol et
    let existingCard = await cardDb.getByHash(finalHash);
    if (existingCard) {
      // Hash zaten varsa yeni üret
      let attempts = 0;
      while (existingCard && attempts < 10) {
        finalHash = generateHash();
        existingCard = await cardDb.getByHash(finalHash);
        if (!existingCard) break;
        attempts++;
      }
      if (attempts >= 10) {
        console.error('Could not generate unique hash');
        return null;
      }
    }
    
    const newCard: CardProfile = {
      id: finalHash,
      username: '',
      fullName: '',
      title: '',
      company: '',
      bio: '',
      email: '',
      phone: '',
      website: '',
      location: '',
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
      whatsapp: '',
      telegram: '',
      signal: '',
      viber: '',
      wechat: '',
      line: '',
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
      iban: '',
      paypal: '',
      cashapp: '',
      venmo: '',
      revolut: '',
      wise: '',
      papara: '',
      vimeo: '',
      dailymotion: '',
      rumble: '',
      kick: '',
      soundcloud: '',
      bandcamp: '',
      applemusic: '',
      deezer: '',
      xing: '',
      angellist: '',
      crunchbase: '',
      producthunt: '',
      booking: '',
      airbnb: '',
      tripadvisor: '',
      uber: '',
      bolt: '',
      theme: 'sales',
      layoutStyle: 'icons-with-title',
      avatarUrl: '',
      coverUrl: '',
      primaryColor: '#dc2626',
      secondaryColor: '#fef2f2',
      profileImage: '',
      customLinks: [],
      platformDescriptions: {},
      ownerEmail: '',
      hashedPassword: '',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      backgroundColor: '#dc2626',
      containerBackgroundColor: '#ffffff',
      textColor: '#111827',
    };
    
    // Database'e kaydet
    const savedCard = await cardDb.create(newCard);
    return savedCard;
  };

  const createCard = async (hash: string, ownerEmail: string, password: string): Promise<boolean> => {
    try {
      const card = await cardDb.getByHash(hash);
      if (!card || card.isActive) {
        return false; // Kart bulunamadı veya zaten aktif
      }
      
      // Kartı aktifleştir
      const updatedCard = await cardDb.update(hash, {
        ownerEmail,
        hashedPassword: password,
        isActive: true,
      });
      
      if (!updatedCard) return false;
      
      setCurrentCard(updatedCard);
      setIsOwner(true);
      localStorage.setItem('notouchness_current_card', JSON.stringify(updatedCard));
      localStorage.setItem('notouchness_is_owner', JSON.stringify(true));
      
      return true;
    } catch (error) {
      console.error('Error creating card:', error);
      return false;
    }
  };

  const updateCard = async (cardData: Partial<CardProfile>): Promise<boolean> => {
    if (!currentCard || !isOwner) {
      return false;
    }
    
    try {
      const updatedCard = await cardDb.update(currentCard.id, cardData);
      if (!updatedCard) return false;
      
      setCurrentCard(updatedCard);
      localStorage.setItem('notouchness_current_card', JSON.stringify(updatedCard));
      
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      return false;
    }
  };

  const loginToCard = async (email: string, password: string): Promise<boolean> => {
    try {
      // Email'e göre kartı bul
      const allCards = await cardDb.getAll();
      const card = allCards.find(
        c => c.ownerEmail === email && c.hashedPassword === password
      );
      
      if (card) {
        setCurrentCard(card);
        setIsOwner(true);
        localStorage.setItem('notouchness_current_card', JSON.stringify(card));
        localStorage.setItem('notouchness_is_owner', JSON.stringify(true));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging in to card:', error);
      return false;
    }
  };

  const logoutFromCard = () => {
    setIsOwner(false);
    localStorage.setItem('notouchness_is_owner', JSON.stringify(false));
    // currentCard'ı silme, sadece owner durumunu kaldır
  };

  return (
    <CardContext.Provider value={{
      currentCard,
      isOwner,
      isLoading,
      getCardByHash,
      getCardByUsername,
      createCard,
      createCardByAdmin,
      getAllCards,
      updateCard,
      loginToCard,
      logoutFromCard,
    }}>
      {children}
    </CardContext.Provider>
  );
}

export function useCard() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return context;
}
