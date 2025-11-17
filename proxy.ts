import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute) {
    // Check for Auth0 session cookie
    const sessionCookie = request.cookies.get('appSession')

    if (!sessionCookie) {
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
