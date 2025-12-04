'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function B2BPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Direkt login sayfasına yönlendir
    router.push('/b2b/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}

