/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

// QR Menu Interface
export interface QRMenu {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  ownerEmail?: string;
  hashedPassword?: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  categoryColor?: string;
  itemColor?: string;
  headerColor?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// QR Menu Card Interface
export interface QRMenuCard {
  id: string;
  qrmenuId: string;
  hash: string;
  groupName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// QR Menu Category Interface
export interface QRMenuCategory {
  id: string;
  qrmenuId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// QR Menu Item Interface
export interface QRMenuItem {
  id: string;
  qrmenuId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// QR Menu Order Interface
export interface QRMenuOrder {
  id: string;
  qrmenuId: string;
  qrmenuCardId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tableNumber?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

// Database format converters
const dbToQRMenuFormat = (row: any): QRMenu => {
  return {
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    name: String(row.name || ''),
    description: row.description ? String(row.description) : undefined,
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    address: row.address ? String(row.address) : undefined,
    website: row.website ? String(row.website) : undefined,
    instagram: row.instagram ? String(row.instagram) : undefined,
    facebook: row.facebook ? String(row.facebook) : undefined,
    twitter: row.twitter ? String(row.twitter) : undefined,
    ownerEmail: row.owner_email ? String(row.owner_email) : undefined,
    hashedPassword: row.hashed_password ? String(row.hashed_password) : undefined,
    isActive: Boolean(row.is_active),
    primaryColor: String(row.primary_color || '#dc2626'),
    secondaryColor: String(row.secondary_color || '#fef2f2'),
    backgroundColor: row.background_color ? String(row.background_color) : undefined,
    textColor: row.text_color ? String(row.text_color) : undefined,
    categoryColor: row.category_color ? String(row.category_color) : undefined,
    itemColor: row.item_color ? String(row.item_color) : undefined,
    headerColor: row.header_color ? String(row.header_color) : undefined,
    viewCount: typeof row.view_count === 'number' ? row.view_count : 0,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
};

const qrmenuToDbFormat = (qrmenu: Partial<QRMenu>): any => {
  return {
    slug: qrmenu.slug || null,
    name: qrmenu.name || null,
    description: qrmenu.description || null,
    logo_url: qrmenu.logoUrl || null,
    cover_image_url: qrmenu.coverImageUrl || null,
    phone: qrmenu.phone || null,
    email: qrmenu.email || null,
    address: qrmenu.address || null,
    website: qrmenu.website || null,
    instagram: qrmenu.instagram || null,
    facebook: qrmenu.facebook || null,
    twitter: qrmenu.twitter || null,
    owner_email: qrmenu.ownerEmail || null,
    hashed_password: qrmenu.hashedPassword || null,
    is_active: qrmenu.isActive !== undefined ? qrmenu.isActive : true,
    primary_color: qrmenu.primaryColor || '#dc2626',
    secondary_color: qrmenu.secondaryColor || '#fef2f2',
    background_color: qrmenu.backgroundColor || null,
    text_color: qrmenu.textColor || null,
    category_color: qrmenu.categoryColor || null,
    item_color: qrmenu.itemColor || null,
    header_color: qrmenu.headerColor || null,
  };
};

// Supabase QR Menu Functions
export const qrmenuDb = {
  // Slug ile QR Menu getir
  async getBySlug(slug: string): Promise<QRMenu | null> {
    const { data, error } = await supabase
      .from('qrmenus')
      .select('*')
      .eq('slug', slug.toLowerCase().trim())
      .single();
    
    if (error || !data) return null;
    return dbToQRMenuFormat(data);
  },

  // ID ile QR Menu getir
  async getById(id: string): Promise<QRMenu | null> {
    const { data, error } = await supabase
      .from('qrmenus')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return dbToQRMenuFormat(data);
  },

  // Tüm QR Menüleri getir
  async getAll(): Promise<QRMenu[]> {
    const { data, error } = await supabase
      .from('qrmenus')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data.map(dbToQRMenuFormat);
  },

  // Yeni QR Menu oluştur
  async create(qrmenu: Partial<QRMenu>): Promise<QRMenu | null> {
    const dbQRMenu = qrmenuToDbFormat(qrmenu);
    const { data, error } = await supabase
      .from('qrmenus')
      .insert(dbQRMenu)
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu create error:', error);
      return null;
    }
    return dbToQRMenuFormat(data);
  },

  // QR Menu güncelle
  async update(id: string, updates: Partial<QRMenu>): Promise<QRMenu | null> {
    const dbQRMenu = qrmenuToDbFormat(updates);
    const { data, error } = await supabase
      .from('qrmenus')
      .update(dbQRMenu)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu update error:', error);
      return null;
    }
    return dbToQRMenuFormat(data);
  },

