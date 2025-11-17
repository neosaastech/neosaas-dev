import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0'

// Gestion des routes Auth0 standard
export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard', // Redirection après login
  }),
  logout: handleLogout({
    returnTo: '/auth/login', // Redirection après logout
  }),
})
