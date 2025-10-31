import { supabase } from './supabase';
import { CardProfile } from '../app/context/CardContext';

interface DbCard {
  [key: string]: string | number | boolean | null | unknown[] | Record<string, unknown>;
}

// CardProfile'i database formatına çevir
const cardToDbFormat = (card: CardProfile): DbCard => {
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
const dbToCardFormat = (row: DbCard): CardProfile => {
  return {
    id: String(row.id || ''),
    username: String(row.username || ''),
    fullName: String(row.full_name || ''),
    title: String(row.title || ''),
    company: String(row.company || ''),
    bio: String(row.bio || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    website: String(row.website || ''),
    location: String(row.location || ''),
    
    // Sosyal Medya
    instagram: String(row.instagram || ''),
    facebook: String(row.facebook || ''),
    twitter: String(row.twitter || ''),
    linkedin: String(row.linkedin || ''),
    youtube: String(row.youtube || ''),
    tiktok: String(row.tiktok || ''),
    snapchat: String(row.snapchat || ''),
    pinterest: String(row.pinterest || ''),
    reddit: String(row.reddit || ''),
    twitch: String(row.twitch || ''),
    discord: String(row.discord || ''),
    spotify: String(row.spotify || ''),
    threads: String(row.threads || ''),
    clubhouse: String(row.clubhouse || ''),
    
    // Mesajlaşma
    whatsapp: String(row.whatsapp || ''),
    telegram: String(row.telegram || ''),
    signal: String(row.signal || ''),
    viber: String(row.viber || ''),
    wechat: String(row.wechat || ''),
    line: String(row.line || ''),
    
    // Profesyonel/İş
    github: String(row.github || ''),
    gitlab: String(row.gitlab || ''),
    behance: String(row.behance || ''),
    dribbble: String(row.dribbble || ''),
    medium: String(row.medium || ''),
    devto: String(row.devto || ''),
    stackoverflow: String(row.stackoverflow || ''),
    figma: String(row.figma || ''),
    notion: String(row.notion || ''),
    calendly: String(row.calendly || ''),
    linktree: String(row.linktree || ''),
    substack: String(row.substack || ''),
    patreon: String(row.patreon || ''),
    kofi: String(row.kofi || ''),
    buymeacoffee: String(row.buymeacoffee || ''),
    
    // E-ticaret/Satış
    etsy: String(row.etsy || ''),
    amazon: String(row.amazon || ''),
    ebay: String(row.ebay || ''),
    shopify: String(row.shopify || ''),
    trendyol: String(row.trendyol || ''),
    hepsiburada: String(row.hepsiburada || ''),
    temu: String(row.temu || ''),
    aliexpress: String(row.aliexpress || ''),
    sahibinden: String(row.sahibinden || ''),
    gittigidiyor: String(row.gittigidiyor || ''),
    n11: String(row.n11 || ''),
    
    // Ödeme
    iban: String(row.iban || ''),
    paypal: String(row.paypal || ''),
    cashapp: String(row.cashapp || ''),
    venmo: String(row.venmo || ''),
    revolut: String(row.revolut || ''),
    wise: String(row.wise || ''),
    papara: String(row.papara || ''),
    
    // Video/Streaming
    vimeo: String(row.vimeo || ''),
    dailymotion: String(row.dailymotion || ''),
    rumble: String(row.rumble || ''),
    kick: String(row.kick || ''),
    
    // Müzik
    soundcloud: String(row.soundcloud || ''),
    bandcamp: String(row.bandcamp || ''),
    applemusic: String(row.apple_music || ''),
    deezer: String(row.deezer || ''),
    
    // Profesyonel Ağlar
    xing: String(row.xing || ''),
    angellist: String(row.angellist || ''),
    crunchbase: String(row.crunchbase || ''),
    producthunt: String(row.producthunt || ''),
    
    // Rezervasyon/Servis
    booking: String(row.booking || ''),
    airbnb: String(row.airbnb || ''),
    tripadvisor: String(row.tripadvisor || ''),
    uber: String(row.uber || ''),
    bolt: String(row.bolt || ''),
    
    // Görünüm
    theme: (String(row.theme || 'sales')) as CardProfile['theme'],
    layoutStyle: (String(row.layout_style || 'icons-with-title')) as 'icons-only' | 'icons-with-title' | 'full-description',
    avatarUrl: String(row.avatar_url || ''),
    coverUrl: String(row.cover_url || ''),
    primaryColor: String(row.primary_color || '#dc2626'),
    secondaryColor: String(row.secondary_color || '#fef2f2'),
    profileImage: String(row.profile_image || ''),
    customLinks: row.custom_links || [],
    platformDescriptions: row.platform_descriptions || {},
    
    // Gelişmiş Görünüm Ayarları
    backgroundColor: row.background_color ? String(row.background_color) : undefined,
    containerBackgroundColor: row.container_background_color ? String(row.container_background_color) : undefined,
    textColor: row.text_color ? String(row.text_color) : undefined,
    gridCols: typeof row.grid_cols === 'number' ? row.grid_cols : 3,
    avatarPosition: (row.avatar_position || 'above') as 'top' | 'center' | 'above',
    
    // Meta
    ownerEmail: String(row.owner_email || ''),
    hashedPassword: String(row.hashed_password || ''),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
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
    const updatedCard: CardProfile = { ...currentCard, ...updates };
    
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
    await supabase.rpc('increment_card_views', { card_id: id }).catch(async () => {
      // RPC yoksa mevcut count'u al ve artır
      const { data: currentCard } = await supabase
        .from('cards')
        .select('view_count')
        .eq('id', id)
        .single();
      
      if (currentCard) {
        await supabase
          .from('cards')
          .update({ view_count: (currentCard.view_count || 0) + 1 })
          .eq('id', id);
      }
    });
  },
};