  // Slug kontrolü
  async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    if (!slug || slug.trim() === '') return false;
    
    let query = supabase
      .from('qrmenus')
      .select('id')
      .eq('slug', slug.toLowerCase().trim());
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Slug check error:', error);
      return false;
    }
    
    return !data || data.length === 0;
  },

  // View count artır
  async incrementViewCount(id: string): Promise<void> {
    const { error: rpcError } = await supabase.rpc('increment_qrmenu_views', { qrmenu_id_param: id });
    
    if (rpcError) {
      // RPC yoksa mevcut count'u al ve artır
      const { data: currentQRMenu } = await supabase
        .from('qrmenus')
        .select('view_count')
        .eq('id', id)
        .single();
      
      if (currentQRMenu) {
        await supabase
          .from('qrmenus')
          .update({ view_count: (typeof currentQRMenu.view_count === 'number' ? currentQRMenu.view_count : 0) + 1 })
          .eq('id', id);
      }
    }
  },

  // QR Menu sil
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenus')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // QR Menu Cards
  async createCard(qrmenuId: string, hash: string, groupName?: string): Promise<QRMenuCard | null> {
    const { data, error } = await supabase
      .from('qrmenu_cards')
      .insert({
        qrmenu_id: qrmenuId,
        hash: hash,
        group_name: groupName || null,
        is_active: true,
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Card create error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      hash: String(data.hash),
      groupName: data.group_name ? String(data.group_name) : undefined,
      isActive: Boolean(data.is_active),
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async getCardsByQRMenuId(qrmenuId: string): Promise<QRMenuCard[]> {
    const { data, error } = await supabase
      .from('qrmenu_cards')
      .select('*')
      .eq('qrmenu_id', qrmenuId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map((row: any) => ({
      id: String(row.id),
      qrmenuId: String(row.qrmenu_id),
      hash: String(row.hash),
      groupName: row.group_name ? String(row.group_name) : undefined,
      isActive: Boolean(row.is_active),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  },

  async getCardByHash(hash: string): Promise<QRMenuCard | null> {
    const { data, error } = await supabase
      .from('qrmenu_cards')
      .select('*')
      .eq('hash', hash)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      hash: String(data.hash),
      groupName: data.group_name ? String(data.group_name) : undefined,
      isActive: Boolean(data.is_active),
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async deleteCard(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenu_cards')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  async deleteMultipleCards(ids: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenu_cards')
      .delete()
      .in('id', ids);
    
    return !error;
  },

  async deleteGroup(qrmenuId: string, groupName: string): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenu_cards')
      .delete()
      .eq('qrmenu_id', qrmenuId)
      .eq('group_name', groupName);
    
    return !error;
  },

  // QR Menu Orders
  async createOrder(order: Partial<QRMenuOrder>): Promise<QRMenuOrder | null> {
    const { data, error } = await supabase
      .from('qrmenu_orders')
      .insert({
        qrmenu_id: order.qrmenuId,
        qrmenu_card_id: order.qrmenuCardId || null,
        customer_name: order.customerName || null,
        customer_phone: order.customerPhone || null,
        customer_email: order.customerEmail || null,
        table_number: order.tableNumber || null,
        items: order.items || [],
        notes: order.notes || null,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        service_charge: order.serviceCharge || 0,
        total: order.total || 0,
        order_status: order.orderStatus || 'pending',
        payment_status: order.paymentStatus || 'pending',
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Order create error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      qrmenuCardId: data.qrmenu_card_id ? String(data.qrmenu_card_id) : undefined,
      customerName: data.customer_name ? String(data.customer_name) : undefined,
      customerPhone: data.customer_phone ? String(data.customer_phone) : undefined,
      customerEmail: data.customer_email ? String(data.customer_email) : undefined,
      tableNumber: data.table_number ? String(data.table_number) : undefined,
      items: Array.isArray(data.items) ? data.items : [],
      notes: data.notes ? String(data.notes) : undefined,
      subtotal: typeof data.subtotal === 'number' ? data.subtotal : 0,
      tax: typeof data.tax === 'number' ? data.tax : 0,
      serviceCharge: typeof data.service_charge === 'number' ? data.service_charge : 0,
      total: typeof data.total === 'number' ? data.total : 0,
      orderStatus: String(data.order_status || 'pending') as QRMenuOrder['orderStatus'],
      paymentStatus: String(data.payment_status || 'pending') as QRMenuOrder['paymentStatus'],
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
      confirmedAt: data.confirmed_at ? String(data.confirmed_at) : undefined,
      completedAt: data.completed_at ? String(data.completed_at) : undefined,
    };
  },

  async getOrdersByQRMenuId(qrmenuId: string): Promise<QRMenuOrder[]> {
    const { data, error } = await supabase
      .from('qrmenu_orders')
      .select('*')
      .eq('qrmenu_id', qrmenuId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map((row: any) => ({
      id: String(row.id),
      qrmenuId: String(row.qrmenu_id),
      qrmenuCardId: row.qrmenu_card_id ? String(row.qrmenu_card_id) : undefined,
      customerName: row.customer_name ? String(row.customer_name) : undefined,
      customerPhone: row.customer_phone ? String(row.customer_phone) : undefined,
      customerEmail: row.customer_email ? String(row.customer_email) : undefined,
      tableNumber: row.table_number ? String(row.table_number) : undefined,
      items: Array.isArray(row.items) ? row.items : [],
      notes: row.notes ? String(row.notes) : undefined,
      subtotal: typeof row.subtotal === 'number' ? row.subtotal : 0,
      tax: typeof row.tax === 'number' ? row.tax : 0,
      serviceCharge: typeof row.service_charge === 'number' ? row.service_charge : 0,
      total: typeof row.total === 'number' ? row.total : 0,
      orderStatus: String(row.order_status || 'pending') as QRMenuOrder['orderStatus'],
      paymentStatus: String(row.payment_status || 'pending') as QRMenuOrder['paymentStatus'],
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      confirmedAt: row.confirmed_at ? String(row.confirmed_at) : undefined,
      completedAt: row.completed_at ? String(row.completed_at) : undefined,
    }));
  },

  async updateOrderStatus(id: string, orderStatus: QRMenuOrder['orderStatus'], paymentStatus?: QRMenuOrder['paymentStatus']): Promise<boolean> {
    const updateData: any = { order_status: orderStatus };
    
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }
    
    if (orderStatus === 'confirmed' && !updateData.confirmed_at) {
      updateData.confirmed_at = new Date().toISOString();
    }
    
    if (orderStatus === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('qrmenu_orders')
      .update(updateData)
      .eq('id', id);
    
    return !error;
  },

  // QR Menu Categories
  async getCategoriesByQRMenuId(qrmenuId: string): Promise<QRMenuCategory[]> {
    const { data, error } = await supabase
      .from('qrmenu_categories')
      .select('*')
      .eq('qrmenu_id', qrmenuId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error || !data) return [];
    
    return data.map((row: any) => ({
      id: String(row.id),
      qrmenuId: String(row.qrmenu_id),
      name: String(row.name),
      description: row.description ? String(row.description) : undefined,
      imageUrl: row.image_url ? String(row.image_url) : undefined,
      displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
      isActive: Boolean(row.is_active),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  },

  async createCategory(category: Partial<QRMenuCategory>): Promise<QRMenuCategory | null> {
    const { data, error } = await supabase
      .from('qrmenu_categories')
      .insert({
        qrmenu_id: category.qrmenuId,
        name: category.name || '',
        description: category.description || null,
        image_url: category.imageUrl || null,
        display_order: category.displayOrder || 0,
        is_active: category.isActive !== undefined ? category.isActive : true,
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Category create error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      name: String(data.name),
      description: data.description ? String(data.description) : undefined,
      imageUrl: data.image_url ? String(data.image_url) : undefined,
      displayOrder: typeof data.display_order === 'number' ? data.display_order : 0,
      isActive: Boolean(data.is_active),
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async updateCategory(id: string, updates: Partial<QRMenuCategory>): Promise<QRMenuCategory | null> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    
    const { data, error } = await supabase
      .from('qrmenu_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Category update error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      name: String(data.name),
      description: data.description ? String(data.description) : undefined,
      imageUrl: data.image_url ? String(data.image_url) : undefined,
      displayOrder: typeof data.display_order === 'number' ? data.display_order : 0,
      isActive: Boolean(data.is_active),
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenu_categories')
      .delete()
      .eq('id', id);
    
    return !error;
  },

  // QR Menu Items
  async getItemsByQRMenuId(qrmenuId: string): Promise<QRMenuItem[]> {
    const { data, error } = await supabase
      .from('qrmenu_items')
      .select('*')
      .eq('qrmenu_id', qrmenuId)
      .order('display_order', { ascending: true });
    
    if (error || !data) return [];
    
    return data.map((row: any) => ({
      id: String(row.id),
      qrmenuId: String(row.qrmenu_id),
      categoryId: row.category_id ? String(row.category_id) : undefined,
      name: String(row.name),
      description: row.description ? String(row.description) : undefined,
      price: typeof row.price === 'number' ? row.price : 0,
      imageUrl: row.image_url ? String(row.image_url) : undefined,
      isAvailable: Boolean(row.is_available),
      displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  },

  async getItemsByCategoryId(categoryId: string): Promise<QRMenuItem[]> {
    const { data, error } = await supabase
      .from('qrmenu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('display_order', { ascending: true });
    
    if (error || !data) return [];
    
    return data.map((row: any) => ({
      id: String(row.id),
      qrmenuId: String(row.qrmenu_id),
      categoryId: row.category_id ? String(row.category_id) : undefined,
      name: String(row.name),
      description: row.description ? String(row.description) : undefined,
      price: typeof row.price === 'number' ? row.price : 0,
      imageUrl: row.image_url ? String(row.image_url) : undefined,
      isAvailable: Boolean(row.is_available),
      displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  },

  async createItem(item: Partial<QRMenuItem>): Promise<QRMenuItem | null> {
    const { data, error } = await supabase
      .from('qrmenu_items')
      .insert({
        qrmenu_id: item.qrmenuId,
        category_id: item.categoryId || null,
        name: item.name || '',
        description: item.description || null,
        price: item.price || 0,
        image_url: item.imageUrl || null,
        is_available: item.isAvailable !== undefined ? item.isAvailable : true,
        display_order: item.displayOrder || 0,
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Item create error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      categoryId: data.category_id ? String(data.category_id) : undefined,
      name: String(data.name),
      description: data.description ? String(data.description) : undefined,
      price: typeof data.price === 'number' ? data.price : 0,
      imageUrl: data.image_url ? String(data.image_url) : undefined,
      isAvailable: Boolean(data.is_available),
      displayOrder: typeof data.display_order === 'number' ? data.display_order : 0,
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async updateItem(id: string, updates: Partial<QRMenuItem>): Promise<QRMenuItem | null> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId || null;
    
    const { data, error } = await supabase
      .from('qrmenu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('QR Menu Item update error:', error);
      return null;
    }
    
    return {
      id: String(data.id),
      qrmenuId: String(data.qrmenu_id),
      categoryId: data.category_id ? String(data.category_id) : undefined,
      name: String(data.name),
      description: data.description ? String(data.description) : undefined,
      price: typeof data.price === 'number' ? data.price : 0,
      imageUrl: data.image_url ? String(data.image_url) : undefined,
      isAvailable: Boolean(data.is_available),
      displayOrder: typeof data.display_order === 'number' ? data.display_order : 0,
      createdAt: String(data.created_at),
      updatedAt: String(data.updated_at),
    };
  },

  async deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('qrmenu_items')
      .delete()
      .eq('id', id);
    
    return !error;
  },
};

