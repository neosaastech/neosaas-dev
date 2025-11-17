import { NextRequest, NextResponse } from 'next/server';
import { getLagoClient } from '@/lib/lago-client';

/**
 * GET /api/lago/wallets?external_customer_id=xxx
 * Get wallet for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const externalCustomerId = searchParams.get('external_customer_id');

    if (!externalCustomerId) {
      return NextResponse.json(
        { error: 'external_customer_id parameter is required' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const wallet = await lagoClient.getWallet(externalCustomerId);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', wallet: null },
        { status: 404 }
      );
    }

    // Calculate total balance
    const paidCredits = parseFloat(wallet.wallet?.balance || wallet.balance || '0');
    const grantedCredits = parseFloat(wallet.wallet?.granted_credits || wallet.granted_credits || '0');
    const totalBalance = paidCredits + grantedCredits;

    return NextResponse.json({
      wallet: {
        ...wallet,
        total_balance: totalBalance.toFixed(2),
        paid_credits: paidCredits.toFixed(2),
        granted_credits: grantedCredits.toFixed(2),
      },
    });
  } catch (error) {
    console.error('[API] Get wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lago/wallets
 * Create a new wallet or top up existing wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      external_customer_id,
      paid_credits,
      granted_credits,
      currency,
      name,
      expiration_at
    } = body;

    if (!external_customer_id) {
      return NextResponse.json(
        { error: 'external_customer_id is required' },
        { status: 400 }
      );
    }

    if (!paid_credits && !granted_credits) {
      return NextResponse.json(
        { error: 'Either paid_credits or granted_credits must be provided' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();

    // Create or update wallet
    const wallet = await lagoClient.createWallet({
      external_customer_id,
      rate_amount: '1.0',
      currency: currency || 'USD',
      paid_credits: paid_credits || '0.0',
      granted_credits: granted_credits || '0.0',
      name: name || 'Default Wallet',
      expiration_at,
    });

    return NextResponse.json({
      success: true,
      wallet
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Create wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lago/wallets
 * Top up an existing wallet
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_id, paid_credits, granted_credits } = body;

    if (!wallet_id) {
      return NextResponse.json(
        { error: 'wallet_id is required' },
        { status: 400 }
      );
    }

    if (!paid_credits && !granted_credits) {
      return NextResponse.json(
        { error: 'Either paid_credits or granted_credits must be provided' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const result = await lagoClient.topUpWallet(
      wallet_id,
      paid_credits || '0.0',
      granted_credits || '0.0'
    );

    return NextResponse.json({
      success: true,
      transaction: result
    });
  } catch (error) {
    console.error('[API] Top up wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to top up wallet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
