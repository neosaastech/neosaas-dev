import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // ID généré par notre app (UUID)
  email: text('email').notNull().unique(),
  name: text('name'),
  auth0Id: text('auth0_id').notNull().unique(), // ID Auth0 (sub claim)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
