import { Hono } from 'hono'
import { createAuth } from './modules/auth/auth'
import { ordersApi } from './modules/orders/orders'
import { adminOrdersApi } from './modules/admin/orders'
import { adminDashboardApi } from './modules/admin/dashboard'
import { adminMediaApi, publicMediaApi } from './modules/admin/media'
import { adminCatalogApi } from './modules/admin/catalog'
import { publicCatalogApi } from './modules/catalog/public'

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

app.route('/api/v1/orders', ordersApi)
app.route('/api/v1/admin/orders', adminOrdersApi)
app.route('/api/v1/admin/dashboard', adminDashboardApi)
app.route('/api/v1/admin/media', adminMediaApi)
app.route('/api/v1/media/public', publicMediaApi)
app.route('/api/v1/admin/catalog', adminCatalogApi)
app.route('/api/v1/templates', publicCatalogApi)

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
