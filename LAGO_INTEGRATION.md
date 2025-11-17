# Lago Billing Integration - Neosaas

Complete guide to integrating Lago open-source billing platform into the Neosaas Next.js application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Routes](#api-routes)
- [UI Components](#ui-components)
- [Usage Examples](#usage-examples)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

This integration provides a complete credit-based billing system using Lago, including:

- Credit balance management
- Purchase and top-up functionality
- Usage tracking and metering
- Invoice generation and history
- Admin dashboard for monitoring
- Real-time balance updates

## Architecture

### Components

```
neosaas-dev/
├── lib/
│   └── lago-client.ts              # Lago API client service
├── app/
│   ├── api/lago/                   # API routes
│   │   ├── customers/route.ts      # Customer management
│   │   ├── wallets/route.ts        # Credit wallet operations
│   │   ├── usage/route.ts          # Usage tracking
│   │   ├── invoices/route.ts       # Invoice retrieval
│   │   └── subscriptions/route.ts  # Subscription management
│   └── dashboard/
│       ├── lago-billing/           # User billing page
│       │   └── page.tsx
│       └── lago-admin/             # Admin dashboard
│           └── page.tsx
└── components/lago/                # Reusable components
    ├── credit-balance-card.tsx     # Balance display
    ├── purchase-credits-form.tsx   # Credit purchase
    └── invoices-list.tsx           # Invoice history
```

## Prerequisites

### 1. Lago Instance

You need a running Lago instance. Choose one of:

#### Option A: Local Docker (Development)

```bash
# Clone Lago
git clone https://github.com/getlago/lago.git
cd lago

# Start with Docker Compose
docker-compose up -d
```

Lago will be available at `http://localhost:3000`

#### Option B: CapRover Deployment

1. Install CapRover on your server
2. Create a new app in CapRover
3. Use the Lago Docker image: `getlago/lago:latest`
4. Set environment variables for PostgreSQL and Redis

#### Option C: Cloud Hosting

Deploy to Railway, Render, or any cloud provider that supports Docker:

- Railway: Use the Lago template
- Render: Deploy from Docker Hub
- AWS/GCP/Azure: Use container services

### 2. Database Requirements

Lago requires:
- PostgreSQL 12+
- Redis 6+

## Installation

### 1. Install Dependencies

The required dependencies are already in the project:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp env.exemple .env.local
```

Update the Lago configuration in `.env.local`:

```bash
# Lago Billing Configuration
LAGO_API_URL=http://localhost:3000          # Your Lago instance URL
LAGO_API_KEY=your_lago_api_key_here         # From Lago dashboard
```

### 3. Get Lago API Key

1. Access your Lago dashboard
2. Go to **Settings** > **API Keys**
3. Create a new API key
4. Copy the key to your `.env.local`

## Configuration

### Lago Setup

1. **Access Lago Dashboard**: Navigate to your Lago instance URL
2. **Create Organization**: Set up your organization details
3. **Create Plans** (Optional): Define subscription plans if needed
4. **Create Billable Metrics**: Set up metrics for usage tracking
   - Example: `api_calls`, `storage_gb`, `compute_hours`
5. **Configure Webhooks** (Optional): For real-time updates

### Vercel Configuration

When deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `LAGO_API_URL`: Your Lago instance URL (must be publicly accessible)
   - `LAGO_API_KEY`: Your Lago API key

## API Routes

### Customers

**Create Customer**
```bash
POST /api/lago/customers
Content-Type: application/json

{
  "external_id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "currency": "USD"
}
```

**Get Customer**
```bash
GET /api/lago/customers?external_id=user_123
```

### Wallets

**Create Wallet / Purchase Credits**
```bash
POST /api/lago/wallets
Content-Type: application/json

{
  "external_customer_id": "user_123",
  "paid_credits": "100.00",
  "currency": "USD"
}
```

**Get Wallet Balance**
```bash
GET /api/lago/wallets?external_customer_id=user_123
```

**Top Up Wallet**
```bash
PATCH /api/lago/wallets
Content-Type: application/json

{
  "wallet_id": "wallet_id_from_lago",
  "paid_credits": "50.00"
}
```

### Usage Tracking

**Create Usage Event**
```bash
POST /api/lago/usage
Content-Type: application/json

{
  "external_customer_id": "user_123",
  "code": "api_call",
  "properties": {
    "endpoint": "/api/data",
    "method": "GET"
  }
}
```

**Get Current Usage**
```bash
GET /api/lago/usage?external_subscription_id=sub_123
```

### Invoices

**Get Customer Invoices**
```bash
GET /api/lago/invoices?external_customer_id=user_123
```

## UI Components

### User Billing Page

Access the billing interface at:
```
/dashboard/lago-billing
```

Features:
- Credit balance display with status indicators
- Credit purchase form with preset packages
- Invoice history with download links
- Usage overview
- Billing settings

### Admin Dashboard

Access the admin panel at:
```
/dashboard/lago-admin
```

Features:
- Customer management
- Transaction monitoring
- Revenue analytics
- Credit usage tracking
- Customer status overview

### React Components

#### Credit Balance Card

```tsx
import { CreditBalanceCard } from "@/components/lago/credit-balance-card";

<CreditBalanceCard
  externalCustomerId="user_123"
  onTopUp={() => console.log('Top up clicked')}
/>
```

#### Purchase Credits Form

```tsx
import { PurchaseCreditsForm } from "@/components/lago/purchase-credits-form";

<PurchaseCreditsForm
  externalCustomerId="user_123"
  onSuccess={() => console.log('Purchase successful')}
/>
```

#### Invoices List

```tsx
import { InvoicesList } from "@/components/lago/invoices-list";

<InvoicesList externalCustomerId="user_123" />
```

## Usage Examples

### Example 1: New User Onboarding

```typescript
// When a user signs up, create a Lago customer
const response = await fetch('/api/lago/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    external_id: userId,
    name: userName,
    email: userEmail,
    currency: 'USD'
  })
});

