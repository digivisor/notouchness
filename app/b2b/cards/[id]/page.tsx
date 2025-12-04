'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Download, QrCode, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CardSVG from '@/app/components/CardSVG';
import { useCard } from '@/app/context/CardContext';
import { createRoot } from 'react-dom/client';
import B2BSidebar from '../../components/B2BSidebar';

type DealerPurchase = {
  id: string;
  dealer_id: string;
  sales_card_id: string;
  dealer_price: number;
  currency: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
  status: string;
  notes?: string | null;
  sales_card: {
    id: string;
    name: string;
    price: number;
    currency: string;
    category: string;
    image_front: string;
    image_back?: string | null;
    description?: string | null;
  };
  dealer: {
    id: string;
    name: string;
    email: string;
    logo_url?: string | null;
  };
};

type CardData = {
  id: string;
  cardHash: string;
  qrCodeUrl?: string;
  cardUrl?: string;
  name: string;
  subtitle: string;
  logo?: string;
  svgOutput?: string;
};

export default function B2BCardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;
  const { createCardByAdmin } = useCard();

  const [purchase, setPurchase] = useState<DealerPurchase | null>(null);
  const [dealer, setDealer] = useState<{ id: string; name: string; email: string; logo_url?: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isCreatingCards, setIsCreatingCards] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // QR kod ayarları
  const [qrSettings] = useState({
    size: 37.6,
    x: 203.6,
    y: 100.8
  });

  useEffect(() => {
    const session = localStorage.getItem('b2b_session');
    if (!session) {
      router.push('/b2b/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      if (parsed.dealer) {
        setDealer(parsed.dealer);
      }
    } catch (e) {
      router.push('/b2b/login');
      return;
    }

    void loadPurchase();
  }, [purchaseId, router]);

  const loadPurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('dealer_purchases')
        .select(`
          *,
          sales_card:sales_cards(*),
          dealer:dealers(id, name, email, logo_url)
        `)
        .eq('id', purchaseId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const purchaseData = data as DealerPurchase;
      setPurchase(purchaseData);

      // Bu purchase için oluşturulmuş kartları yükle
      await loadCards(purchaseData.id, purchaseData);
    } catch (err: any) {
      setError(err.message || 'Kart bilgileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCards = async (purchaseId: string, purchaseData?: DealerPurchase) => {
    try {
      // Purchase'a ait kartları yükle
      const { data: purchaseCards, error: fetchError } = await supabase
        .from('dealer_purchase_cards')
        .select(`
          *,
          card:cards(id, username, full_name)
        `)
        .eq('dealer_purchase_id', purchaseId);

      if (fetchError) {
        console.error('Kartlar yüklenirken hata:', fetchError);
        setCards([]);
        return;
      }

      if (!purchaseCards || purchaseCards.length === 0) {
        setCards([]);
        return;
      }

      // Purchase data'yı kullan (parametre olarak geçilmediyse state'ten al)
      const currentPurchase = purchaseData || purchase;
      if (!currentPurchase) {
        console.error('Purchase data bulunamadı');
        setCards([]);
        return;
      }

      // Kartları CardData formatına dönüştür
      const loadedCards: CardData[] = await Promise.all(
        purchaseCards.map(async (pc: any) => {
          const cardId = pc.card_id;
          const cardUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/card/${cardId}`
            : '';

          // QR kodunu SVG string olarak oluştur
          const qrCodeSvgString = await generateQRCodeSVGString(cardUrl);

          // CardSVG component'inden SVG oluştur
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          document.body.appendChild(tempDiv);

          const reactRoot = createRoot(tempDiv);
          reactRoot.render(
            React.createElement(CardSVG, {
              name: currentPurchase.dealer.name,
              subtitle: currentPurchase.sales_card.name,
              logo: currentPurchase.dealer.logo_url || '/notouchness1.png',
              qrCode: undefined,
            })
          );

          await new Promise(resolve => setTimeout(resolve, 300));

          const svgElement = tempDiv.querySelector('svg');
          let svgContent = '';
          if (svgElement) {
            const serializer = new XMLSerializer();
            svgContent = serializer.serializeToString(svgElement);
          }
          document.body.removeChild(tempDiv);

          // QR kodunu SVG'ye ekle
          svgContent = updateSVGWithQRCode(svgContent, qrCodeSvgString);

          return {
            id: cardId,
            cardHash: cardId,
            qrCodeUrl: cardUrl,
            cardUrl: cardUrl,
            name: currentPurchase.dealer.name,
            subtitle: currentPurchase.sales_card.name,
            logo: currentPurchase.dealer.logo_url || '/notouchness1.png',
            svgOutput: svgContent,
          };
        })
      );

      setCards(loadedCards);
      if (loadedCards.length > 0) {
        setActiveCardIndex(0);
      }
    } catch (err) {
      console.error('Kartlar yüklenirken hata:', err);
      setCards([]);
    }
  };

  const generateQRCodeSVGString = async (cardUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '200px';
        tempDiv.style.height = '200px';
        document.body.appendChild(tempDiv);

        const root = React.createElement(QRCodeSVG, {
          value: cardUrl,
          size: 200,
          level: 'H',
          includeMargin: true,
        });

        const reactRoot = createRoot(tempDiv);
        reactRoot.render(root);

        setTimeout(() => {
          const svgElement = tempDiv.querySelector('svg');
          if (svgElement) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            document.body.removeChild(tempDiv);
            resolve(svgString);
          } else {
            document.body.removeChild(tempDiv);
            reject(new Error('QR kod SVG oluşturulamadı'));
          }
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateSVGWithQRCode = (
    svgContent: string,
    qrCodeSvgString: string,
    qrX: number = qrSettings.x,
    qrY: number = qrSettings.y,
    qrSize: number = qrSettings.size
  ): string => {
    if (!svgContent || !qrCodeSvgString) return svgContent;

    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      if (!svgElement) return svgContent;

      // QR kod SVG'yi parse et
      const qrParser = new DOMParser();
      const qrDoc = qrParser.parseFromString(qrCodeSvgString, 'image/svg+xml');
      const qrSvgElement = qrDoc.documentElement;

      if (!qrSvgElement) return svgContent;

      // QR kod wrapper group oluştur
      const qrGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      qrGroup.setAttribute('data-qr-code-wrapper', 'true');
      qrGroup.setAttribute('transform', `translate(${qrX},${qrY}) scale(${qrSize / 200})`);

      // QR kod içeriğini kopyala
      const qrFirstGroup = qrSvgElement.querySelector('g');
      if (qrFirstGroup) {
        const importedGroup = svgDoc.importNode(qrFirstGroup, true);
        qrGroup.appendChild(importedGroup);
      }

      // QR kod wrapper'ı SVG'ye ekle
      svgElement.appendChild(qrGroup);

      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgDoc);
    } catch (error) {
      console.error('SVG güncelleme hatası:', error);
      return svgContent;
    }
  };

  const handleCreateCards = async () => {
    if (!purchase) return;

    setIsCreatingCards(true);
    setError(null);

    try {
      const newCards: CardData[] = [];
      const totalCards = purchase.quantity;

      // Grup adını oluştur: "Bayi Adı/Bayi Adı - DD.MM.YYYY HH:MM"
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dealerName = purchase.dealer.name;
      const dateTimeStr = `${day}.${month}.${year} ${hours}:${minutes}`;
      const groupName = `${dealerName}/${dealerName} - ${dateTimeStr}`;

      for (let i = 0; i < totalCards; i++) {
        // Yeni kart oluştur (grup adı ile)
        const newCard = await createCardByAdmin(undefined, groupName, 'nfc');
        if (!newCard) {
          throw new Error('Kart oluşturulamadı');
        }

        // Kart URL'ini oluştur
        const cardUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/card/${newCard.id}`
          : '';

        // QR kodunu SVG string olarak oluştur
        const qrCodeSvgString = await generateQRCodeSVGString(cardUrl);

        // CardSVG component'inden SVG oluştur
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        const reactRoot = createRoot(tempDiv);
        reactRoot.render(
          React.createElement(CardSVG, {
            name: purchase.dealer.name,
            subtitle: purchase.sales_card.name,
            logo: purchase.dealer.logo_url || '/notouchness1.png',
            qrCode: undefined, // QR kod sonra eklenecek
          })
        );

        await new Promise(resolve => setTimeout(resolve, 300));

        const svgElement = tempDiv.querySelector('svg');
        let svgContent = '';
        if (svgElement) {
          const serializer = new XMLSerializer();
          svgContent = serializer.serializeToString(svgElement);
        }
        document.body.removeChild(tempDiv);

        // QR kodunu SVG'ye ekle
        svgContent = updateSVGWithQRCode(svgContent, qrCodeSvgString);

        // Kartı DB'ye kaydet (dealer_purchase_cards tablosuna)
        const { error: linkError } = await supabase
          .from('dealer_purchase_cards')
          .insert({
            dealer_purchase_id: purchase.id,
            card_id: newCard.id,
          });

        if (linkError) {
          console.error('Kart ilişkilendirme hatası:', linkError);
          // Hata olsa bile devam et
        }

        // Kart verisini oluştur
        const cardData: CardData = {
          id: newCard.id,
          cardHash: newCard.id,
          qrCodeUrl: cardUrl,
          cardUrl: cardUrl,
          name: purchase.dealer.name,
          subtitle: purchase.sales_card.name,
          logo: purchase.dealer.logo_url || '/notouchness1.png',
          svgOutput: svgContent,
        };

        newCards.push(cardData);
      }

      // Kartları DB'den tekrar yükle (güncel durumu görmek için)
      await loadCards(purchase.id, purchase);
    } catch (err: any) {
      setError(err.message || 'Kartlar oluşturulurken hata oluştu');
    } finally {
      setIsCreatingCards(false);
    }
  };

  const handleDownloadSVG = (card: CardData) => {
    if (!card.svgOutput) return;

    const blob = new Blob([card.svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name}_${card.subtitle}_${card.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = (cardUrl: string, cardId: string) => {
    navigator.clipboard.writeText(cardUrl);
    setCopiedCardId(cardId);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error && !purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/b2b/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return null;
  }

  const activeCard = cards[activeCardIndex];


  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <B2BSidebar dealer={dealer} activeTab="my-cards" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-[60]">
          <div className="px-6 py-4">
            <button
              onClick={() => router.push('/b2b/dashboard?tab=my-cards')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-2"
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{purchase.sales_card.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Kart Detayları ve Yönetimi</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">

        {/* Purchase Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Miktar</p>
              <p className="text-lg font-semibold">{purchase.quantity} adet</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Birim Fiyat</p>
              <p className="text-lg font-semibold">
                {purchase.dealer_price} {purchase.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Toplam Tutar</p>
              <p className="text-lg font-semibold text-blue-600">
                {purchase.total_amount} {purchase.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Satın Alma Tarihi</p>
              <p className="text-lg font-semibold">
                {new Date(purchase.purchase_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Durum</p>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                purchase.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : purchase.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {purchase.status === 'completed' ? 'Tamamlandı' : purchase.status === 'pending' ? 'Beklemede' : 'Başarısız'}
              </span>
            </div>
            {purchase.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notlar</p>
                <p className="text-sm text-gray-700">{purchase.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Actions */}
        {cards.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Kartlar Oluştur</h2>
                <p className="text-gray-600">
                  Bu satın alma için {purchase.quantity} adet kart oluşturabilirsiniz. Her kart için QR kod ve link otomatik oluşturulacak.
                </p>
              </div>
              <button
                onClick={handleCreateCards}
                disabled={isCreatingCards}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isCreatingCards ? 'Oluşturuluyor...' : 'Kartları Oluştur'}
              </button>
            </div>
          </div>
        )}

        {/* Cards Display */}
        {cards.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Oluşturulan Kartlar ({cards.length}/{purchase.quantity})
              </h2>
              {cards.length < purchase.quantity && (
                <button
                  onClick={handleCreateCards}
                  disabled={isCreatingCards}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isCreatingCards ? 'Oluşturuluyor...' : 'Daha Fazla Oluştur'}
                </button>
              )}
            </div>

            {/* Card Selector */}
            {cards.length > 1 && (
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  {cards.map((card, index) => (
                    <button
                      key={card.id}
                      onClick={() => setActiveCardIndex(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCardIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Kart {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Card Display */}
            {activeCard && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kart Önizleme</h3>
                  {activeCard.svgOutput ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div
                        dangerouslySetInnerHTML={{ __html: activeCard.svgOutput }}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 shadow-sm min-h-[200px] flex items-center justify-center">
                      <p className="text-gray-500">Kart yükleniyor...</p>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kart Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Kart Adı</p>
                        <p className="font-semibold">{activeCard.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Alt Başlık</p>
                        <p className="font-semibold">{activeCard.subtitle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Kart ID</p>
                        <p className="font-mono text-sm">{activeCard.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {activeCard.qrCodeUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <QrCode size={20} />
                        QR Kod
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <QRCodeSVG
                          value={activeCard.qrCodeUrl}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                  )}

                  {/* Card Link */}
                  {activeCard.cardUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <LinkIcon size={20} />
                        Kart Linki
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={activeCard.cardUrl}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopyLink(activeCard.cardUrl!, activeCard.id)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Kopyala"
                        >
                          {copiedCardId === activeCard.id ? (
                            <Check size={20} className="text-green-600" />
                          ) : (
                            <Copy size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleDownloadSVG(activeCard)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      <Download size={20} />
                      SVG İndir
                    </button>
                    {activeCard.cardUrl && (
                      <a
                        href={activeCard.cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                      >
                        <LinkIcon size={20} />
                        Kartı Görüntüle
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

