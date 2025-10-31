'use client';

import { User, Eye, Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  userName: string;
  activeTab?: string;
  onLogout: () => void;
  onPreview: () => void;
}

export default function Sidebar({ userName, activeTab, onLogout, onPreview }: SidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Kontrol Paneli</h2>
        <p className="text-sm text-gray-500 mt-1">{userName}</p>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-black text-white">
          <User size={20} />
          <span className="font-medium">Profil Düzenle</span>
        </div>
      </nav>

      {/* Spacer - Push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          type="button"
          onClick={onPreview}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <Eye size={20} />
          <span className="font-medium">Profili Görüntüle</span>
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <Home size={20} />
          <span className="font-medium">Ana Sayfa</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}
