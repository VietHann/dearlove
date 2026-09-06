import { relations } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}

export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  status: text('status', { enum: ['active', 'suspended'] }).notNull().default('active'),
  phone: text('phone'),
  ...timestamps,
}, table => ({
  emailUnique: uniqueIndex('uq_user_email').on(table.email),
  roleStatus: index('idx_user_role_status').on(table.role, table.status),
}))

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
}, table => ({
  tokenUnique: uniqueIndex('uq_session_token').on(table.token),
  userId: index('idx_session_user_id').on(table.userId),
}))

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  ...timestamps,
}, table => ({
  providerAccountUnique: uniqueIndex('uq_account_provider_account').on(table.providerId, table.accountId),
  userId: index('idx_account_user_id').on(table.userId),
}))

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  ...timestamps,
}, table => ({
  identifier: index('idx_verification_identifier').on(table.identifier),
}))

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  valueJson: text('value_json').notNull(),
  ...timestamps,
}, table => ({
  keyUnique: uniqueIndex('uq_site_settings_key').on(table.key),
}))

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoImageAssetId: text('seo_image_asset_id'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  publishedRevisionId: text('published_revision_id'),
  ...timestamps,
}, table => ({
  keyUnique: uniqueIndex('uq_pages_key').on(table.key),
  slugUnique: uniqueIndex('uq_pages_slug').on(table.slug),
  status: index('idx_pages_status').on(table.status),
}))

export const contentRevisions = sqliteTable('content_revisions', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  snapshotJson: text('snapshot_json').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  publishNote: text('publish_note'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  ...timestamps,
}, table => ({
  pageVersionUnique: uniqueIndex('uq_content_revision_page_version').on(table.pageId, table.version),
  pageId: index('idx_content_revision_page_id').on(table.pageId),
}))

export const pageSections = sqliteTable('page_sections', {
  id: text('id').primaryKey(),
  revisionId: text('revision_id').notNull().references(() => contentRevisions.id, { onDelete: 'cascade' }),
  stableKey: text('stable_key').notNull(),
  blockType: text('block_type').notNull(),
  position: integer('position').notNull(),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  payloadJson: text('payload_json').notNull(),
  ...timestamps,
}, table => ({
  revisionPosition: index('idx_page_sections_revision_position').on(table.revisionId, table.position),
}))

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  bucket: text('bucket', { enum: ['public', 'private'] }).notNull(),
  objectKey: text('object_key').notNull(),
  purpose: text('purpose').notNull(),
  ownerId: text('owner_id').references(() => users.id),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  width: integer('width'),
  height: integer('height'),
  checksum: text('checksum'),
  originalFilename: text('original_filename'),
  altText: text('alt_text'),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull(),
  status: text('status', { enum: ['pending', 'ready', 'deleted'] }).notNull().default('pending'),
  ...timestamps,
}, table => ({
  objectKeyUnique: uniqueIndex('uq_media_assets_bucket_object_key').on(table.bucket, table.objectKey),
  ownerPurpose: index('idx_media_assets_owner_purpose').on(table.ownerId, table.purpose),
}))

export const templateCategories = sqliteTable('template_categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  position: integer('position').notNull().default(0),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  ...timestamps,
}, table => ({
  slugUnique: uniqueIndex('uq_template_categories_slug').on(table.slug),
  statusPosition: index('idx_template_categories_status_position').on(table.status, table.position),
}))

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull().references(() => templateCategories.id),
  description: text('description'),
  accessTier: text('access_tier', { enum: ['free', 'premium'] }).notNull().default('free'),
  priceLabel: text('price_label'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => ({
  slugUnique: uniqueIndex('uq_templates_slug').on(table.slug),
  catalogOrder: index('idx_templates_catalog_order').on(table.status, table.categoryId, table.sortOrder),
}))

export const templateScreenshots = sqliteTable('template_screenshots', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  mediaAssetId: text('media_asset_id').notNull().references(() => mediaAssets.id),
  variant: text('variant', { enum: ['thumbnail', 'fullpage'] }).notNull(),
  position: integer('position').notNull().default(0),
  watermarkVersion: text('watermark_version'),
  ...timestamps,
}, table => ({
  templateVariant: index('idx_template_screenshots_template_variant').on(table.templateId, table.variant, table.position),
}))

export const pricingPlans = sqliteTable('pricing_plans', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  priceLabel: text('price_label').notNull(),
  originalPriceLabel: text('original_price_label'),
  description: text('description'),
  payloadJson: text('payload_json').notNull(),
  position: integer('position').notNull().default(0),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  ...timestamps,
}, table => ({
  slugUnique: uniqueIndex('uq_pricing_plans_slug').on(table.slug),
  statusPosition: index('idx_pricing_plans_status_position').on(table.status, table.position),
}))

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderCode: text('order_code').notNull(),
  customerId: text('customer_id').notNull().references(() => users.id),
  templateId: text('template_id').notNull().references(() => templates.id),
  templateSnapshotJson: text('template_snapshot_json').notNull(),
  packageSnapshotJson: text('package_snapshot_json'),
  status: text('status', { enum: ['draft', 'submitted', 'reviewing', 'awaiting_customer', 'confirmed', 'in_production', 'ready', 'delivered', 'completed', 'cancelled'] }).notNull().default('draft'),
  paymentStatus: text('payment_status', { enum: ['unpaid', 'pending_verification', 'paid', 'refunded'] }).notNull().default('unpaid'),
  eventDate: text('event_date'),
  requestedDeadline: text('requested_deadline'),
  contactSnapshotJson: text('contact_snapshot_json').notNull(),
  quotedAmount: integer('quoted_amount'),
  customerNote: text('customer_note'),
  ...timestamps,
}, table => ({
  orderCodeUnique: uniqueIndex('uq_orders_order_code').on(table.orderCode),
  statusCreated: index('idx_orders_status_created').on(table.status, table.createdAt),
  customerCreated: index('idx_orders_customer_created').on(table.customerId, table.createdAt),
}))

