# Authentication Setup Guide

This project uses a hybrid authentication system combining **Auth0** for user login and **internal JWT tokens** for API calls. This approach is optimized for Next.js 16 and Vercel deployment.

## 🏗️ Architecture Overview

```
User Login (Auth0) → Session Cookie → Internal JWT Generation → Protected API Calls
```

### Flow:
1. User clicks "Sign in" → redirected to Auth0 login page
2. After successful Auth0 authentication → session cookie is set
3. Client requests internal JWT from `/api/auth/internal-token`
4. Internal JWT is used for subsequent API calls
5. Protected routes verify JWT before granting access

## 📋 Prerequisites

1. **Auth0 Account**: Create a free account at [auth0.com](https://auth0.com)
2. **Auth0 Application**: Create a Regular Web Application
3. **Vercel Account** (for deployment)

## 🔧 Setup Instructions

### Step 1: Configure Auth0

1. **Create an Auth0 Application**:
   - Go to Auth0 Dashboard → Applications → Create Application
   - Choose "Regular Web Application"
   - Select Next.js as the technology

2. **Configure Application Settings**:
   - **Allowed Callback URLs**:
     ```
     http://localhost:3000/api/auth/callback
     https://your-app.vercel.app/api/auth/callback
     ```
   - **Allowed Logout URLs**:
     ```
     http://localhost:3000
     https://your-app.vercel.app
     ```
   - **Allowed Web Origins**:
     ```
     http://localhost:3000
     https://your-app.vercel.app
     ```

3. **Note your credentials**:
   - Domain (e.g., `dev-abc123.us.auth0.com`)
   - Client ID
   - Client Secret

### Step 2: Configure Environment Variables

1. **Local Development** - Create `.env.local`:
   ```env
   # Auth0 Configuration
   AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
   AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
   AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'

   # Internal JWT Secret
   INTERNAL_JWT_SECRET='use [openssl rand -hex 32] to generate another secret'
   ```

2. **Vercel Deployment** - Add environment variables in Vercel:
   - Go to your project settings → Environment Variables
   - Add all variables from above
   - Update `AUTH0_BASE_URL` to your Vercel URL

### Step 3: Generate Secrets

Generate secure random secrets:

```bash
# For AUTH0_SECRET
openssl rand -hex 32

# For INTERNAL_JWT_SECRET
openssl rand -hex 32
```

## 🚀 Usage Examples

### Auth0 Client Setup

First, the Auth0 client is initialized in `lib/auth0.ts`:

```tsx
// lib/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();
```

This instance is used throughout the application for all Auth0 operations.

### Protected Page Example

```tsx
// app/dashboard/page.tsx
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

### Client Component with User Info

```tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { UserProfile } from '@/components/auth/user-profile';

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <UserProfile />;
}
```

### Calling Protected API

```tsx
'use client';

import { fetchProtectedData } from '@/lib/auth-client';

export default function DataFetcher() {
  const fetchData = async () => {
    const data = await fetchProtectedData('/api/protected');
    console.log(data);
  };

  return (
    <button onClick={fetchData}>
      Fetch Protected Data
    </button>
  );
}
```

### Creating a Protected API Route

```tsx
// app/api/my-protected-route/route.ts
import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'This is protected data',
    user: session.user,
  });
}
```

## 🔐 Security Features

- ✅ **End-to-end encryption** with Auth0
- ✅ **Session cookies** are HTTP-only and secure
- ✅ **JWT tokens** have 1-hour expiration
- ✅ **Edge runtime** support for fast authentication checks
- ✅ **CSRF protection** built into Auth0 SDK
- ✅ **Environment variables** never exposed to client

## 🛣️ Available Routes

### How Auth Routes Work

The Auth0 middleware automatically mounts all authentication routes when `auth0.middleware(request)` is called in `proxy.ts`. **No additional API route files are needed for authentication**.

The middleware handles these routes automatically:
- `/api/auth/login` - Initiates login flow
- `/api/auth/logout` - Logs out the user
- `/api/auth/callback` - Handles Auth0 callback
- `/api/auth/profile` - Returns user profile data

### Custom Routes (created manually)
- `/api/auth/internal-token` - Generate internal JWT token (custom implementation)
- `/api/protected` - Example protected API route (custom implementation)
- `/auth/login` - Custom login page UI (custom implementation)

**Note**: Do not create `app/api/auth/[auth0]/route.ts` - the middleware handles all auth routes automatically!

## 🧪 Testing

### Test Authentication Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/auth/login

3. Click "Sign in with Auth0"

4. Complete Auth0 login flow

5. You should be redirected back to your app (logged in)

### Test Protected API

```bash
# 1. Get internal token (requires active Auth0 session)
curl http://localhost:3000/api/auth/internal-token

# 2. Use token to call protected API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/protected
```

## 📦 File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── internal-token/route.ts # JWT generator (custom)
│   │   └── protected/route.ts          # Example protected API
│   └── auth/
│       └── login/page.tsx              # Custom login page UI
├── lib/
│   ├── auth0.ts                        # Auth0Client instance (REQUIRED)
│   ├── auth.ts                         # Server-side auth utilities
│   └── auth-client.ts                  # Client-side auth helpers
├── components/
│   └── auth/
│       └── user-profile.tsx            # User profile component
└── proxy.ts                            # Authentication proxy (mounts auth routes)
```

**Important**: The `proxy.ts` middleware automatically handles all Auth0 routes. Do not create `app/api/auth/[auth0]/route.ts`!

## 🔄 Migration from Auth0-only to Hybrid System

If you're migrating from pure Auth0:

1. ✅ Keep Auth0 for user login (no changes needed)
2. ✅ Add internal JWT generation for API calls
3. ✅ Update protected routes to accept both session cookies and JWT
4. ✅ Gradually migrate API routes to use internal JWT

## ⚠️ Common Issues

### Issue: "Invalid URL" error on login
**Solution**: Ensure `AUTH0_BASE_URL` matches your actual URL (no trailing slash)

### Issue: "Session not found"
**Solution**: Make sure cookies are enabled and `AUTH0_SECRET` is set

### Issue: "JWT verification failed"
**Solution**: Verify `INTERNAL_JWT_SECRET` is the same across all environments

### Issue: CORS errors on API calls
**Solution**: Ensure API routes are on the same domain or configure CORS properly

## 📚 Additional Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Next.js 16 Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT.io - Debug JWT tokens](https://jwt.io)

## 🆘 Support

For issues specific to this implementation:
1. Check this README first
2. Review `.env.exemple` for required variables
3. Check Vercel deployment logs
4. Review Auth0 dashboard logs

For Auth0-specific issues:
- [Auth0 Community](https://community.auth0.com/)
- [Auth0 Support](https://support.auth0.com/)

---

**Last Updated**: 2025-11-17
**Compatible with**: Next.js 16, Vercel, Auth0 SDK v3+
