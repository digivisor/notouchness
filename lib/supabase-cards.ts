import { supabase } from './supabase';
import { CardProfile } from '../app/context/CardContext';

// CardProfile'i database formatına çevir
const cardToDbFormat = (card: CardProfile): any => {
  return {
    id: card.id,
    username: card.username || null,
    full_name: card.fullName || null,
    title: card.title || null,
    company: card.company || null,
    bio: card.bio || null,
    email: card.email || null,
    phone: card.phone || null,
    website: card.website || null,
    location: card.location || null,
    
    // Sosyal Medya
    instagram: card.instagram || null,
    facebook: card.facebook || null,
    twitter: card.twitter || null,
    linkedin: card.linkedin || null,
    youtube: card.youtube || null,
    tiktok: card.tiktok || null,
    snapchat: card.snapchat || null,
    pinterest: card.pinterest || null,
    reddit: card.reddit || null,
    twitch: card.twitch || null,
    discord: card.discord || null,
    spotify: card.spotify || null,
    threads: card.threads || null,
    clubhouse: card.clubhouse || null,
    
    // Mesajlaşma
    whatsapp: card.whatsapp || null,
    telegram: card.telegram || null,
    signal: card.signal || null,
    viber: card.viber || null,
    wechat: card.wechat || null,
    line: card.line || null,
    
    // Profesyonel/İş
    github: card.github || null,
    gitlab: card.gitlab || null,
    behance: card.behance || null,
    dribbble: card.dribbble || null,
    medium: card.medium || null,
    devto: card.devto || null,
    stackoverflow: card.stackoverflow || null,
    figma: card.figma || null,
    notion: card.notion || null,
    calendly: card.calendly || null,
    linktree: card.linktree || null,
    substack: card.substack || null,
    patreon: card.patreon || null,
    kofi: card.kofi || null,
    buymeacoffee: card.buymeacoffee || null,
    
    // E-ticaret/Satış
    etsy: card.etsy || null,
    amazon: card.amazon || null,
    ebay: card.ebay || null,
    shopify: card.shopify || null,
    trendyol: card.trendyol || null,
    hepsiburada: card.hepsiburada || null,
    temu: card.temu || null,
    aliexpress: card.aliexpress || null,
    sahibinden: card.sahibinden || null,
    gittigidiyor: card.gittigidiyor || null,
    n11: card.n11 || null,
    
    // Ödeme
    iban: card.iban || null,
    paypal: card.paypal || null,
    cashapp: card.cashapp || null,
    venmo: card.venmo || null,
    revolut: card.revolut || null,
    wise: card.wise || null,
    papara: card.papara || null,
    
    // Video/Streaming
    vimeo: card.vimeo || null,
    dailymotion: card.dailymotion || null,
    rumble: card.rumble || null,
    kick: card.kick || null,
    
    // Müzik
    soundcloud: card.soundcloud || null,
    bandcamp: card.bandcamp || null,
    apple_music: card.applemusic || null,
    deezer: card.deezer || null,
    
    // Profesyonel Ağlar
    xing: card.xing || null,
    angellist: card.angellist || null,
    crunchbase: card.crunchbase || null,
    producthunt: card.producthunt || null,
    
    // Rezervasyon/Servis
    booking: card.booking || null,
    airbnb: card.airbnb || null,
    tripadvisor: card.tripadvisor || null,
    uber: card.uber || null,
    bolt: card.bolt || null,
    
    // Görünüm
    theme: card.theme || 'sales',
    layout_style: card.layoutStyle || 'icons-with-title',
    avatar_url: card.avatarUrl || null,
    cover_url: card.coverUrl || null,
    primary_color: card.primaryColor || '#dc2626',
    secondary_color: card.secondaryColor || '#fef2f2',
    profile_image: card.profileImage || null,
    custom_links: card.customLinks || [],
    platform_descriptions: card.platformDescriptions || {},
    
    // Gelişmiş Görünüm Ayarları
    background_color: card.backgroundColor || null,
    container_background_color: card.containerBackgroundColor || null,
    text_color: card.textColor || null,
    grid_cols: card.gridCols || 3,
    avatar_position: card.avatarPosition || 'above',
    
    // Meta
    owner_email: card.ownerEmail || null,
    hashed_password: card.hashedPassword || null,
    is_active: card.isActive || false,
    view_count: card.viewCount || 0,
  };
};