export const orderFormAnswers = sqliteTable('order_form_answers', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fieldKey: text('field_key').notNull(),
  fieldLabelSnapshot: text('field_label_snapshot').notNull(),
  valueJson: text('value_json').notNull(),
  ...timestamps,
}, table => ({
  orderFieldUnique: uniqueIndex('uq_order_form_answers_order_field').on(table.orderId, table.fieldKey),
}))

export const orderUploadGroups = sqliteTable('order_upload_groups', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  groupKey: text('group_key').notNull(),
  label: text('label').notNull(),
  minFiles: integer('min_files').notNull().default(0),
  maxFiles: integer('max_files'),
  ...timestamps,
}, table => ({
  orderGroupUnique: uniqueIndex('uq_order_upload_groups_order_group').on(table.orderId, table.groupKey),
}))

export const orderFiles = sqliteTable('order_files', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull().references(() => orderUploadGroups.id, { onDelete: 'cascade' }),
  mediaAssetId: text('media_asset_id').notNull().references(() => mediaAssets.id),
  position: integer('position').notNull().default(0),
  customerNote: text('customer_note'),
  ...timestamps,
}, table => ({
  orderGroup: index('idx_order_files_order_group').on(table.orderId, table.groupId, table.position),
}))

export const orderStatusHistory = sqliteTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  actorId: text('actor_id').notNull().references(() => users.id),
  reason: text('reason'),
  ...timestamps,
}, table => ({
  orderCreated: index('idx_order_status_history_order_created').on(table.orderId, table.createdAt),
}))

export const orderNotes = sqliteTable('order_notes', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  visibility: text('visibility', { enum: ['customer', 'internal'] }).notNull(),
  body: text('body').notNull(),
  ...timestamps,
}, table => ({
  orderCreated: index('idx_order_notes_order_created').on(table.orderId, table.createdAt),
}))

export const orderAssignments = sqliteTable('order_assignments', {
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  adminId: text('admin_id').notNull().references(() => users.id),
  assignedAt: integer('assigned_at', { mode: 'timestamp_ms' }).notNull(),
  unassignedAt: integer('unassigned_at', { mode: 'timestamp_ms' }),
}, table => ({
  pk: primaryKey({ columns: [table.orderId, table.adminId, table.assignedAt] }),
  orderActive: index('idx_order_assignments_order_active').on(table.orderId, table.unassignedAt),
}))

export const contactSubmissions = sqliteTable('contact_submissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['new', 'in_progress', 'resolved', 'spam'] }).notNull().default('new'),
  assignedTo: text('assigned_to').references(() => users.id),
  ...timestamps,
}, table => ({
  statusCreated: index('idx_contact_submissions_status_created').on(table.status, table.createdAt),
}))

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  status: text('status', { enum: ['pending', 'active', 'unsubscribed'] }).notNull().default('pending'),
  consentAt: integer('consent_at', { mode: 'timestamp_ms' }).notNull(),
  unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp_ms' }),
  ...timestamps,
}, table => ({
  emailUnique: uniqueIndex('uq_newsletter_subscribers_email').on(table.email),
  statusCreated: index('idx_newsletter_subscribers_status_created').on(table.status, table.createdAt),
}))

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  channel: text('channel', { enum: ['in_app', 'email'] }).notNull(),
  payloadJson: text('payload_json').notNull(),
  status: text('status', { enum: ['pending', 'sent', 'failed', 'read'] }).notNull().default('pending'),
  sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
  readAt: integer('read_at', { mode: 'timestamp_ms' }),
  ...timestamps,
}, table => ({
  userStatusCreated: index('idx_notifications_user_status_created').on(table.userId, table.status, table.createdAt),
}))

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadataJson: text('metadata_json'),
  ...timestamps,
}, table => ({
  entityCreated: index('idx_audit_logs_entity_created').on(table.entityType, table.entityId, table.createdAt),
  actorCreated: index('idx_audit_logs_actor_created').on(table.actorId, table.createdAt),
}))

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}))

export const templatesRelations = relations(templates, ({ one, many }) => ({
  category: one(templateCategories, { fields: [templates.categoryId], references: [templateCategories.id] }),
  screenshots: many(templateScreenshots),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  template: one(templates, { fields: [orders.templateId], references: [templates.id] }),
  formAnswers: many(orderFormAnswers),
  uploadGroups: many(orderUploadGroups),
  files: many(orderFiles),
  statusHistory: many(orderStatusHistory),
  notes: many(orderNotes),
}))

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  siteSettings,
  pages,
  contentRevisions,
  pageSections,
  mediaAssets,
  templateCategories,
  templates,
  templateScreenshots,
  pricingPlans,
  orders,
  orderFormAnswers,
  orderUploadGroups,
  orderFiles,
  orderStatusHistory,
  orderNotes,
  orderAssignments,
  contactSubmissions,
  newsletterSubscribers,
  notifications,
  auditLogs,
}
