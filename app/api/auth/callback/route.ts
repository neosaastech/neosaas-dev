import { handleCallback } from '@auth0/nextjs-auth0'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const GET = handleCallback({
  async afterCallback(req: NextRequest, session) {
    try {
      if (!session?.user) {
        console.error('No user in session after Auth0 callback')
        return session
      }

      const auth0User = session.user
      const auth0Id = auth0User.sub as string
      const email = auth0User.email as string
      const name = auth0User.name as string | null

      if (!auth0Id || !email) {
        console.error('Missing required user data from Auth0:', { auth0Id, email })
        return session
      }

      // Vérifier si l'utilisateur existe déjà dans la base de données
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.auth0Id, auth0Id))
        .limit(1)

      // Si l'utilisateur n'existe pas, le créer
      if (existingUsers.length === 0) {
        const newUser = {
          id: randomUUID(),
          email,
          name: name || null,
          auth0Id,
        }

        await db.insert(users).values(newUser)

        console.log('New user created:', { id: newUser.id, email: newUser.email })
      } else {
        console.log('Existing user logged in:', { id: existingUsers[0].id, email: existingUsers[0].email })
      }

      return session
    } catch (error) {
      console.error('Error in Auth0 callback:', error)
      // Ne pas bloquer l'authentification en cas d'erreur DB
      // L'utilisateur pourra quand même se connecter
      return session
    }
  },
})
