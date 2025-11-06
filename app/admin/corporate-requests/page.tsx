'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

type CorporateRequest = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  quantity: number;
  message: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
};

export default function CorporateRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CorporateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CorporateRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    loadRequests();
  }, [router]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('corporate_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading corporate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: CorporateRequest['status']) => {
    try {
      const { error } = await supabase
        .from('corporate_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh list
      await loadRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('corporate_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      contacted: { label: 'İletişime Geçildi', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage="corporate-requests" />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kurumsal Teklif Talepleri</h1>
              <p className="text-gray-600">Kurumsal müşteri taleplerini yönetin</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Toplam Talep</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <MessageSquare className="text-gray-400" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bekleyen</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="text-yellow-400" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">İletişim Kuruldu</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.contacted}</p>
                  </div>
                  <MessageSquare className="text-blue-400" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tamamlandı</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="text-green-400" size={32} />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü ({requests.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bekleyen ({stats.pending})
                </button>
                <button
                  onClick={() => setStatusFilter('contacted')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'contacted' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  İletişim Kuruldu ({stats.contacted})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tamamlandı ({stats.completed})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Henüz talep bulunmuyor</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className={`w-full p-6 text-left hover:bg-gray-50 transition ${
                          selectedRequest?.id === request.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{request.company_name}</h3>
                            <p className="text-sm text-gray-600">{request.contact_name}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {request.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {request.quantity} adet
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(request.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail */}
              <div className="lg:col-span-1">
                {selectedRequest ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Talep Detayları</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Şirket</label>
                        <p className="text-gray-900 font-medium">{selectedRequest.company_name}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">İletişim Kişisi</label>
                        <p className="text-gray-900 font-medium">{selectedRequest.contact_name}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">E-posta</label>
                        <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Mail size={14} />
                          {selectedRequest.email}
                        </a>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Telefon</label>
                        <a href={`tel:${selectedRequest.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Phone size={14} />
                          {selectedRequest.phone}
                        </a>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Kart Adedi</label>
                        <p className="text-gray-900 font-medium">{selectedRequest.quantity} adet</p>
                      </div>
                      
                      {selectedRequest.message && (
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Mesaj</label>
                          <p className="text-gray-900 text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedRequest.message}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Durum</label>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Oluşturulma</label>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(selectedRequest.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Durum Güncelle:</p>
                      <button
                        onClick={() => updateStatus(selectedRequest.id, 'pending')}
                        disabled={selectedRequest.status === 'pending'}
                        className="w-full py-2 px-4 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        Bekliyor
                      </button>
                      <button
                        onClick={() => updateStatus(selectedRequest.id, 'contacted')}
                        disabled={selectedRequest.status === 'contacted'}
                        className="w-full py-2 px-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        İletişime Geçildi
                      </button>
                      <button
                        onClick={() => updateStatus(selectedRequest.id, 'completed')}
                        disabled={selectedRequest.status === 'completed'}
                        className="w-full py-2 px-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        Tamamlandı
                      </button>
                      <button
                        onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                        disabled={selectedRequest.status === 'rejected'}
                        className="w-full py-2 px-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        Reddedildi
                      </button>
                      <button
                        onClick={() => deleteRequest(selectedRequest.id)}
                        className="w-full py-2 px-4 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition text-sm font-medium mt-4"
                      >
                        Talebi Sil
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                    Detayları görmek için bir talep seçin
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
