'use client';

import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';

export default function AdminHeader() {
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const loadSession = () => {
      const session = localStorage.getItem('admin_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          setAdminEmail(parsed.email || '');
        } catch (e) {
          console.error('Error parsing session:', e);
        }
      }
    };
    loadSession();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Yönetim Paneli</h2>
          <p className="text-sm text-gray-600">Kart ve kullanıcı yönetimi</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-600">{adminEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

