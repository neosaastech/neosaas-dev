import { initAuth0 } from '@auth0/nextjs-auth0'

// Validation des variables d'environnement
if (!process.env.AUTH0_SECRET) {
  throw new Error('AUTH0_SECRET is not defined')
}
if (!process.env.AUTH0_BASE_URL) {
  throw new Error('AUTH0_BASE_URL is not defined')
}
if (!process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error('AUTH0_ISSUER_BASE_URL is not defined')
}
if (!process.env.AUTH0_CLIENT_ID) {
  throw new Error('AUTH0_CLIENT_ID is not defined')
}
if (!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error('AUTH0_CLIENT_SECRET is not defined')
}

// Initialisation d'Auth0
export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/auth/login',
  },
})

// Export des fonctions utiles
export const getSession = auth0.getSession
export const getAccessToken = auth0.getAccessToken
export const withApiAuthRequired = auth0.withApiAuthRequired
export const withPageAuthRequired = auth0.withPageAuthRequired
export const handleLogin = auth0.handleLogin
export const handleLogout = auth0.handleLogout
export const handleCallback = auth0.handleCallback
export const handleProfile = auth0.handleProfile
