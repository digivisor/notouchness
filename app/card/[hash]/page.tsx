'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCard } from '../../context/CardContext';

export default function CardHashPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;
  const { getCardByHash } = useCard();

  useEffect(() => {
    const fetchCard = async () => {
      if (!hash) {
        router.push('/');
        return;
      }

      const card = await getCardByHash(hash);
      
      if (!card) {
        // Kart bulunamadı
        router.push('/');
        return;
      }

      if (card.isActive && card.username) {
        // Kart aktif ve username var, profil sayfasına yönlendir
        router.push(`/${card.username}`);
      } else if (!card.isActive) {
        // Kart pasif (henüz register olmamış), register sayfasına yönlendir
        router.push(`/card/register?hash=${hash}`);
      } else {
        // Kart aktif ama username yok (setup tamamlanmamış), setup sayfasına yönlendir
        router.push('/card/setup');
      }
    };
    
    fetchCard();
  }, [hash, getCardByHash, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
}
