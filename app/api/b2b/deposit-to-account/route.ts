import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
}

// Service role key ile admin işlemleri için
const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerId, amount, description } = body;

    if (!dealerId || !amount) {
      return NextResponse.json(
        { error: 'Dealer ID ve tutar gereklidir' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir tutar girin' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Mevcut hesabı kontrol et
    const { data: account, error: accountError } = await supabaseAdmin
      .from('dealer_accounts')
      .select('balance')
      .eq('dealer_id', dealerId)
      .single();

    if (accountError && accountError.code !== 'PGRST116') {
      throw accountError;
    }

    const currentBalance = account?.balance || 0;
    const newBalance = currentBalance + depositAmount;

    // Hesabı güncelle veya oluştur (upsert ile duplicate key hatasını önle)
    const { error: updateError } = await supabaseAdmin
      .from('dealer_accounts')
      .upsert({
        dealer_id: dealerId,
        balance: newBalance,
      }, {
        onConflict: 'dealer_id',
      });

    if (updateError) {
      throw updateError;
    }

    // Transaction kaydı
    const { error: transactionError } = await supabaseAdmin
      .from('dealer_account_transactions')
      .insert({
        dealer_id: dealerId,
        type: 'deposit',
        amount: depositAmount,
        description: description || 'Para yükleme',
      });

    if (transactionError) {
      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: `${depositAmount.toFixed(2)} TRY yüklendi`,
    });
  } catch (error: any) {
    console.error('Deposit to account error:', error);
    return NextResponse.json(
      { error: error.message || 'Para yükleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

