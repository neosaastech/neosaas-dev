import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/edge'

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
    const session = await getSession(request)

    if (!session || !session.user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/api/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
