'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Kontrol ediliyor...');
  const [tests, setTests] = useState<Array<{ name: string; status: 'loading' | 'success' | 'error'; message: string }>>([]);

  const runTests = useCallback(async () => {
    const results: Array<{ name: string; status: 'loading' | 'success' | 'error'; message: string }> = [];

    // Test 1: Bağlantı
    results.push({ name: 'Supabase Bağlantısı', status: 'loading', message: '' });
    setTests([...results]);
    
    try {
      const { error: connectionError } = await supabase.from('cards').select('count').limit(1);
      if (connectionError) {
        results[0] = { name: 'Supabase Bağlantısı', status: 'error', message: connectionError.message };
      } else {
        results[0] = { name: 'Supabase Bağlantısı', status: 'success', message: '✅ Bağlantı başarılı!' };
      }
    } catch (err: unknown) {
      const error = err as Error;
      results[0] = { name: 'Supabase Bağlantısı', status: 'error', message: error.message };
    }
    setTests([...results]);

    // Test 2: Cards tablosu
    results.push({ name: 'Cards Tablosu', status: 'loading', message: '' });
    setTests([...results]);
    
    try {
      const { data: cardsData, error } = await supabase.from('cards').select('*').limit(1);
      if (error) {
        results[1] = { name: 'Cards Tablosu', status: 'error', message: error.message };
      } else {
        results[1] = { name: 'Cards Tablosu', status: 'success', message: `✅ Tablo mevcut (${cardsData?.length || 0} kayıt)` };
      }
    } catch (err: unknown) {
      const error = err as Error;
      results[1] = { name: 'Cards Tablosu', status: 'error', message: error.message };
    }
    setTests([...results]);

    // Test 3: Users tablosu
    results.push({ name: 'Users Tablosu', status: 'loading', message: '' });
    setTests([...results]);
    
    try {
      const { data: usersData, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        results[2] = { name: 'Users Tablosu', status: 'error', message: error.message };
      } else {
        results[2] = { name: 'Users Tablosu', status: 'success', message: `✅ Tablo mevcut (${usersData?.length || 0} kayıt)` };
      }
    } catch (err: unknown) {
      const error = err as Error;
      results[2] = { name: 'Users Tablosu', status: 'error', message: error.message };
    }
    setTests([...results]);

    // Test 4: Cart Items tablosu
    results.push({ name: 'Cart Items Tablosu', status: 'loading', message: '' });
    setTests([...results]);
    
    try {
      const { data: cartData, error } = await supabase.from('cart_items').select('*').limit(1);
      if (error) {
        results[3] = { name: 'Cart Items Tablosu', status: 'error', message: error.message };
      } else {
        results[3] = { name: 'Cart Items Tablosu', status: 'success', message: `✅ Tablo mevcut (${cartData?.length || 0} kayıt)` };
      }
    } catch (err: unknown) {
      const error = err as Error;
      results[3] = { name: 'Cart Items Tablosu', status: 'error', message: error.message };
    }
    setTests([...results]);

    // Test 5: Insert testi (optional)
    results.push({ name: 'Write İzni', status: 'loading', message: '' });
    setTests([...results]);
    
    try {
      const testHash = 'test_' + Date.now();
      const { error } = await supabase.from('cards').insert({
        id: testHash,
        is_active: false,
        theme: 'sales',
        layout_style: 'icons-with-title',
        primary_color: '#dc2626',
        secondary_color: '#fef2f2',
      }).select();
      
      if (error) {
        results[4] = { name: 'Write İzni', status: 'error', message: error.message };
      } else {
        // Test kaydını sil
        await supabase.from('cards').delete().eq('id', testHash);
        results[4] = { name: 'Write İzni', status: 'success', message: '✅ Write izni var!' };
      }
    } catch (err: unknown) {
      const error = err as Error;
      results[4] = { name: 'Write İzni', status: 'error', message: error.message };
    }
    setTests([...results]);

    const allSuccess = results.every(r => r.status === 'success');
    setStatus(allSuccess ? '✅ Tüm testler başarılı!' : '❌ Bazı testler başarısız');
  }, []);

  useEffect(() => {
    // runTests'ı asenkron olarak çağır
    const runTestsAsync = async () => {
      await runTests();
    };
    runTestsAsync();
  }, [runTests]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Bağlantı Testi</h1>
          <p className="text-gray-600 mb-8">Database bağlantısı ve tabloları kontrol ediliyor...</p>

          <div className="mb-6">
            <div className="text-lg font-semibold mb-4">{status}</div>
            
            <div className="space-y-4">
              {tests.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    test.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : test.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {test.status === 'loading' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
                      )}
                      {test.status === 'success' && (
                        <span className="text-green-600 text-xl">✅</span>
                      )}
                      {test.status === 'error' && (
                        <span className="text-red-600 text-xl">❌</span>
                      )}
                      <span className="font-medium text-gray-900">{test.name}</span>
                    </div>
                  </div>
                  {test.message && (
                    <div className="mt-2 text-sm text-gray-700">{test.message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {tests.length > 0 && tests.every(t => t.status !== 'loading') && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="font-semibold text-blue-900 mb-3">Sonraki Adımlar:</h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Admin panelinden yeni kart oluştur: <Link href="/admin" className="underline font-semibold">/admin</Link></li>
                <li>Kart URL&apos;sine git ve register ol</li>
                <li>Setup sayfasında profil oluştur</li>
                <li>Username ile profil sayfasını görüntüle</li>
              </ol>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={runTests}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🔄 Testi Tekrarla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