// Database formatını CardProfile'e çevir
const dbToCardFormat = (row: any): CardProfile => {
  return {
    id: row.id,
    username: row.username || '',
    fullName: row.full_name || '',
    title: row.title || '',
    company: row.company || '',
    bio: row.bio || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    location: row.location || '',
    
    // Sosyal Medya
    instagram: row.instagram || '',
    facebook: row.facebook || '',
    twitter: row.twitter || '',
    linkedin: row.linkedin || '',
    youtube: row.youtube || '',
    tiktok: row.tiktok || '',
    snapchat: row.snapchat || '',
    pinterest: row.pinterest || '',
    reddit: row.reddit || '',
    twitch: row.twitch || '',
    discord: row.discord || '',
    spotify: row.spotify || '',
    threads: row.threads || '',
    clubhouse: row.clubhouse || '',
    
    // Mesajlaşma
    whatsapp: row.whatsapp || '',
    telegram: row.telegram || '',
    signal: row.signal || '',
    viber: row.viber || '',
    wechat: row.wechat || '',
    line: row.line || '',
    
    // Profesyonel/İş
    github: row.github || '',
    gitlab: row.gitlab || '',
    behance: row.behance || '',
    dribbble: row.dribbble || '',
    medium: row.medium || '',
    devto: row.devto || '',
    stackoverflow: row.stackoverflow || '',
    figma: row.figma || '',
    notion: row.notion || '',
    calendly: row.calendly || '',
    linktree: row.linktree || '',
    substack: row.substack || '',
    patreon: row.patreon || '',
    kofi: row.kofi || '',
    buymeacoffee: row.buymeacoffee || '',
    
    // E-ticaret/Satış
    etsy: row.etsy || '',
    amazon: row.amazon || '',
    ebay: row.ebay || '',
    shopify: row.shopify || '',
    trendyol: row.trendyol || '',
    hepsiburada: row.hepsiburada || '',
    temu: row.temu || '',
    aliexpress: row.aliexpress || '',
    sahibinden: row.sahibinden || '',
    gittigidiyor: row.gittigidiyor || '',
    n11: row.n11 || '',
    
    // Ödeme
    iban: row.iban || '',
    paypal: row.paypal || '',
    cashapp: row.cashapp || '',
    venmo: row.venmo || '',
    revolut: row.revolut || '',
    wise: row.wise || '',
    papara: row.papara || '',
    
    // Video/Streaming
    vimeo: row.vimeo || '',
    dailymotion: row.dailymotion || '',
    rumble: row.rumble || '',
    kick: row.kick || '',
    
    // Müzik
    soundcloud: row.soundcloud || '',
    bandcamp: row.bandcamp || '',
    applemusic: row.apple_music || '',
    deezer: row.deezer || '',
    
    // Profesyonel Ağlar
    xing: row.xing || '',
    angellist: row.angellist || '',
    crunchbase: row.crunchbase || '',
    producthunt: row.producthunt || '',
    
    // Rezervasyon/Servis
    booking: row.booking || '',
    airbnb: row.airbnb || '',
    tripadvisor: row.tripadvisor || '',
    uber: row.uber || '',
    bolt: row.bolt || '',
    
    // Görünüm
    theme: row.theme || 'sales',
    layoutStyle: row.layout_style || 'icons-with-title',
    avatarUrl: row.avatar_url || '',
    coverUrl: row.cover_url || '',
    primaryColor: row.primary_color || '#dc2626',
    secondaryColor: row.secondary_color || '#fef2f2',
    profileImage: row.profile_image || '',
    customLinks: row.custom_links || [],
    platformDescriptions: row.platform_descriptions || {},
    
    // Gelişmiş Görünüm Ayarları
    backgroundColor: row.background_color || undefined,
    containerBackgroundColor: row.container_background_color || undefined,
    textColor: row.text_color || undefined,
    gridCols: row.grid_cols || 3,
    avatarPosition: (row.avatar_position || 'above') as 'top' | 'center' | 'above',
    
    // Meta
    ownerEmail: row.owner_email || '',
    hashedPassword: row.hashed_password || '',
    isActive: row.is_active || false,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    viewCount: row.view_count || 0,
  };
};

// Supabase Card Functions
export const cardDb = {
  // Hash ile kart getir
  async getByHash(hash: string): Promise<CardProfile | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', hash)
      .single();
    
    if (error || !data) return null;
    return dbToCardFormat(data);
  },

  // Username ile kart getir
  async getByUsername(username: string): Promise<CardProfile | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return null;
    return dbToCardFormat(data);
  },

  // Tüm kartları getir
  async getAll(): Promise<CardProfile[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(dbToCardFormat);
  },

  // Yeni kart oluştur
  async create(card: CardProfile): Promise<CardProfile | null> {
    const dbCard = cardToDbFormat(card);
    const { data, error } = await supabase
      .from('cards')
      .insert(dbCard)
      .select()
      .single();
    
    if (error || !data) return null;
    return dbToCardFormat(data);
  },

  // Kart güncelle
  async update(id: string, updates: Partial<CardProfile>): Promise<CardProfile | null> {
    // Mevcut kartı al
    const currentCard = await this.getByHash(id);
    if (!currentCard) return null;
    
    // Güncellemeleri birleştir
    const updatedCard = { ...currentCard, ...updates };
    
    // Database formatına çevir
    const dbCard = cardToDbFormat(updatedCard);
    
    const { data, error } = await supabase
      .from('cards')
      .update(dbCard)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Update error:', error);
      return null;
    }
    return dbToCardFormat(data);
  },

  // View count artır
  async incrementViewCount(id: string): Promise<void> {
    await supabase.rpc('increment_card_views', { card_id: id }).catch(() => {
      // RPC yoksa manuel olarak artır
      supabase
        .from('cards')
        .update({ view_count: supabase.raw('view_count + 1') } as any)
        .eq('id', id);
    });
  },
};

