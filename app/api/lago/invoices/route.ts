import { NextRequest, NextResponse } from 'next/server';
import { getLagoClient } from '@/lib/lago-client';

/**
 * GET /api/lago/invoices?external_customer_id=xxx
 * Get all invoices for a customer
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
    const invoicesData = await lagoClient.getInvoices(externalCustomerId);

    return NextResponse.json({
      invoices: invoicesData.invoices || [],
      meta: invoicesData.meta || {}
    });
  } catch (error) {
    console.error('[API] Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
