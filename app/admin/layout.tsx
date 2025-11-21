'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
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
      if (pathname === '/admin/login') {
        setIsChecking(false);
        return;
      }

      // Admin session kontrolü
      const session = localStorage.getItem('admin_session');
      if (!session) {
        router.push('/admin/login');
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
          localStorage.removeItem('admin_session');
          router.push('/admin/login');
          setIsChecking(false);
          return;
        }

        // Session geçerli
        if (parsed.loggedIn && parsed.email) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch (e) {
        console.error('Error parsing session:', e);
        localStorage.removeItem('admin_session');
        router.push('/admin/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Login sayfası için kontrol yapma
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Authentication kontrolü yapılırken loading göster
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Authenticated değilse hiçbir şey gösterme (redirect olacak)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated ise içeriği göster
  return <>{children}</>;
}

