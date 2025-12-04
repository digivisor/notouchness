'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Login sayfasına erişim kontrolü yapma
      if (pathname === '/b2b/login') {
        setIsChecking(false);
        return;
      }

      // B2B session kontrolü
      const session = localStorage.getItem('b2b_session');
      if (!session) {
        router.push('/b2b/login');
        setIsChecking(false);
        return;
      }

      try {
        const parsed = JSON.parse(session);
        const timestamp = parsed.timestamp || 0;
        const now = Date.now();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 saat

        // Session süresi dolmuş mu kontrol et
        if (now - timestamp > sessionTimeout) {
          localStorage.removeItem('b2b_session');
          router.push('/b2b/login');
          setIsChecking(false);
          return;
        }

        // Session geçerli
        if (parsed.loggedIn && parsed.dealer) {
          setIsAuthenticated(true);
        } else {
          router.push('/b2b/login');
        }
      } catch (e) {
        console.error('Error parsing session:', e);
        localStorage.removeItem('b2b_session');
        router.push('/b2b/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Login sayfası için kontrol yapma
  if (pathname === '/b2b/login') {
    return <>{children}</>;
  }

  // Authentication kontrolü yapılırken loading göster
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authenticated değilse hiçbir şey gösterme (redirect olacak)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

