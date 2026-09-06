import { betterAuth } from 'better-auth/minimal'
import type { Auth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from '../../db/client'
import {
  accounts,
  schema,
  sessions,
  users,
  verifications,
} from '../../db/schema'

type AuthEnvironment = Pick<Env, 'DB' | 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'ENVIRONMENT'>

const authSchema = {
  ...schema,
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
}

export function createAuth(env: AuthEnvironment): Auth<any> {
  const db = createDb({ DB: env.DB })

  return betterAuth({
    appName: 'Dearlove',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'customer',
          input: false,
        },
        status: {
          type: 'string',
          required: false,
          defaultValue: 'active',
          input: false,
        },
        phone: {
          type: 'string',
          required: false,
          input: true,
        },
      },
    },
    advanced: {
      cookiePrefix: 'dearlove',
      useSecureCookies: String(env.ENVIRONMENT) === 'production',
    },
  })
}
