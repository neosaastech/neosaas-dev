import { NextRequest, NextResponse } from 'next/server';
import { getLagoClient } from '@/lib/lago-client';

/**
 * GET /api/lago/customers?external_id=xxx
 * Get a customer by external ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const externalId = searchParams.get('external_id');

    if (!externalId) {
      return NextResponse.json(
        { error: 'external_id parameter is required' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const customer = await lagoClient.getCustomer(externalId);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('[API] Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lago/customers
 * Create a new customer in Lago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_id, name, email, currency, timezone, metadata } = body;

    if (!external_id || !name || !email) {
      return NextResponse.json(
        { error: 'external_id, name, and email are required' },
        { status: 400 }
      );
    }

    const lagoClient = getLagoClient();
    const customer = await lagoClient.createCustomer({
      external_id,
      name,
      email,
      currency: currency || 'USD',
      timezone: timezone || 'UTC',
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      customer
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
