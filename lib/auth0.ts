import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

// Lazy initialization to avoid build-time errors with environment variables
const getAuth0Client = () => {
  return new Auth0Client({
    // Use correct environment variable names expected by @auth0/nextjs-auth0
    domain: process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    appBaseUrl: process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL!,
    secret: process.env.AUTH0_SECRET!,
    routes: {
      callback: '/auth/callback',
      postLogoutRedirect: '/auth/signin',
    },
    session: {
      rolling: true,
      rollingDuration: 24 * 60 * 60, // 24 hours
    },
    onCallback: async (session) => {
      // Créer l'utilisateur dans Neon après authentification réussie
      try {
        if (!session?.user) {
          return
        }

        const auth0Id = session.user.sub
        const email = session.user.email
        const name = session.user.name

        if (!auth0Id || !email) {
          console.error('Missing required user data from Auth0')
          return
        }

        // Vérifier si l'utilisateur existe
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.auth0Id, auth0Id))
          .limit(1)

        // Créer si inexistant
        if (existingUsers.length === 0) {
          const newUser = {
            id: crypto.randomUUID(),
            email,
            name: name || null,
            auth0Id,
          }

          await db.insert(users).values(newUser)
          console.log('✅ New user created:', { id: newUser.id, email: newUser.email })
        } else {
          console.log('✅ Existing user logged in:', { id: existingUsers[0].id, email: existingUsers[0].email })
        }
      } catch (error) {
        console.error('❌ Error creating user in database:', error)
        // Ne pas bloquer l'authentification en cas d'erreur DB
      }
    },
  })
}

let auth0Instance: Auth0Client | null = null

export const auth0 = new Proxy({} as Auth0Client, {
  get(target, prop) {
    if (!auth0Instance) {
      auth0Instance = getAuth0Client()
    }
    return (auth0Instance as any)[prop]
  }
})
