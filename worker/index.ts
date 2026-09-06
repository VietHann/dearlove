import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', c => {
  return c.json({
    ok: true,
    service: 'dearlove',
    environment: c.env.ENVIRONMENT ?? 'development',
  })
})

app.all('*', c => c.env.ASSETS.fetch(c.req.raw))

export default app
