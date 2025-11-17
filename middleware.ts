import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth0 } from './lib/auth0'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Auth0 middleware (handles /auth/* routes automatically)
  const auth0Response = await auth0.middleware(request)
  if (auth0Response) {
    return auth0Response
  }

  // Maintenance mode check
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode && path !== '/(errors)/maintenance') {
    return NextResponse.redirect(new URL('/(errors)/maintenance', request.url))
  }

  // If we're in maintenance page but maintenance mode is off, redirect to home
  if (!isMaintenanceMode && path === '/(errors)/maintenance') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}