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
    const { dealerId, amount, description, referenceId } = body;

    if (!dealerId || !amount) {
      return NextResponse.json(
        { error: 'Dealer ID ve tutar gereklidir' },
        { status: 400 }
      );
    }

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
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

    if (accountError) {
      if (accountError.code === 'PGRST116') {
        // Hesap yoksa oluştur
        const { error: createError } = await supabaseAdmin
          .from('dealer_accounts')
          .insert({
            dealer_id: dealerId,
            balance: 0,
          });

        if (createError) {
          throw createError;
        }

        return NextResponse.json(
          { error: 'Yetersiz bakiye' },
          { status: 400 }
        );
      }
      throw accountError;
    }

    if (!account || account.balance < purchaseAmount) {
      return NextResponse.json(
        { error: 'Yetersiz bakiye' },
        { status: 400 }
      );
    }

    const newBalance = account.balance - purchaseAmount;

    // Hesabı güncelle
    const { error: updateError } = await supabaseAdmin
      .from('dealer_accounts')
      .update({ balance: newBalance })
      .eq('dealer_id', dealerId);

    if (updateError) {
      throw updateError;
    }

    // Transaction kaydı
    const { error: transactionError } = await supabaseAdmin
      .from('dealer_account_transactions')
      .insert({
        dealer_id: dealerId,
        type: 'purchase',
        amount: purchaseAmount,
        description: description || 'Sipariş ödemesi',
        reference_id: referenceId || null,
      });

    if (transactionError) {
      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: 'Ödeme başarıyla tamamlandı',
    });
  } catch (error: any) {
    console.error('Pay from account error:', error);
    return NextResponse.json(
      { error: error.message || 'Ödeme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

