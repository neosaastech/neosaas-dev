import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Maintenance mode check
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode && path !== '/(errors)/maintenance') {
    return NextResponse.redirect(new URL('/(errors)/maintenance', request.url))
  }

  if (!isMaintenanceMode && path === '/(errors)/maintenance') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Handle Auth0 authentication
  const authResponse = await auth0.middleware(request)

  // If Auth0 middleware returns a response (redirect, etc), use it
  if (authResponse) {
    return authResponse
  }

  // Additional protection for specific routes
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute) {
    // Check for Auth0 session
    const session = await auth0.getSession(request)

    if (!session) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/api/auth/login', request.url)
      loginUrl.searchParams.set('returnTo', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
