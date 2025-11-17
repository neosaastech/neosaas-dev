import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool } from '@neondatabase/serverless'

// Use lazy initialization to avoid build-time errors
// The DATABASE_URL will be validated when db is actually used
const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return drizzle(pool)
}

let dbInstance: ReturnType<typeof drizzle> | null = null

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!dbInstance) {
      dbInstance = getDb()
    }
    return (dbInstance as any)[prop]
  }
})
