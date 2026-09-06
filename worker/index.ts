import { Hono } from 'hono'
import { createAuth } from './modules/auth/auth'

const app = new Hono<{ Bindings: Env }>()

app.on(['GET', 'POST'], '/api/auth/*', c => {
  try {
    return createAuth(c.env).handler(c.req.raw)
  } catch (error) {
    console.error(JSON.stringify({
      message: 'auth handler unavailable',
      error: error instanceof Error ? error.message : String(error),
    }))

    return c.json(
      {
        error: {
          code: 'AUTH_UNAVAILABLE',
          message: 'Authentication is not configured for this environment.',
        },
      },
      503,
    )
  }
})

app.get('/api/health', c => {
  return c.json({
    ok: true,
    service: 'dearlove',
    environment: c.env.ENVIRONMENT ?? 'development',
    databaseConfigured: Boolean(c.env.DB),
  })
})

app.all('*', c => c.env.ASSETS.fetch(c.req.raw))

export default app
