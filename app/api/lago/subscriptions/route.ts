import { NextRequest, NextResponse } from 'next/server';
import { getLagoClient } from '@/lib/lago-client';

/**
 * POST /api/lago/subscriptions
 * Create a new subscription for a customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_customer_id, plan_code } = body;

    if (!external_customer_id || !plan_code) {
      return NextResponse.json(
        { error: 'external_customer_id and plan_code are required' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const subscription = await lagoClient.createSubscription(
      external_customer_id,
      plan_code
    );

    return NextResponse.json({
      success: true,
      subscription
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
