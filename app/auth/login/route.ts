import { auth0 } from '@/lib/auth0'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Déclencher le login Auth0 avec redirection vers /dashboard après connexion
  return await auth0.login(request, {
    returnTo: '/dashboard',
  })
}
