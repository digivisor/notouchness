'use client';

import { User, Palette, Sparkles, Eye, Home, LogOut, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCard } from '../../context/CardContext';
import { useEffect, useState } from 'react';

interface CardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function CardSidebar({ isOpen, onClose, onLogout }: CardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCard, logoutFromCard } = useCard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        logoutFromCard();
        router.push('/card/login');
      }
    }
  };

  if (!mounted || !currentCard) return null;

  const menuItems = [
    { path: '/card/setup', icon: User, label: 'Profil Düzenle' },
    { path: '/card/appearance', icon: Palette, label: 'Görünüm & Tema' },
    { path: '/card/editor', icon: Sparkles, label: 'Editor' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-60 bg-black text-white flex flex-col z-[100]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close Button - Mobile Only */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h1 className="text-2xl font-bold">Kart Ayarları</h1>
          <p className="text-gray-400 text-sm mt-1 truncate">{currentCard.username || currentCard.fullName}</p>
        </div>

        <nav className="flex-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
                pathname === item.path
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => window.open(`/${currentCard.username}`, '_blank')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Eye size={18} />
            Profili Görüntüle
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm mb-2"
          >
            <Home size={18} />
            Ana Sayfa
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
}

