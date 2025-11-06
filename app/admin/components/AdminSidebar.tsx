'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CreditCard, Users, Settings, 
  LogOut, Home, ShoppingBag, MessageSquare, Package
} from 'lucide-react';

interface AdminSidebarProps {
  activePage: string;
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', key: 'dashboard' },
    { icon: CreditCard, label: 'Kartlar', href: '/admin/cards', key: 'cards' },
    { icon: Package, label: 'Siparişler', href: '/admin/orders', key: 'orders' },
    { icon: ShoppingBag, label: 'Satış Kartları', href: '/admin/sales-cards', key: 'sales-cards' },
    { icon: MessageSquare, label: 'Kurumsal Mesajlar', href: '/admin/corporate-requests', key: 'corporate-requests' },
    { icon: Users, label: 'Kullanıcılar', href: '/admin/users', key: 'users' },
    { icon: Settings, label: 'Ayarlar', href: '/admin/settings', key: 'settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Admin Panel</h1>
            <p className="text-gray-400 text-xs">Digivisor</p>
          </div>
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

