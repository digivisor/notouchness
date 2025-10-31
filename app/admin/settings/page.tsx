'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activePage="settings" />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
            <p className="text-gray-600">Sistem ayarlarını yönet</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <SettingsIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Yakında Gelecek</h2>
            <p className="text-gray-600">Ayarlar özelliği yakında eklenecek</p>
          </div>
        </main>
      </div>
    </div>
  );
}

