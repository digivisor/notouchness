/* eslint-disable @typescript-eslint/no-explicit-any */
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
    background_opacity: (card as any).backgroundOpacity || null,
    text_color: card.textColor || null,
    grid_cols: card.gridCols || 3,
    avatar_position: card.avatarPosition || 'above',
    
    // Editor Ayarları
    avatar_shape: (card as any).avatarShape || null,
    avatar_size: (card as any).avatarSize || null,
    avatar_border_width: (card as any).avatarBorderWidth || null,
    avatar_border_color: (card as any).avatarBorderColor || null,
    avatar_vertical_offset: (card as any).avatarVerticalOffset || null,
    cover_height: (card as any).coverHeight || null,
    logo_url: (card as any).logoUrl || null,
    logo_size: (card as any).logoSize || null,
    container_border_radius: (card as any).containerBorderRadius || null,
    container_shadow: (card as any).containerShadow || null,
    icon_size: (card as any).iconSize || null,
    icon_color: (card as any).iconColor || null,
    icon_spacing: (card as any).iconSpacing || null,
    icon_border_radius: (card as any).iconBorderRadius || null,
    icon_background: (card as any).iconBackground || null,
    font_family: (card as any).fontFamily || null,
    heading_font_size: (card as any).headingFontSize || null,
    body_font_size: (card as any).bodyFontSize || null,
    button_font_size: (card as any).buttonFontSize || null,
    heading_weight: (card as any).headingWeight || null,
    line_height: (card as any).lineHeight || null,
    letter_spacing: (card as any).letterSpacing || null,
    background_type: (card as any).backgroundType || null,
    background_gradient: (card as any).backgroundGradient || null,
    background_image: (card as any).backgroundImage || null,
    button_background_color: (card as any).buttonBackgroundColor || null,
    button_border_radius: (card as any).buttonBorderRadius || null,
    
    // Meta
    owner_email: card.ownerEmail || null,
    hashed_password: card.hashedPassword || null,
    is_active: card.isActive || false,
    view_count: card.viewCount || 0,
    
    // Grup ve Kart Tipi
    group_name: card.groupName || null,
    card_type: card.cardType || 'nfc',
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
    customLinks: Array.isArray(row.custom_links) ? row.custom_links as CardProfile['customLinks'] : [],
    platformDescriptions: (row.platform_descriptions && typeof row.platform_descriptions === 'object' && !Array.isArray(row.platform_descriptions)) 
      ? row.platform_descriptions as CardProfile['platformDescriptions']
      : {},
    
    // Gelişmiş Görünüm Ayarları
    backgroundColor: row.background_color ? String(row.background_color) : undefined,
    containerBackgroundColor: row.container_background_color ? String(row.container_background_color) : undefined,
    backgroundOpacity: row.background_opacity ? String(row.background_opacity) : undefined,
    textColor: row.text_color ? String(row.text_color) : undefined,
    gridCols: typeof row.grid_cols === 'number' ? row.grid_cols : 3,
    avatarPosition: (row.avatar_position || 'above') as 'top' | 'center' | 'above' | 'cover-left' | 'cover-center' | 'cover-right',
    
    // Editor Ayarları
    avatarShape: row.avatar_shape ? String(row.avatar_shape) : undefined,
    avatarSize: row.avatar_size ? String(row.avatar_size) : undefined,
    avatarBorderWidth: row.avatar_border_width ? String(row.avatar_border_width) : undefined,
    avatarBorderColor: row.avatar_border_color ? String(row.avatar_border_color) : undefined,
    avatarVerticalOffset: row.avatar_vertical_offset ? String(row.avatar_vertical_offset) : undefined,
    coverHeight: row.cover_height ? String(row.cover_height) : undefined,
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    logoSize: row.logo_size ? String(row.logo_size) : undefined,
    containerBorderRadius: row.container_border_radius ? String(row.container_border_radius) : undefined,
    containerShadow: row.container_shadow ? String(row.container_shadow) : undefined,
    iconSize: row.icon_size ? String(row.icon_size) : undefined,
    iconColor: row.icon_color ? String(row.icon_color) : undefined,
    iconSpacing: row.icon_spacing ? String(row.icon_spacing) : undefined,
    iconBorderRadius: row.icon_border_radius ? String(row.icon_border_radius) : undefined,
    iconBackground: row.icon_background ? String(row.icon_background) : undefined,
    fontFamily: row.font_family ? String(row.font_family) : undefined,
    headingFontSize: row.heading_font_size ? String(row.heading_font_size) : undefined,
    bodyFontSize: row.body_font_size ? String(row.body_font_size) : undefined,
    buttonFontSize: row.button_font_size ? String(row.button_font_size) : undefined,
    headingWeight: row.heading_weight ? String(row.heading_weight) : undefined,
    lineHeight: row.line_height ? String(row.line_height) : undefined,
    letterSpacing: row.letter_spacing ? String(row.letter_spacing) : undefined,
    backgroundType: row.background_type ? String(row.background_type) : undefined,
    backgroundGradient: row.background_gradient ? String(row.background_gradient) : undefined,
    backgroundImage: row.background_image ? String(row.background_image) : undefined,
    buttonBackgroundColor: row.button_background_color ? String(row.button_background_color) : undefined,
    buttonBorderRadius: row.button_border_radius ? String(row.button_border_radius) : undefined,
    
    // Meta
    ownerEmail: String(row.owner_email || ''),
    hashedPassword: String(row.hashed_password || ''),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    viewCount: typeof row.view_count === 'number' ? row.view_count : 0,
    
    // Grup ve Kart Tipi
    groupName: row.group_name ? String(row.group_name) : undefined,
    cardType: (row.card_type || 'nfc') as 'nfc' | 'comment',
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

  // Sayfalı kart getir (filtreleme ve arama ile)
  async getAllPaginated(
    page: number = 1, 
    pageSize: number = 50,
    options?: {
      searchTerm?: string;
      filterStatus?: 'all' | 'active' | 'inactive';
    }
  ): Promise<{ cards: CardProfile[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Base query
    let query = supabase
      .from('cards')
      .select('*', { count: 'exact' });

    // Arama filtresi
    if (options?.searchTerm && options.searchTerm.trim()) {
      const search = options.searchTerm.toLowerCase().trim();
      query = query.or(`id.ilike.%${search}%,username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Durum filtresi
    if (options?.filterStatus && options.filterStatus !== 'all') {
      query = query.eq('is_active', options.filterStatus === 'active');
    }

    // Sıralama ve sayfalama
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    
    if (error || !data) {
      return { cards: [], total: count || 0 };
    }
    
    return {
      cards: data.map(dbToCardFormat),
      total: count || 0
    };
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
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Attempted update data keys:', Object.keys(dbCard));
      return null;
    }
    return dbToCardFormat(data);
  },

  // View count artır
  async incrementViewCount(id: string): Promise<void> {
    const { error: rpcError } = await supabase.rpc('increment_card_views', { card_id: id });
    
    if (rpcError) {
      // RPC yoksa mevcut count'u al ve artır
      const { data: currentCard } = await supabase
        .from('cards')
        .select('view_count')
        .eq('id', id)
        .single();
      
      if (currentCard) {
        await supabase
          .from('cards')
          .update({ view_count: (typeof currentCard.view_count === 'number' ? currentCard.view_count : 0) + 1 })
          .eq('id', id);
      }
    }
  },

  // Kullanıcı adı kontrolü (mevcut kartın ID'sini hariç tut)
  async checkUsernameAvailability(username: string, excludeCardId?: string): Promise<boolean> {
    if (!username || username.trim() === '') return false;
    
    let query = supabase
      .from('cards')
      .select('id')
      .eq('username', username.toLowerCase().trim());
    
    // Eğer excludeCardId varsa, bu kartı sorgudan hariç tut
    if (excludeCardId) {
      query = query.neq('id', excludeCardId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Username check error:', error);
      return false;
    }
    
    // Eğer veri yoksa, kullanıcı adı müsait
    return !data || data.length === 0;
  },

  // Kart silme - tek kart
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // Toplu kart silme
  async deleteMultiple(ids: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .in('id', ids);
    
    return !error;
  },

  // Grup silme (grubun tüm kartlarını sil)
  async deleteGroup(groupName: string): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('group_name', groupName);
    
    return !error;
  },
};

