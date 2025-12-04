'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { qrmenuDb, QRMenu, QRMenuCategory, QRMenuItem } from '@/lib/supabase-qrmenu';
import Image from 'next/image';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function QRMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [qrmenu, setQRMenu] = useState<QRMenu | null>(null);
  const [categories, setCategories] = useState<QRMenuCategory[]>([]);
  const [items, setItems] = useState<QRMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadQRMenu = async () => {
      try {
        const menu = await qrmenuDb.getBySlug(slug);
        if (!menu || !menu.isActive) {
          setLoading(false);
          return;
        }

        setQRMenu(menu);
        
        // View count artır
        await qrmenuDb.incrementViewCount(menu.id);

        // Kategorileri ve öğeleri yükle
        const [categoriesData, itemsData] = await Promise.all([
          qrmenuDb.getCategoriesByQRMenuId(menu.id),
          qrmenuDb.getItemsByQRMenuId(menu.id),
        ]);
        
        setCategories(categoriesData);
        setItems(itemsData);
        
      } catch (error) {
        console.error('Error loading QR Menu:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadQRMenu();
    }
  }, [slug]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!qrmenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Menu bulunamadı</h1>
          <p className="text-gray-600">Bu QR menu aktif değil veya mevcut değil.</p>
        </div>
      </div>
    );
  }

  const bgColor = qrmenu.backgroundColor || qrmenu.primaryColor || '#dc2626';
  const headerColor = qrmenu.headerColor || qrmenu.primaryColor || '#dc2626';
  const categoryColor = qrmenu.categoryColor || qrmenu.primaryColor || '#dc2626';
  const itemColor = qrmenu.itemColor || qrmenu.primaryColor || '#dc2626';
  const textColor = qrmenu.textColor || '#111827';

  return (
    <div className="min-h-screen" style={{ backgroundColor: qrmenu.secondaryColor || '#fef2f2' }}>
      {/* Header - Sticky */}
      <div 
        className="w-full sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: headerColor }}
      >
        {qrmenu.coverImageUrl && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={qrmenu.coverImageUrl}
              alt={qrmenu.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {qrmenu.logoUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                  <Image
                    src={qrmenu.logoUrl}
                    alt={qrmenu.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{qrmenu.name}</h1>
                {qrmenu.description && (
                  <p className="text-white/90 text-sm mt-1">{qrmenu.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-medium flex items-center gap-2 transition-colors backdrop-blur-sm"
            >
              {showMenu ? <X size={20} /> : <Menu size={20} />}
              <span className="hidden sm:inline">{showMenu ? 'Kapat' : 'Menü'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Home Page - Initial View */}
      {!showMenu && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              {qrmenu.logoUrl && (
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-white p-3 shadow-xl">
                  <Image
                    src={qrmenu.logoUrl}
                    alt={qrmenu.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{qrmenu.name}</h2>
              {qrmenu.description && (
                <p className="text-xl text-gray-600 mb-8">{qrmenu.description}</p>
              )}
            </div>

            {/* Contact & Social Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">İletişim</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {qrmenu.phone && (
                  <a 
                    href={`tel:${qrmenu.phone}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="font-semibold text-gray-900 group-hover:underline">{qrmenu.phone}</p>
                    </div>
                  </a>
                )}
                {qrmenu.email && (
                  <a 
                    href={`mailto:${qrmenu.email}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 group-hover:underline">{qrmenu.email}</p>
                    </div>
                  </a>
                )}
                {qrmenu.address && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                      <MapPin className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adres</p>
                      <p className="font-semibold text-gray-900">{qrmenu.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(qrmenu.instagram || qrmenu.facebook || qrmenu.twitter) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Sosyal Medya</h4>
                  <div className="flex justify-center gap-4">
                    {qrmenu.instagram && (
                      <a
                        href={`https://instagram.com/${qrmenu.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Instagram size={24} className="text-white" />
                      </a>
                    )}
                    {qrmenu.facebook && (
                      <a
                        href={`https://facebook.com/${qrmenu.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Facebook size={24} className="text-white" />
                      </a>
                    )}
                    {qrmenu.twitter && (
                      <a
                        href={`https://twitter.com/${qrmenu.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Twitter size={24} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Button */}
            <div className="text-center">
              <button
                onClick={() => setShowMenu(true)}
                className="px-8 py-4 text-xl font-bold text-white rounded-xl hover:opacity-90 transition-opacity shadow-xl"
                style={{ backgroundColor: bgColor }}
              >
                Menüyü Görüntüle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Page - Accordion Categories */}
      {showMenu && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {categories.length === 0 && items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-600 text-lg">Menü henüz hazırlanmamış.</p>
                <p className="text-gray-500 mt-2">Lütfen daha sonra tekrar kontrol edin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryItems = items.filter(item => item.categoryId === category.id && item.isAvailable);
                  const isExpanded = expandedCategories.has(category.id);

                  return (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all"
                    >
                      {/* Category Header - Clickable */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        style={{ backgroundColor: isExpanded ? `${categoryColor}10` : 'transparent' }}
                      >
                        <div className="flex items-center gap-4 flex-1 text-left">
                          {category.imageUrl && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={category.imageUrl}
                                alt={category.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 
                              className="text-2xl font-bold mb-1"
                              style={{ color: categoryColor }}
                            >
                              {category.name}
                            </h2>
                            {category.description && (
                              <p className="text-gray-600 text-sm">{category.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {categoryItems.length} ürün
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {isExpanded ? (
                            <ChevronUp size={24} style={{ color: categoryColor }} />
                          ) : (
                            <ChevronDown size={24} style={{ color: categoryColor }} />
                          )}
                        </div>
                      </button>

                      {/* Category Items - Accordion Content */}
                      {isExpanded && categoryItems.length > 0 && (
                        <div className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categoryItems.map((item) => (
                              <div
                                key={item.id}
                                className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all bg-white"
                              >
                                {item.imageUrl && (
                                  <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <h3 className="font-bold text-lg mb-1 text-gray-900">{item.name}</h3>
                                {item.description && (
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <span 
                                    className="text-xl font-bold"
                                    style={{ color: itemColor }}
                                  >
                                    {item.price.toFixed(2)} ₺
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