const { customer } = await response.json();
```

### Example 2: Tracking API Usage

```typescript
// After processing an API request, log the usage
await fetch('/api/lago/usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    external_customer_id: userId,
    code: 'api_call',
    properties: {
      endpoint: '/api/v1/data',
      response_time_ms: 150
    }
  })
});
```

### Example 3: Check Balance Before Action

```typescript
// Check if user has enough credits before processing
const response = await fetch(`/api/lago/wallets?external_customer_id=${userId}`);
const { wallet } = await response.json();

if (parseFloat(wallet.total_balance) < requiredCredits) {
  // Prompt user to purchase credits
  return { error: 'Insufficient credits' };
}

// Proceed with action
```

## Deployment

### Development

```bash
# Run locally
npm run dev

# Access at http://localhost:3000/dashboard/lago-billing
```

### Production (Vercel)

1. **Ensure Lago is Publicly Accessible**
   - Your Lago instance must be accessible from Vercel
   - Use a domain or public IP
   - Enable HTTPS for production

2. **Configure Environment Variables**
   - Set `LAGO_API_URL` to your public Lago URL
   - Set `LAGO_API_KEY` to your production API key

3. **Deploy**
   ```bash
   git push origin claude/lago-billing-integration-01BndmPYSf9jdxvZQFvoarnk

   # Deploy to Vercel
   vercel --prod
   ```

### Security Considerations

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Enable HTTPS for Lago API in production
- Implement rate limiting on API routes
- Validate all user inputs
- Use JWT or session authentication

## Testing

### Test Environment Setup

1. **Local Lago Instance**
   ```bash
   docker-compose -f docker-compose.test.yml up
   ```

2. **Test Data**
   - Use email pattern: `test+{scenario}@test.com`
   - Use external IDs: `test_user_{uuid}`

3. **Reset Test Database**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Manual Testing

1. **Test Customer Creation**
   - Go to `/dashboard/lago-billing`
   - Click "Purchase Credits"
   - Verify customer created in Lago dashboard

2. **Test Credit Purchase**
   - Select a credit package
   - Complete purchase
   - Verify balance updates

3. **Test Invoice Generation**
   - Navigate to Invoices tab
   - Verify invoices appear after purchases

### API Testing with Postman/curl

```bash
# Test customer creation
curl -X POST http://localhost:3000/api/lago/customers \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "test_user_001",
    "name": "Test User",
    "email": "test@example.com"
  }'

# Test wallet creation
curl -X POST http://localhost:3000/api/lago/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "external_customer_id": "test_user_001",
    "paid_credits": "100.00",
    "currency": "USD"
  }'
```

## Troubleshooting

### Common Issues

#### 1. "Lago API configuration missing" Error

**Solution**: Ensure environment variables are set:
```bash
echo $LAGO_API_URL
echo $LAGO_API_KEY
```

#### 2. Network Errors / Timeouts

**Check**:
- Lago instance is running: `docker ps | grep lago`
- URL is correct and accessible
- Firewall rules allow connections

#### 3. 401 Unauthorized Errors

**Solution**: Verify API key is correct:
- Check Lago dashboard > Settings > API Keys
- Ensure key has proper permissions
- Regenerate key if necessary

#### 4. Customer Not Found (404)

**Cause**: Customer doesn't exist in Lago yet

**Solution**: The app should auto-create customers, but you can manually create:
```bash
POST /api/lago/customers
```

#### 5. CORS Errors

**Solution**: If Lago is on different domain, configure CORS in Lago:
```yaml
# In Lago docker-compose.yml
environment:
  - FRONT_URL=https://your-app.vercel.app
```

### Debugging

Enable detailed logging:

```typescript
// In lib/lago-client.ts, uncomment console.log statements
console.log('[LagoClient] Request:', method, url, body);
console.log('[LagoClient] Response:', status, data);
```

### Getting Help

- Lago Documentation: https://doc.getlago.com
- Lago GitHub: https://github.com/getlago/lago
- Neosaas Issues: Check project GitHub issues

## Next Steps

1. **Implement Webhooks**: Listen for Lago events (payments, usage, etc.)
2. **Add Real Charts**: Integrate Recharts for analytics
3. **Email Notifications**: Alert users on low balance
4. **Auto Top-Up**: Implement automatic credit purchases
5. **Multi-Currency**: Support multiple currencies
6. **Usage Reports**: Generate detailed usage reports

## License

This integration follows the Neosaas project license.

---

For questions or issues, please open a GitHub issue or contact the development team.
