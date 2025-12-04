import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { dealerId, salesCardId, quantity = 1 } = await request.json();

    if (!dealerId || !salesCardId) {
      return NextResponse.json(
        { success: false, error: 'Dealer ID ve Sales Card ID gereklidir' },
        { status: 400 }
      );
    }

    // Bayiyi kontrol et
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .eq('is_active', true)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { success: false, error: 'Bayi bulunamadı veya aktif değil' },
        { status: 404 }
      );
    }

    // Bayiye özel kart fiyatını bul
    const { data: dealerCard, error: dealerCardError } = await supabase
      .from('dealer_cards')
      .select('*')
      .eq('dealer_id', dealerId)
      .eq('sales_card_id', salesCardId)
      .eq('is_active', true)
      .single();

    if (dealerCardError || !dealerCard) {
      return NextResponse.json(
        { success: false, error: 'Bu kart size tanımlı değil' },
        { status: 404 }
      );
    }

    // Sales card bilgisini al
    const { data: salesCard, error: salesCardError } = await supabase
      .from('sales_cards')
      .select('*')
      .eq('id', salesCardId)
      .single();

    if (salesCardError || !salesCard) {
      return NextResponse.json(
        { success: false, error: 'Kart bulunamadı' },
        { status: 404 }
      );
    }

    // Satın alma kaydı oluştur
    const totalAmount = dealerCard.dealer_price * quantity;
    
    const { data: purchase, error: purchaseError } = await supabase
      .from('dealer_purchases')
      .insert({
        dealer_id: dealerId,
        sales_card_id: salesCardId,
        dealer_price: dealerCard.dealer_price,
        currency: dealerCard.currency,
        quantity: quantity,
        total_amount: totalAmount,
        status: 'completed', // Demo için direkt completed
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Purchase error:', purchaseError);
      return NextResponse.json(
        { success: false, error: 'Satın alma kaydı oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: {
        ...purchase,
        sales_card: salesCard,
      },
    });
  } catch (error: any) {
    console.error('B2B purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Satın alma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

