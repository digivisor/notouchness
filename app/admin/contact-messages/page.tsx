'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import { supabase } from '../../../lib/supabase';
import { Mail, Phone, MessageSquare, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ContactMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    // Admin kontrolü
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    
    loadMessages();
  }, [filter, router]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking as read:', error);
      } else {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg));
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null);
        }
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: false })
        .eq('id', id);

      if (error) {
        console.error('Error marking as unread:', error);
      } else {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: false } : msg));
        if (selectedMessage?.id === id) {
          setSelectedMessage(prev => prev ? { ...prev, is_read: false } : null);
        }
      }
    } catch (err) {
      console.error('Error marking as unread:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      support: 'Destek',
      sales: 'Satış',
      partnership: 'İş Birliği',
      other: 'Diğer',
    };
    return labels[subject] || subject;
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activePage="contact-messages" />
      
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">İletişim Mesajları</h1>
            <p className="text-gray-600">Gelen iletişim mesajlarını görüntüleyin ve yönetin</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filter === 'unread'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>Okunmamış</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'read'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Okunmuş ({messages.filter(msg => msg.is_read).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Yükleniyor...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz mesaj bulunmuyor</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Messages List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Mesajlar</h2>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.is_read) {
                            markAsRead(message.id);
                          }
                        }}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                          selectedMessage?.id === message.id ? 'bg-gray-50 border-l-4 border-black' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className={`font-medium ${!message.is_read ? 'text-black' : 'text-gray-700'}`}>
                              {message.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{message.email}</p>
                          </div>
                          {!message.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {getSubjectLabel(message.subject)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(message.created_at)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedMessage.name}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail size={16} />
                              <a href={`mailto:${selectedMessage.email}`} className="hover:text-black">
                                {selectedMessage.email}
                              </a>
                            </div>
                            {selectedMessage.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <a href={`tel:${selectedMessage.phone}`} className="hover:text-black">
                                  {selectedMessage.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedMessage.is_read ? (
                            <button
                              onClick={() => markAsUnread(selectedMessage.id)}
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                              title="Okunmamış olarak işaretle"
                            >
                              <EyeOff size={20} />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsRead(selectedMessage.id)}
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                              title="Okundu olarak işaretle"
                            >
                              <Eye size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {getSubjectLabel(selectedMessage.subject)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(selectedMessage.created_at)}
                        </span>
                        {selectedMessage.is_read ? (
                          <span className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle size={16} />
                            Okundu
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            <XCircle size={16} />
                            Okunmadı
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Mesaj</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Bir mesaj seçin</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

