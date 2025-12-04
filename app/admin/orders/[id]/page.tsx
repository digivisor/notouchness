'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import Toast from '../../../components/Toast';
import { supabase } from '../../../../lib/supabase';
import { ArrowLeft, XCircle, Download, Plus } from 'lucide-react';
import { CardData } from '../../../components/ProductModal';
import CardSVG from '../../../components/CardSVG';
import { useCard } from '../../../context/CardContext';
import { QRCodeSVG } from 'qrcode.react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  total: number;
  cardsData?: CardData[]; // Kart verileri
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method?: string;
  payment_status: string;
  order_status: string;
  customer_note?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeCardTab, setActiveCardTab] = useState<{ [itemId: string]: number }>({});
  const [isCreatingCards, setIsCreatingCards] = useState(false);
  const { createCardByAdmin } = useCard();
  
  // QR kod ayarları (default QR pozisyonu: x=203.6, y=100.8)
  const [qrSettings, setQrSettings] = useState({
    size: 37.6, // Genişlik/yükseklik
    x: 203.6,   // X pozisyonu (default QR'ın pozisyonu)
    y: 100.8    // Y pozisyonu (default QR'ın pozisyonu)
  });
  
  // QR kod data URL'leri için state (her kart için)
  const [qrDataUrls, setQrDataUrls] = useState<{ [cardHash: string]: string }>({});
  
  // Kart verilerini düzenlemek için local state
  const [localCardsData, setLocalCardsData] = useState<{ [itemId: string]: CardData[] }>({});

  useEffect(() => {
    // Admin kontrolü
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    // Siparişi yükle
    const loadOrder = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        setToast({ message: 'Sipariş yüklenemedi!', type: 'error' });
        console.error(error);
        router.push('/admin/orders');
      } else {
        setOrder(data);
        // Her item için aktif tab'ı başlat
        if (data?.items) {
          const tabs: { [itemId: string]: number } = {};
          data.items.forEach((item: OrderItem, itemIndex: number) => {
            if (item.cardsData && item.cardsData.length > 0) {
              tabs[`${itemIndex}`] = 0;
            }
          });
          setActiveCardTab(tabs);
        }
      }
      setIsLoading(false);
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, router]);

  // QR kod data URL'lerini oluştur
  useEffect(() => {
    if (!order || typeof window === 'undefined') return;
    
    const generateQRDataUrls = async () => {
      const newUrls: { [cardHash: string]: string } = {};
      
      for (const item of order.items) {
        if (item.cardsData) {
          for (const card of item.cardsData) {
            if (card.cardHash) {
              const cardUrl = `${window.location.origin}/card/${card.cardHash}`;
              
              try {
                const qrSvgString = await generateQRCodeSVGString(cardUrl);
                const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
                const dataUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                newUrls[card.cardHash] = dataUrl;
              } catch (error) {
                console.error('QR kod data URL oluşturma hatası:', error);
              }
            }
          }
        }
      }
      
      setQrDataUrls(newUrls);
    };
    
    generateQRDataUrls();
  }, [order]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // SVG indirme fonksiyonu
  const downloadSVG = (svgContent: string, fileName: string) => {
    try {
      if (!svgContent || svgContent.trim() === '') {
        setToast({ message: 'SVG çıktısı mevcut değil!', type: 'error' });
        return;
      }

      // SVG içeriğini temizle ve düzenle
      let svg = svgContent.trim();
      
      // Eğer HTML içinde SVG varsa, sadece SVG kısmını al
      if (svg.includes('<svg')) {
        const svgMatch = svg.match(/<svg[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          svg = svgMatch[0];
        } else {
          setToast({ message: 'SVG formatı geçersiz!', type: 'error' });
          return;
        }
      } else {
        setToast({ message: 'SVG içeriği bulunamadı!', type: 'error' });
        return;
      }

      // SVG'yi parse et ve <image> elementlerindeki href'leri xlink:href'e çevir (Illustrator uyumluluğu için)
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // xmlns:xlink namespace'ini ekle
      if (!svgElement.hasAttribute('xmlns:xlink')) {
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }
      
      // Tüm <image> elementlerini bul ve href'i xlink:href'e çevir
      const imageElements = svgElement.querySelectorAll('image');
      imageElements.forEach((img) => {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href) {
          // xlink:href ekle (Illustrator için gerekli)
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
          // href'i de koru (modern tarayıcılar için)
          if (!img.hasAttribute('href')) {
            img.setAttribute('href', href);
          }
        }
      });
      
      // SVG'yi string'e çevir
      const serializer = new XMLSerializer();
      svg = serializer.serializeToString(svgElement);

      // SVG'yi blob'a çevir
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.svg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setToast({ message: 'SVG başarıyla indirildi!', type: 'success' });
    } catch (error) {
      console.error('SVG indirme hatası:', error);
      setToast({ message: 'SVG indirilemedi!', type: 'error' });
    }
  };

  // Logo indirme fonksiyonu
  const downloadLogo = (logoUrl: string, fileName: string) => {
    try {
      fetch(logoUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Dosya uzantısını belirle
          const extension = logoUrl.split('.').pop()?.split('?')[0] || 'png';
          link.download = `${fileName}.${extension}`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setToast({ message: 'Logo başarıyla indirildi!', type: 'success' });
        })
        .catch(error => {
          console.error('Logo indirme hatası:', error);
          setToast({ message: 'Logo indirilemedi!', type: 'error' });
        });
    } catch (error) {
      console.error('Logo indirme hatası:', error);
      setToast({ message: 'Logo indirilemedi!', type: 'error' });
    }
  };

  // QR kodunu SVG string olarak oluştur (qrcode.react ile - dashboard'daki gibi)
  const generateQRCodeSVGString = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // QR kod boyutu (dashboard'daki gibi)
        const qrSize = 200;
        
        // Geçici bir div oluştur
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = `${qrSize}px`;
        tempDiv.style.height = `${qrSize}px`;
        tempDiv.id = 'temp-qr-container';
        document.body.appendChild(tempDiv);
        
        // React'i dinamik import et
        import('react-dom/client').then((ReactDOM) => {
          // QRCodeSVG component'ini render et
          const root = ReactDOM.createRoot(tempDiv);
          root.render(
            React.createElement(QRCodeSVG, {
              value: url,
              size: qrSize,
              level: 'H', // Error correction level H (yüksek)
              includeMargin: false,
            })
          );
          
          // QR kodun render olmasını bekle
          setTimeout(() => {
            const svgElement = tempDiv.querySelector('svg');
            if (svgElement) {
              // SVG'yi klonla ve namespace'leri düzelt
              const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
              clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
              
              // SVG string'ini al
              const svgString = new XMLSerializer().serializeToString(clonedSvg);
              
              // Temizlik
              root.unmount();
              if (tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
              }
              
              resolve(svgString);
            } else {
              root.unmount();
              if (tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
              }
              console.error('QR kod SVG elementi bulunamadı');
              reject(new Error('QR kod SVG elementi bulunamadı'));
            }
          }, 100); // Render için kısa bir bekleme
        }).catch((error) => {
          if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
          }
          console.error('QR kod oluşturma hatası:', error);
          reject(error);
        });
      } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        reject(error);
      }
    });
  };
  
  // SVG'yi QR kod ile güncelle
  const updateSVGWithQRCode = (svgContent: string, qrCodeSvgString: string, qrX: number = qrSettings.x, qrY: number = qrSettings.y, qrSize: number = qrSettings.size, nameFontWeight: number = 500, subtitleFontWeight: number = 300, nameFontSize: number = 14, subtitleFontSize: number = 10): string => {
    if (!svgContent || !qrCodeSvgString) return svgContent;
    
    try {
      // SVG string'ini parse et
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // QR kod SVG'sini parse et
      const qrParser = new DOMParser();
      const qrDoc = qrParser.parseFromString(qrCodeSvgString, 'image/svg+xml');
      const qrSvgElement = qrDoc.documentElement;
      
      // Debug: QR kod SVG'sinin içeriğini kontrol et
      console.log('QR kod SVG içeriği:', {
        hasSvgElement: !!qrSvgElement,
        childNodesCount: qrSvgElement.childNodes.length,
        rects: qrSvgElement.querySelectorAll('rect').length,
        paths: qrSvgElement.querySelectorAll('path').length,
        qrSvgString: qrCodeSvgString.substring(0, 200)
      });
      
      // ÖNCE: Mevcut tüm QR kodlarını temizle (eski QR'ları sil)
      // data-qr-code-wrapper attribute'u olan tüm elementleri sil
      const existingQrWrappers = svgElement.querySelectorAll('[data-qr-code-wrapper]');
      existingQrWrappers.forEach(wrapper => wrapper.remove());
      
      // Transform içinde translate ve scale olan g elementlerini kontrol et ve QR kod olanları sil
      // const allGroupsBeforeClean = Array.from(svgElement.querySelectorAll('g'));
      // allGroupsBeforeClean.forEach(g => {
      //   const transform = g.getAttribute('transform') || '';
      //   // Eğer transform içinde translate ve scale varsa ve içinde çok sayıda path/rect varsa, QR kod olabilir
      //   if (transform.includes('translate') && transform.includes('scale')) {
      //     const paths = g.querySelectorAll('path, rect');
      //     // Eğer 50'den fazla path/rect varsa, muhtemelen QR kod
      //     if (paths.length > 50) {
      //       g.remove();
      //     }
      //   }
      // });
      
      // Statik QR kod alanını bul - içinde çok sayıda rect olan g element'i
      // İlk rect'in x="203.6" y="100.8" konumunda olması gerekiyor
      const allGroups = Array.from(svgElement.querySelectorAll('g'));
      const qrGroup = allGroups.find((g) => {
        const rects = g.querySelectorAll('rect');
        if (rects.length > 50) {
          // İlk rect'in konumunu kontrol et
          const firstRect = rects[0];
          if (firstRect) {
            const x = parseFloat(firstRect.getAttribute('x') || '0');
            const y = parseFloat(firstRect.getAttribute('y') || '0');
            // Statik QR kodun ilk rect'i x=203.6, y=100.8 konumunda
            return Math.abs(x - 203.6) < 0.5 && Math.abs(y - 100.8) < 0.5;
          }
        }
        return false;
      });
      
      if (qrGroup) {
        // Mevcut QR kod path'lerini kaldır (eski QR'ı sil)
        // Mevcut statik QR kod path'lerini de kaldır
        qrGroup.innerHTML = '';
        
        // QR group içindeki tüm child'ları da temizle (g elementleri dahil)
        while (qrGroup.firstChild) {
          qrGroup.removeChild(qrGroup.firstChild);
        }
        
        // QR kod boyutunu ve pozisyonunu ayarla
        // QR kod 200x200 olarak oluşturuldu
        const scale = qrSize / 200;
        
        // QR kod içeriğini bir g element'ine sar ve transform uygula (basit ve Illustrator uyumlu)
        const qrGroupWrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
        qrGroupWrapper.setAttribute("data-qr-code-wrapper", "true");
        qrGroupWrapper.setAttribute("transform", `translate(${qrX}, ${qrY}) scale(${scale})`);
        
        // QR kod SVG'sinin tüm içeriğini direkt olarak ekle (defs dahil)
        // Önce defs'i ekle (varsa)
        const qrDefs = qrSvgElement.querySelector('defs');
        if (qrDefs) {
          const importedDefs = svgElement.ownerDocument.importNode(qrDefs, true);
          // Ana SVG'ye defs ekle (eğer yoksa)
          let mainDefs = svgElement.querySelector('defs');
          if (!mainDefs) {
            mainDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgElement.insertBefore(mainDefs, svgElement.firstChild);
          }
          // QR kod defs içeriğini ana defs'e ekle
          Array.from(importedDefs.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const importedNode = svgElement.ownerDocument.importNode(node, true);
              mainDefs!.appendChild(importedNode);
            }
          });
        }
        
        // QR kod SVG'sini Illustrator uyumlu hale getir
        // 1. clipPath içindeki path'leri bul ve dışarı çıkar
        // 2. fill="none" olan path'leri kaldır
        // 3. opacity attribute'larını kaldır
        // 4. Path'leri direkt ekle
        
        // Önce tüm path ve rect elementlerini bul (clipPath içindekiler dahil)
        const allQrPaths = qrSvgElement.querySelectorAll('path, rect');
        console.log('QR kod toplam path/rect sayısı (if):', allQrPaths.length);
        
        allQrPaths.forEach((element) => {
          // Defs içindeki elementleri atla
          if (element.parentElement?.tagName === 'defs' || element.parentElement?.tagName === 'DEFS') {
            return;
          }
          
          const fill = element.getAttribute('fill');
          
          // fill="none" veya fill yoksa atla (Illustrator bunları render etmez)
          if (fill === 'none' || fill === null || fill === '') {
            return;
          }
          
          // fill="#FFFFFF" veya fill="white" olan beyaz arka plan path'ini atla
          // (QR kod için sadece siyah kareler önemli)
          if (fill === '#FFFFFF' || fill === '#fff' || fill === '#ffffff' || fill === 'white') {
            return;
          }
          
          // Element'i import et
          const importedNode = svgElement.ownerDocument.importNode(element, true) as Element;
          
          // Tüm problematik attribute'ları kaldır (Illustrator uyumluluğu için)
          importedNode.removeAttribute('opacity');
          importedNode.removeAttribute('clip-path');
          importedNode.removeAttribute('clipPath');
          importedNode.removeAttribute('shape-rendering');
          importedNode.removeAttribute('role');
          
          // Style attribute'unu tamamen temizle veya kaldır
          importedNode.removeAttribute('style');
          
          // Fill'i garantile - siyah olmalı
          if (!importedNode.getAttribute('fill') || importedNode.getAttribute('fill') === '#FFFFFF') {
            importedNode.setAttribute('fill', '#000000');
          }
          
          // Path için stroke'u kaldır (sadece fill kullan)
          if (importedNode.tagName === 'path') {
            importedNode.removeAttribute('stroke');
            importedNode.removeAttribute('stroke-width');
          }
          
          qrGroupWrapper.appendChild(importedNode);
        });
        
        // Eğer path/rect bulunamadıysa, tüm child'ları ekle
        if (qrGroupWrapper.children.length === 0) {
          console.log('Path/rect bulunamadı (if), child node\'ları ekleniyor...');
          Array.from(qrSvgElement.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              console.log('Child element (if):', element.tagName);
              // Defs, svg ve clipPath tag'lerini atla
              if (element.tagName !== 'defs' && element.tagName !== 'DEFS' && 
                  element.tagName !== 'svg' && element.tagName !== 'SVG' &&
                  element.tagName !== 'clipPath' && element.tagName !== 'CLIPPATH') {
                const importedNode = svgElement.ownerDocument.importNode(element, true) as Element;
                // clip-path attribute'unu kaldır
                importedNode.removeAttribute('clip-path');
                importedNode.removeAttribute('clipPath');
                qrGroupWrapper.appendChild(importedNode);
              }
            }
          });
        }
        
        console.log('QR group wrapper\'a eklenen element sayısı (if):', qrGroupWrapper.children.length);
        
        // xlink namespace ekle
        svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        
         qrGroup.appendChild(qrGroupWrapper);
      } else {
        // QR kod grubunu bulamazsak, default QR pozisyonunda yeni bir grup oluştur
        const scale = qrSize / 200;
        const qrGroupWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        qrGroupWrapper.setAttribute('data-qr-code-wrapper', 'true');
        qrGroupWrapper.setAttribute('transform', `translate(${qrX}, ${qrY}) scale(${scale})`);
        
        // QR kod SVG'sinin tüm içeriğini direkt olarak ekle (defs dahil)
        // Önce defs'i ekle (varsa)
        const qrDefs = qrSvgElement.querySelector('defs');
        if (qrDefs) {
          const importedDefs = svgElement.ownerDocument.importNode(qrDefs, true);
          // Ana SVG'ye defs ekle (eğer yoksa)
          let mainDefs = svgElement.querySelector('defs');
          if (!mainDefs) {
            mainDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgElement.insertBefore(mainDefs, svgElement.firstChild);
          }
          // QR kod defs içeriğini ana defs'e ekle
          Array.from(importedDefs.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const importedNode = svgElement.ownerDocument.importNode(node, true);
              mainDefs!.appendChild(importedNode);
            }
          });
        }
        
        // QR kod SVG'sini Illustrator uyumlu hale getir
        // 1. clipPath içindeki path'leri bul ve dışarı çıkar
        // 2. fill="none" olan path'leri kaldır
        // 3. opacity attribute'larını kaldır
        // 4. Path'leri direkt ekle
        
        // Önce tüm path ve rect elementlerini bul (clipPath içindekiler dahil)
        const allQrPaths = qrSvgElement.querySelectorAll('path, rect');
        console.log('QR kod toplam path/rect sayısı (else):', allQrPaths.length);
        
        allQrPaths.forEach((element) => {
          // Defs içindeki elementleri atla
          if (element.parentElement?.tagName === 'defs' || element.parentElement?.tagName === 'DEFS') {
            return;
          }
          
          const fill = element.getAttribute('fill');
          
          // fill="none" veya fill yoksa atla (Illustrator bunları render etmez)
          if (fill === 'none' || fill === null || fill === '') {
            return;
          }
          
          // fill="#FFFFFF" veya fill="white" olan beyaz arka plan path'ini atla
          // (QR kod için sadece siyah kareler önemli)
          if (fill === '#FFFFFF' || fill === '#fff' || fill === '#ffffff' || fill === 'white') {
            return;
          }
          
          // Element'i import et
          const importedNode = svgElement.ownerDocument.importNode(element, true) as Element;
          
          // Tüm problematik attribute'ları kaldır (Illustrator uyumluluğu için)
          importedNode.removeAttribute('opacity');
          importedNode.removeAttribute('clip-path');
          importedNode.removeAttribute('clipPath');
          importedNode.removeAttribute('shape-rendering');
          importedNode.removeAttribute('role');
          
          // Style attribute'unu tamamen temizle veya kaldır
          importedNode.removeAttribute('style');
          
          // Fill'i garantile - siyah olmalı
          if (!importedNode.getAttribute('fill') || importedNode.getAttribute('fill') === '#FFFFFF') {
            importedNode.setAttribute('fill', '#000000');
          }
          
          // Path için stroke'u kaldır (sadece fill kullan)
          if (importedNode.tagName === 'path') {
            importedNode.removeAttribute('stroke');
            importedNode.removeAttribute('stroke-width');
          }
          
          qrGroupWrapper.appendChild(importedNode);
        });
        
        // Eğer path/rect bulunamadıysa, tüm child'ları ekle
        if (qrGroupWrapper.children.length === 0) {
          console.log('Path/rect bulunamadı (else), child node\'ları ekleniyor...');
          Array.from(qrSvgElement.childNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              console.log('Child element (else):', element.tagName);
              // Defs, svg ve clipPath tag'lerini atla
              if (element.tagName !== 'defs' && element.tagName !== 'DEFS' && 
                  element.tagName !== 'svg' && element.tagName !== 'SVG' &&
                  element.tagName !== 'clipPath' && element.tagName !== 'CLIPPATH') {
                const importedNode = svgElement.ownerDocument.importNode(element, true) as Element;
                // clip-path attribute'unu kaldır
                importedNode.removeAttribute('clip-path');
                importedNode.removeAttribute('clipPath');
                qrGroupWrapper.appendChild(importedNode);
              }
            }
          });
        }
        
        console.log('QR group wrapper\'a eklenen element sayısı (else):', qrGroupWrapper.children.length);
        
        // xlink namespace ekle
        svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        
        svgElement.appendChild(qrGroupWrapper);
      }
      
      // Text element'lerindeki font-weight ve font-size'i düzelt
      // CardData'dan font-weight ve font-size değerlerini kullan
      const nameWeight = nameFontWeight;
      const subtitleWeight = subtitleFontWeight;
      const nameSize = nameFontSize;
      const subtitleSize = subtitleFontSize;
      
      const textElements = svgElement.querySelectorAll('text');
      textElements.forEach(text => {
        const y = parseFloat(text.getAttribute('y') || '0');
        // İsim (y="128" civarı) için fontWeight ve fontSize
        if (y >= 125 && y <= 130) {
          // Hem attribute hem de style ile ayarla (style daha güçlü)
          text.setAttribute('font-weight', nameWeight.toString());
          text.setAttribute('fontWeight', nameWeight.toString());
          text.setAttribute('font-size', nameSize.toString());
          text.setAttribute('fontSize', nameSize.toString());
          text.setAttribute('font-style', 'italic');
          text.setAttribute('fontStyle', 'italic');
          text.setAttribute('style', `font-weight: ${nameWeight} !important; font-style: italic; font-size: ${nameSize}px; font-family: Montserrat, sans-serif; fill: #fff;`);
        }
        // Alt başlık (y="140" civarı) için fontWeight ve fontSize
        else if (y >= 137 && y <= 142) {
          text.setAttribute('font-weight', subtitleWeight.toString());
          text.setAttribute('fontWeight', subtitleWeight.toString());
          text.setAttribute('font-size', subtitleSize.toString());
          text.setAttribute('fontSize', subtitleSize.toString());
          text.setAttribute('font-style', 'italic');
          text.setAttribute('fontStyle', 'italic');
          text.setAttribute('style', `font-weight: ${subtitleWeight} !important; font-style: italic; font-size: ${subtitleSize}px; font-family: Montserrat, sans-serif; fill: #fff;`);
        }
        
        // Font-family'yi de ayarla
        text.setAttribute('font-family', 'Montserrat');
        text.setAttribute('fontFamily', 'Montserrat');
        text.setAttribute('fill', '#fff');
      });
      
      // SVG'yi string'e çevir
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);
      
      // Namespace'leri düzelt
      if (!svgString.includes('xmlns:xlink')) {
        svgString = svgString.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      
      return svgString;
    } catch (error) {
      console.error('SVG güncelleme hatası:', error);
      return svgContent;
    }
  };

  // Kartları oluştur fonksiyonu
  const handleCreateCards = async () => {
    if (!order) return;
    
    setIsCreatingCards(true);
    try {
      const updatedItems = [...order.items];
      
      // Her item için kartları oluştur
      for (let itemIndex = 0; itemIndex < updatedItems.length; itemIndex++) {
        const item = updatedItems[itemIndex];
        if (!item.cardsData || item.cardsData.length === 0) continue;
        
        const updatedCardsData = [...item.cardsData];
        
        // Her kart için QR ve link oluştur
        for (let cardIndex = 0; cardIndex < updatedCardsData.length; cardIndex++) {
          const card = updatedCardsData[cardIndex];
          
          // Her seferinde yeni kart oluştur (mevcut cardHash varsa bile)
          const newCard = await createCardByAdmin(undefined, undefined, 'nfc');
          if (newCard) {
            // QR kod URL'ini oluştur
            const cardUrl = typeof window !== 'undefined' 
              ? `${window.location.origin}/card/${newCard.id}`
              : '';
            
            // QR kodunu SVG string olarak oluştur
            const qrCodeSvgString = await generateQRCodeSVGString(cardUrl);
            
            // QR kod data URL'ini oluştur ve state'e ekle (kart bilgilerinde göstermek için)
            try {
              const blob = new Blob([qrCodeSvgString], { type: 'image/svg+xml' });
              const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              setQrDataUrls(prev => ({ ...prev, [newCard.id]: dataUrl }));
            } catch (error) {
              console.error('QR kod data URL oluşturma hatası:', error);
            }
            
            // Eğer card.svgOutput yoksa, CardSVG component'inden SVG oluştur
            let svgContent = card.svgOutput || '';
            if (!svgContent || svgContent.trim() === '') {
              // CardSVG component'ini geçici olarak render edip SVG'yi al
              const tempDiv = document.createElement('div');
              tempDiv.style.position = 'absolute';
              tempDiv.style.left = '-9999px';
              tempDiv.style.width = '240.9px';
              tempDiv.style.height = '153.1px';
              document.body.appendChild(tempDiv);
              
              // React'i kullanarak CardSVG'yi render et
              const ReactDOM = await import('react-dom/client');
              
              const root = ReactDOM.createRoot(tempDiv);
              root.render(
                React.createElement(CardSVG, {
                  name: card.name,
                  subtitle: card.subtitle,
                  logo: card.logo,
                  logoSize: card.logoSize,
                  logoX: card.logoX,
                  logoY: card.logoY,
                  logoInverted: card.logoInverted,
                  nameFontWeight: card.nameFontWeight || 500,
                  subtitleFontWeight: card.subtitleFontWeight || 300,
                  nameFontSize: card.nameFontSize || 14,
                  subtitleFontSize: card.subtitleFontSize || 10
                })
              );
              
              // SVG'yi DOM'dan al
              await new Promise(resolve => setTimeout(resolve, 200)); // Render için bekle
              const svgElement = tempDiv.querySelector('svg') as SVGSVGElement;
              if (svgElement) {
                const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
                clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                svgContent = new XMLSerializer().serializeToString(clonedSvg);
              }
              
              // Temizlik
              root.unmount();
              if (tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
              }
            }
            
            // SVG'yi güncelle - QR kodunu değiştir (font-weight ve font-size değerlerini de geç)
            const updatedSvgOutput = updateSVGWithQRCode(
              svgContent, 
              qrCodeSvgString, 
              qrSettings.x, 
              qrSettings.y, 
              qrSettings.size,
              card.nameFontWeight || 500,
              card.subtitleFontWeight || 300,
              card.nameFontSize || 14,
              card.subtitleFontSize || 10
            );
            
            // CardData'yı güncelle
            updatedCardsData[cardIndex] = {
              ...card,
              cardHash: newCard.id,
              svgOutput: updatedSvgOutput
            };
          }
        }
        
        updatedItems[itemIndex] = {
          ...item,
          cardsData: updatedCardsData
        };
      }
      
      // Siparişi güncelle
      const { error } = await supabase
        .from('orders')
        .update({ items: updatedItems })
        .eq('id', order.id);
      
      if (error) {
        throw error;
      }
      
      // Local state'i güncelle
      setOrder({ ...order, items: updatedItems });
      setToast({ message: 'Kartlar başarıyla oluşturuldu!', type: 'success' });
    } catch (error) {
      console.error('Kart oluşturma hatası:', error);
      setToast({ message: 'Kartlar oluşturulurken bir hata oluştu!', type: 'error' });
    } finally {
      setIsCreatingCards(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar activePage="orders" />
        <div className="flex-1 flex flex-col ml-64">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Yükleniyor...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar activePage="orders" />
        <div className="flex-1 flex flex-col ml-64">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Sipariş bulunamadı</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AdminSidebar activePage="orders" />

      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              <span>Siparişlere Dön</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sipariş Detayı</h1>
                <p className="text-gray-500 mt-1">{order.order_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateCards}
                  disabled={isCreatingCards}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  {isCreatingCards ? 'Kartlar Oluşturuluyor...' : 'Kartları Oluştur'}
                </button>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status === 'pending' ? 'Bekliyor' : 
                     order.order_status === 'processing' ? 'İşlemde' :
                     order.order_status === 'shipped' ? 'Kargoda' :
                     order.order_status === 'delivered' ? 'Teslim Edildi' : order.order_status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status === 'paid' ? 'Ödendi' : order.payment_status === 'pending' ? 'Bekliyor' : order.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Taraf - Ana Bilgiler */}
            <div className="lg:col-span-2 space-y-6">
              {/* Müşteri Bilgileri */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Müşteri Bilgileri</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Soyad:</span>
                    <span className="font-medium text-gray-900">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{order.customer_email}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <span className="font-medium text-gray-900">{order.customer_phone}</span>
                    </div>
                  )}
                  {order.customer_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adres:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{order.customer_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sipariş Ürünleri ve Kart Detayları */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Ürünleri</h2>
                <div className="space-y-6">
                  {order.items.map((item, itemIndex) => {
                    const itemKey = `${itemIndex}`;
                    const currentTab = activeCardTab[itemKey] || 0;
                    const itemCards = item.cardsData || [];
                    
                    return (
                      <div key={itemIndex} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        {/* Ürün Bilgisi */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Adet: {item.quantity}</span>
                            <span className="font-semibold text-gray-900">₺{Number(item.total).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Kart Detayları - Eğer cardsData varsa */}
                        {itemCards.length > 0 && (
                          <div className="mt-4">
                            {/* Tabs - Birden fazla kart varsa */}
                            {itemCards.length > 1 && (
                              <div className="border-b border-gray-200 mb-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {itemCards.map((_, cardIndex) => (
                                    <button
                                      key={cardIndex}
                                      onClick={() => setActiveCardTab(prev => ({ ...prev, [itemKey]: cardIndex }))}
                                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                        currentTab === cardIndex
                                          ? 'border-b-2 border-black text-black'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      Kart {cardIndex + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Aktif Kartın Detayları */}
                            {itemCards[currentTab] && (() => {
                              // Local state'ten veya order'dan kart verisini al
                              const card = localCardsData[itemKey]?.[currentTab] || itemCards[currentTab];
                              return (
                                <div className="space-y-4">
                                  {/* Kart SVG Çıktısı */}
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-semibold text-gray-700">Kart Görünümü</h4>
                                      <button
                                        onClick={() => {
                                          const fileName = `${item.name}_Kart_${currentTab + 1}_${card.name || 'Kart'}`.replace(/[^a-z0-9]/gi, '_');
                                          
                                          // Font-weight ve font-size değerlerini al (o anki önizlemeden)
                                          const nameWeight = card.nameFontWeight || 500;
                                          const subtitleWeight = card.subtitleFontWeight || 300;
                                          const nameSize = card.nameFontSize || 14;
                                          const subtitleSize = card.subtitleFontSize || 10;
                                          
                                          // Her zaman DOM'dan o anki önizlemedeki SVG'yi al
                                          const svgContainer = document.querySelector(`[data-card-item="${itemIndex}"][data-card-index="${currentTab}"] svg`) as SVGSVGElement;
                                          if (svgContainer) {
                                            const clonedSvg = svgContainer.cloneNode(true) as SVGSVGElement;
                                            clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                                            clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                                            
                                            // Text element'lerindeki font-weight ve font-size attribute'larını güncelle
                                            const textElements = clonedSvg.querySelectorAll('text');
                                            textElements.forEach(text => {
                                              const y = parseFloat(text.getAttribute('y') || '0');
                                              
                                              // İsim (y="128" civarı) için font-weight ve font-size
                                              if (y >= 125 && y <= 130) {
                                                text.setAttribute('font-weight', nameWeight.toString());
                                                text.setAttribute('fontWeight', nameWeight.toString());
                                                text.setAttribute('font-size', nameSize.toString());
                                                text.setAttribute('fontSize', nameSize.toString());
                                                text.setAttribute('style', `font-weight: ${nameWeight} !important; font-style: italic; font-size: ${nameSize}px; font-family: Montserrat, sans-serif; fill: #fff;`);
                                              }
                                              // Alt başlık (y="140" civarı) için font-weight ve font-size
                                              else if (y >= 137 && y <= 142) {
                                                text.setAttribute('font-weight', subtitleWeight.toString());
                                                text.setAttribute('fontWeight', subtitleWeight.toString());
                                                text.setAttribute('font-size', subtitleSize.toString());
                                                text.setAttribute('fontSize', subtitleSize.toString());
                                                text.setAttribute('style', `font-weight: ${subtitleWeight} !important; font-style: italic; font-size: ${subtitleSize}px; font-family: Montserrat, sans-serif; fill: #fff;`);
                                              }
                                              
                                              // Font-family'yi de ayarla
                                              text.setAttribute('font-family', 'Montserrat');
                                              text.setAttribute('fontFamily', 'Montserrat');
                                              text.setAttribute('fill', '#fff');
                                            });
                                            
                                            const svgString = new XMLSerializer().serializeToString(clonedSvg);
                                            downloadSVG(svgString, fileName);
                                          } else {
                                            setToast({ message: 'SVG oluşturulamadı! Önizleme bulunamadı.', type: 'error' });
                                          }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        title="SVG dosyasını indir"
                                      >
                                        <Download size={14} />
                                        SVG İndir
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-center bg-white rounded-lg p-4">
                                      <div 
                                        className="relative w-full max-w-[300px] aspect-[240.9/153.1]"
                                        data-card-item={itemIndex}
                                        data-card-index={currentTab}
                                      >
                                        {/* Her zaman CardSVG kullan - canlı güncelleme için */}
                                        <CardSVG
                                          name={card.name}
                                          subtitle={card.subtitle}
                                          logo={card.logo}
                                          logoSize={card.logoSize}
                                          logoX={card.logoX}
                                          logoY={card.logoY}
                                          logoInverted={card.logoInverted}
                                          qrCodeUrl={card.cardHash ? qrDataUrls[card.cardHash] : undefined}
                                          qrX={qrSettings.x}
                                          qrY={qrSettings.y}
                                          qrSize={qrSettings.size}
                                          nameFontWeight={card.nameFontWeight || 500}
                                          subtitleFontWeight={card.subtitleFontWeight || 300}
                                          nameFontSize={card.nameFontSize || 14}
                                          subtitleFontSize={card.subtitleFontSize || 10}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Kart Bilgileri */}
                                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Kart Bilgileri</h4>
                                    
                                    {/* İsim */}
                                    {card.name && (
                                      <div className="flex justify-between items-start">
                                        <span className="text-gray-600 text-sm">Ad Soyad:</span>
                                        <span className="font-medium text-gray-900 text-sm text-right">{card.name}</span>
                                      </div>
                                    )}

                                    {/* Alt Başlık */}
                                    {card.subtitle && (
                                      <div className="flex justify-between items-start">
                                        <span className="text-gray-600 text-sm">Alt Başlık:</span>
                                        <span className="font-medium text-gray-900 text-sm text-right">{card.subtitle}</span>
                                      </div>
                                    )}

                                    {/* Logo */}
                                    {card.logo && (
                                      <div className="flex justify-between items-start">
                                        <span className="text-gray-600 text-sm">Logo:</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-16 h-16 border border-gray-200 rounded overflow-hidden">
                                            <img src={card.logo} alt="Logo" className="w-full h-full object-contain" />
                                          </div>
                                          <button
                                            onClick={() => downloadLogo(card.logo!, `${item.name}_Kart_${currentTab + 1}_Logo_${card.name || 'Logo'}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                          >
                                            <Download size={14} />
                                            İndir
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Kart Hash ve URL - Eğer kart oluşturulmuşsa */}
                                    {card.cardHash && (
                                      <>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-between items-start mb-2">
                                            <span className="text-gray-600 text-sm">Kart Hash:</span>
                                            <span className="font-mono text-xs text-gray-900 text-right break-all">{card.cardHash}</span>
                                          </div>
                                          <div className="flex justify-between items-start">
                                            <span className="text-gray-600 text-sm">Kart URL:</span>
                                            <div className="flex items-center gap-2">
                                              <a
                                                href={typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-xs text-blue-600 hover:text-blue-800 text-right break-all"
                                              >
                                                {typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : ''}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-center">
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                              {qrDataUrls[card.cardHash] ? (
                                                <img 
                                                  src={qrDataUrls[card.cardHash]} 
                                                  alt="QR Code" 
                                                  className="w-[120px] h-[120px]"
                                                />
                                              ) : (
                                                <QRCodeSVG 
                                                  value={typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : ''} 
                                                  size={120}
                                                  level="H"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {/* Kart Hash ve URL - Eğer kart oluşturulmuşsa */}
                                    {card.cardHash && (
                                      <>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-between items-start mb-2">
                                            <span className="text-gray-600 text-sm">Kart Hash:</span>
                                            <span className="font-mono text-xs text-gray-900 text-right break-all">{card.cardHash}</span>
                                          </div>
                                          <div className="flex justify-between items-start">
                                            <span className="text-gray-600 text-sm">Kart URL:</span>
                                            <div className="flex items-center gap-2">
                                              <a
                                                href={typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-xs text-blue-600 hover:text-blue-800 text-right break-all"
                                              >
                                                {typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : ''}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <div className="flex justify-center">
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                              {qrDataUrls[card.cardHash] ? (
                                                <img 
                                                  src={qrDataUrls[card.cardHash]} 
                                                  alt="QR Code" 
                                                  className="w-[120px] h-[120px]"
                                                />
                                              ) : (
                                                <QRCodeSVG 
                                                  value={typeof window !== 'undefined' ? `${window.location.origin}/card/${card.cardHash}` : ''} 
                                                  size={120}
                                                  level="H"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {/* Logo Ayarları */}
                                    {card.logo && (
                                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                        <div className="flex justify-between text-xs text-gray-600">
                                          <span>Logo Boyutu:</span>
                                          <span className="font-medium">{card.logoSize}px</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                          <span>Logo Konumu (X, Y):</span>
                                          <span className="font-medium">{card.logoX}px, {card.logoY}px</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                          <span>Logo Renk:</span>
                                          <span className="font-medium">{card.logoInverted ? 'Beyaz' : 'Normal'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Eğer cardsData yoksa */}
                        {itemCards.length === 0 && (
                          <div className="mt-4 text-sm text-gray-500 italic">
                            Bu ürün için kart özelleştirmesi yapılmamış.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notlar */}
              {(order.customer_note || order.admin_note) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Notlar</h2>
                  <div className="space-y-3">
                    {order.customer_note && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">Müşteri Notu:</p>
                        <p className="text-sm text-blue-800">{order.customer_note}</p>
                      </div>
                    )}
                    {order.admin_note && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Admin Notu:</p>
                        <p className="text-sm text-gray-700">{order.admin_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Taraf - Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fiyat Özeti</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ara Toplam:</span>
                    <span className="font-medium text-gray-900">₺{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-medium text-gray-900">₺{Number(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vergi:</span>
                    <span className="font-medium text-gray-900">₺{Number(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Toplam:</span>
                    <span className="font-bold text-gray-900 text-lg">₺{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* QR Kod Ayarları */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">QR Kod Ayarları</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Boyut: {qrSettings.size.toFixed(1)}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="0.1"
                        value={qrSettings.size}
                        onChange={(e) => setQrSettings({ ...qrSettings, size: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        X Pozisyonu: {qrSettings.x.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="240"
                        step="0.1"
                        value={qrSettings.x}
                        onChange={(e) => setQrSettings({ ...qrSettings, x: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Y Pozisyonu: {qrSettings.y.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="153"
                        step="0.1"
                        value={qrSettings.y}
                        onChange={(e) => setQrSettings({ ...qrSettings, y: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Kart Ayarları - Logo ve Yazı */}
                {order.items.length > 0 && (() => {
                  // İlk item'ı al (veya aktif item seçilebilir)
                  const firstItem = order.items[0];
                  const itemIndex = 0; // İlk item için index
                  const itemKey = `${itemIndex}`; // Sol tarafla aynı key formatı
                  const currentTab = activeCardTab[itemKey] || 0;
                  const itemCards = firstItem.cardsData || [];
                  const currentCard = itemCards[currentTab];
                  
                  if (!currentCard) return null;
                  
                  // Local state'ten veya order'dan kart verisini al
                  const cardData = localCardsData[itemKey]?.[currentTab] || currentCard;
                  
                  const updateCardData = (updates: Partial<CardData>) => {
                    setLocalCardsData(prev => {
                      const newData = { ...prev };
                      if (!newData[itemKey]) {
                        newData[itemKey] = [...itemCards];
                      }
                      newData[itemKey][currentTab] = { ...newData[itemKey][currentTab], ...updates };
                      return newData;
                    });
                    
                    // Order'ı da güncelle
                    setOrder(prev => {
                      if (!prev) return prev;
                      const updatedItems = [...prev.items];
                      if (updatedItems[itemIndex]) {
                        const updatedCardsData = [...(updatedItems[itemIndex].cardsData || [])];
                        updatedCardsData[currentTab] = { ...updatedCardsData[currentTab], ...updates };
                        updatedItems[itemIndex] = {
                          ...updatedItems[itemIndex],
                          cardsData: updatedCardsData
                        };
                      }
                      return { ...prev, items: updatedItems };
                    });
                  };
                  
                  return (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Kart Ayarları</h3>
                      <div className="space-y-4">
                        {/* Ad Soyad */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Ad Soyad
                          </label>
                          <input
                            type="text"
                            value={cardData.name || ''}
                            onChange={(e) => updateCardData({ name: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        
                        {/* Alt Başlık */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Alt Başlık
                          </label>
                          <input
                            type="text"
                            value={cardData.subtitle || ''}
                            onChange={(e) => updateCardData({ subtitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        
                        {/* Yazı Kalınlığı Ayarları */}
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Ad Soyad Kalınlığı: {cardData.nameFontWeight || 500}
                            </label>
                            <input
                              type="range"
                              min="100"
                              max="900"
                              step="100"
                              value={cardData.nameFontWeight || 500}
                              onChange={(e) => updateCardData({ nameFontWeight: Number(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Alt Başlık Kalınlığı: {cardData.subtitleFontWeight || 300}
                            </label>
                            <input
                              type="range"
                              min="100"
                              max="900"
                              step="100"
                              value={cardData.subtitleFontWeight || 300}
                              onChange={(e) => updateCardData({ subtitleFontWeight: Number(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                        </div>
                        
                        {/* Font Boyutu Ayarları */}
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Ad Soyad Font Boyutu: {cardData.nameFontSize || 14}px
                            </label>
                            <input
                              type="range"
                              min="8"
                              max="24"
                              step="1"
                              value={cardData.nameFontSize || 14}
                              onChange={(e) => updateCardData({ nameFontSize: Number(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Alt Başlık Font Boyutu: {cardData.subtitleFontSize || 10}px
                            </label>
                            <input
                              type="range"
                              min="6"
                              max="20"
                              step="1"
                              value={cardData.subtitleFontSize || 10}
                              onChange={(e) => updateCardData({ subtitleFontSize: Number(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                        </div>
                        
                        {/* Logo Ayarları */}
                        {cardData.logo && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Logo Boyutu: {cardData.logoSize}px
                              </label>
                              <input
                                type="range"
                                min="20"
                                max="120"
                                value={cardData.logoSize}
                                onChange={(e) => updateCardData({ logoSize: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Logo Yatay Konum (X): {cardData.logoX}px
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={cardData.logoX}
                                onChange={(e) => updateCardData({ logoX: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Logo Dikey Konum (Y): {cardData.logoY}px
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={cardData.logoY}
                                onChange={(e) => updateCardData({ logoY: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                              />
                            </div>
                            
                            <div>
                              <button
                                onClick={() => updateCardData({ logoInverted: !cardData.logoInverted })}
                                className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                  cardData.logoInverted
                                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {cardData.logoInverted ? 'Logoyu Normal Yap' : 'Logoyu Beyaz Yap'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Sipariş Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sipariş Tarihi:</span>
                      <span className="text-gray-900">{new Date(order.created_at).toLocaleDateString('tr-TR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    {order.shipped_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo Tarihi:</span>
                        <span className="text-gray-900">{new Date(order.shipped_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teslim Tarihi:</span>
                        <span className="text-gray-900">{new Date(order.delivered_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    {order.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ödeme Yöntemi:</span>
                        <span className="text-gray-900">{order.payment_method === 'credit_card' ? 'Kredi Kartı' : order.payment_method}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

