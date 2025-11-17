/**
 * Lago API Client
 * Service layer for interacting with Lago billing API
 */

export interface LagoConfig {
  apiUrl: string;
  apiKey: string;
}

export interface LagoCustomer {
  external_id: string;
  name: string;
  email: string;
  currency?: string;
  timezone?: string;
  metadata?: Record<string, any>;
}

export interface LagoWallet {
  external_customer_id: string;
  rate_amount: string;
  currency: string;
  paid_credits: string;
  granted_credits: string;
  name?: string;
  expiration_at?: string;
}

export interface LagoUsage {
  external_subscription_id: string;
  charges_usage: Array<{
    billable_metric: {
      name: string;
      code: string;
    };
    units: string;
    amount_cents: number;
    amount_currency: string;
  }>;
  total_amount_cents: number;
  total_amount_currency: string;
}

export interface LagoInvoice {
  id: string;
  status: string;
  amount_cents: number;
  amount_currency: string;
  file_url?: string;
}

export class LagoClient {
  private config: LagoConfig;
  private headers: HeadersInit;

  constructor(config: LagoConfig) {
    this.config = config;
    this.headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new customer in Lago
   */
  async createCustomer(customer: LagoCustomer) {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/customers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ customer }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to create customer: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Create customer error:', error);
      throw error;
    }
  }

  /**
   * Get customer by external ID
   */
  async getCustomer(externalId: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/customers/${externalId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get customer: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Get customer error:', error);
      throw error;
    }
  }

  /**
   * Create or top up a wallet with credits
   */
  async createWallet(wallet: LagoWallet) {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/wallets`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ wallet }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to create wallet: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Create wallet error:', error);
      throw error;
    }
  }

  /**
   * Get wallet for a customer
   */
  async getWallet(externalCustomerId: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/wallets?external_customer_id=${externalCustomerId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get wallet: ${response.status}`);
      }

      const data = await response.json();
      return data.wallets?.[0] || null;
    } catch (error) {
      console.error('[LagoClient] Get wallet error:', error);
      throw error;
    }
  }

  /**
   * Top up wallet with additional credits
   */
  async topUpWallet(walletId: string, paidCredits: string, grantedCredits?: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/wallet_transactions`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            wallet_transaction: {
              wallet_id: walletId,
              paid_credits: paidCredits,
              granted_credits: grantedCredits || '0.0',
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to top up wallet: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Top up wallet error:', error);
      throw error;
    }
  }

  /**
   * Get current usage for a subscription
   */
  async getCurrentUsage(externalSubscriptionId: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/subscriptions/${externalSubscriptionId}/current_usage`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get usage: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Get usage error:', error);
      throw error;
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(externalCustomerId: string, planCode: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/subscriptions`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            subscription: {
              external_customer_id: externalCustomerId,
              plan_code: planCode,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to create subscription: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Create subscription error:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for a customer
   */
  async getInvoices(externalCustomerId: string) {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/v1/invoices?external_customer_id=${externalCustomerId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get invoices: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Get invoices error:', error);
      throw error;
    }
  }

  /**
   * Create an event (for metering usage)
   */
  async createEvent(
    transactionId: string,
    externalCustomerId: string,
    code: string,
    properties?: Record<string, any>
  ) {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/events`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          event: {
            transaction_id: transactionId,
            external_customer_id: externalCustomerId,
            code,
            timestamp: Math.floor(Date.now() / 1000),
            properties: properties || {},
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Failed to create event: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[LagoClient] Create event error:', error);
      throw error;
    }
  }
}

/**
 * Get configured Lago client instance
 */
export function getLagoClient(): LagoClient {
  const apiUrl = process.env.LAGO_API_URL;
  const apiKey = process.env.LAGO_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Lago API configuration missing. Please set LAGO_API_URL and LAGO_API_KEY environment variables.');
  }

  return new LagoClient({ apiUrl, apiKey });
}
