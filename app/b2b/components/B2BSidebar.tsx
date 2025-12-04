'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShoppingCart, CreditCard } from 'lucide-react';

type Dealer = {
  id: string;
  name: string;
  email: string;
  logo_url?: string | null;
};

type B2BSidebarProps = {
  dealer: Dealer;
  activeTab?: 'buy' | 'my-cards';
  onTabChange?: (tab: 'buy' | 'my-cards') => void;
};

export default function B2BSidebar({ dealer, activeTab, onTabChange }: B2BSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('b2b_session');
    router.push('/b2b/login');
  };

  const handleTabClick = (tab: 'buy' | 'my-cards') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      router.push(`/b2b/dashboard?tab=${tab}`);
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-800 flex flex-col items-center">
        <div className="w-32 h-12 mb-3 flex items-center justify-center">
          {dealer.logo_url ? (
            <img
              src={dealer.logo_url}
              alt={dealer.name}
              className="object-contain w-full h-full"
            />
          ) : (
            <img
              src="/notouchness1.png"
              alt="Logo"
              className="object-contain w-full h-full"
            />
          )}
        </div>
        <p className="text-sm text-gray-300 font-medium text-center">
          {dealer.name}
        </p>
        <p className="text-xs text-gray-500 mt-1">B2B Bayi Paneli</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => handleTabClick('buy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <ShoppingCart size={18} />
              <span>Kart Satın Al</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleTabClick('my-cards')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'my-cards'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <CreditCard size={18} />
              <span>Kartlarım</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}

