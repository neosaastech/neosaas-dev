import { NextRequest, NextResponse } from 'next/server';
import { getLagoClient } from '@/lib/lago-client';

/**
 * GET /api/lago/usage?external_subscription_id=xxx
 * Get current usage for a subscription
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const externalSubscriptionId = searchParams.get('external_subscription_id');

    if (!externalSubscriptionId) {
      return NextResponse.json(
        { error: 'external_subscription_id parameter is required' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const usage = await lagoClient.getCurrentUsage(externalSubscriptionId);

    return NextResponse.json({ usage });
  } catch (error) {
    console.error('[API] Get usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lago/usage
 * Create a usage event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_customer_id, code, properties, transaction_id } = body;

    if (!external_customer_id || !code) {
      return NextResponse.json(
        { error: 'external_customer_id and code are required' },
        { status: 400 }
      );
    }

    // Generate transaction ID if not provided
    const txId = transaction_id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const lagoClient = getLagoClient();
    const event = await lagoClient.createEvent(
      txId,
      external_customer_id,
      code,
      properties || {}
    );

    return NextResponse.json({
      success: true,
      event
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Create usage event error:', error);
    return NextResponse.json(
      { error: 'Failed to create usage event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
