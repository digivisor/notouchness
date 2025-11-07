'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, CreditCard, Users, Settings, 
  LogOut, Home, ShoppingBag, MessageSquare, Package, Mail
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AdminSidebarProps {
  activePage: string;
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    // Supabase'den çıkış yap
    await supabase.auth.signOut();
    localStorage.removeItem('admin_session');
    localStorage.removeItem('supabase_auth_token');
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', key: 'dashboard' },
    { icon: CreditCard, label: 'Kartlar', href: '/admin/cards', key: 'cards' },
    { icon: Package, label: 'Siparişler', href: '/admin/orders', key: 'orders' },
    { icon: ShoppingBag, label: 'Satış Kartları', href: '/admin/sales-cards', key: 'sales-cards' },
    { icon: MessageSquare, label: 'Kurumsal Mesajlar', href: '/admin/corporate-requests', key: 'corporate-requests' },
    { icon: Mail, label: 'İletişim Mesajları', href: '/admin/contact-messages', key: 'contact-messages' },
    { icon: Users, label: 'Kullanıcılar', href: '/admin/users', key: 'users' },
    { icon: Settings, label: 'Ayarlar', href: '/admin/settings', key: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-900 flex flex-col z-40 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-2">
          <div className="w-32 h-12 flex items-center justify-center">
            <Image
              src="/notouchness1.png"
              alt="Logo"
              width={120}
              height={60}
              className="object-contain w-full h-full brightness-0 invert"
              priority
            />
          </div>
          <p className="text-gray-400 text-xs">by digivisor</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || activePage === item.key;
            
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mb-2"
        >
          <Home size={20} />
          <span className="font-medium">Ana Sayfa</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}

