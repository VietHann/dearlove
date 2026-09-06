import { drizzle } from 'drizzle-orm/d1'
import { schema } from './schema'

export function createDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema })
}
