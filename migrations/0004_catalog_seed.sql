-- Dearlove catalog baseline. Binary derivatives are uploaded to R2 separately;
-- this migration stores only catalog metadata and server-owned object keys.
INSERT INTO template_categories (id, slug, name, description, position, status, created_at, updated_at)
VALUES
  ('cat-wedding', 'wedding', 'Thiệp cưới', 'Mẫu thiệp cưới Dearlove.', 0, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('cat-graduation', 'graduation', 'Thiệp tốt nghiệp', 'Mẫu thiệp chúc mừng tốt nghiệp.', 1, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('cat-birthday', 'birthday', 'Thiệp sinh nhật', 'Mẫu thiệp sinh nhật.', 2, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('cat-event', 'event', 'Thiệp sự kiện', 'Mẫu thiệp sự kiện.', 3, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('cat-anniversary', 'anniversary', 'Thiệp kỷ niệm', 'Mẫu thiệp kỷ niệm.', 4, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('cat-wishes', 'wishes', 'Thiệp lời chúc', 'Mẫu thiệp lời chúc.', 5, 'published', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  position = excluded.position, status = excluded.status, updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO templates (id, slug, name, category_id, description, access_tier, price_label, status, featured, sort_order, created_at, updated_at)
VALUES
  ('44deae86-d256-438d-953b-08634f43f579', 'thiep-cuoi-10-pre', 'Thiệp Cưới 10 Pre', 'cat-wedding', 'Thiệp cưới thanh lịch với bố cục trang nhã.', 'free', 'Miễn phí', 'draft', 1, 0, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57', 'thiep-cuoi-128-pre', 'Thiệp Cưới 128 Pre', 'cat-wedding', 'Thiệp cưới tối giản và hiện đại.', 'free', 'Miễn phí', 'draft', 1, 1, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('ae71ea8f-04b9-4af0-9af8-654bb09536ae', 'thiep-cuoi-44-pre', 'Thiệp Cưới 44 Pre', 'cat-wedding', 'Thiệp cưới tinh tế cho ngày trọng đại.', 'free', 'Miễn phí', 'draft', 1, 2, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('be56fc48-f365-4a34-88b7-f4b66ba0c675', 'thiep-cuoi-99-premium', 'Thiệp Cưới 99 Premium', 'cat-wedding', 'Thiệp cưới nổi bật với phong cách cao cấp.', 'premium', 'Premium', 'draft', 1, 3, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8', 'thiep-cuoi-108-basic', 'Thiệp Cưới 108 Basic', 'cat-wedding', 'Thiệp cưới nhẹ nhàng, dễ chọn.', 'free', 'Miễn phí', 'draft', 0, 4, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('289f08c3-1024-42a7-b437-adf7ed7911bb', 'thiep-cuoi-88-pre', 'Thiệp Cưới 88 Pre', 'cat-wedding', 'Thiệp cưới mang cảm giác ấm áp.', 'free', 'Miễn phí', 'draft', 0, 5, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('5a13b180-bd5a-414f-a489-58596e89c42a', 'thiep-cuoi-90-pre', 'Thiệp Cưới 90 Pre', 'cat-wedding', 'Thiệp cưới thanh thoát và gần gũi.', 'free', 'Miễn phí', 'draft', 0, 6, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('9e93d16e-f13d-494a-b67b-fa475232de64', 'thiep-cuoi-66-pre', 'Thiệp Cưới 66 Pre', 'cat-wedding', 'Thiệp cưới với bố cục gọn gàng.', 'free', 'Miễn phí', 'draft', 0, 7, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('c1328fd2-218a-49e6-8e07-aa5b824c758d', 'thiep-cuoi-110-pre', 'Thiệp Cưới 110 Pre', 'cat-wedding', 'Thiệp cưới trẻ trung và tinh tế.', 'free', 'Miễn phí', 'draft', 0, 8, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('ab6b5944-69d8-45c8-9923-679f6bfe967d', 'thiep-cuoi-86-pre', 'Thiệp Cưới 86 Pre', 'cat-wedding', 'Thiệp cưới tối giản cho cặp đôi hiện đại.', 'free', 'Miễn phí', 'draft', 0, 9, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('ed0ccd4a-e6e0-49a5-b720-a38908dff7bf', 'thiep-cuoi-74-pre', 'Thiệp Cưới 74 Pre', 'cat-wedding', 'Thiệp cưới dịu dàng và trang nhã.', 'free', 'Miễn phí', 'draft', 0, 10, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('414508f9-80a7-405c-8fcc-909e6f3da129', 'thiep-cuoi-75-pre', 'Thiệp Cưới 75 Pre', 'cat-wedding', 'Thiệp cưới hiện đại với nhiều khoảng thở.', 'free', 'Miễn phí', 'draft', 0, 11, CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug, name = excluded.name, category_id = excluded.category_id,
  description = excluded.description, access_tier = excluded.access_tier,
  price_label = excluded.price_label, featured = excluded.featured,
  sort_order = excluded.sort_order, updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO media_assets (id, bucket, object_key, purpose, owner_id, mime_type, size_bytes, original_filename, alt_text, visibility, status, created_at, updated_at)
SELECT 'media-' || id, 'public', 'catalog/' || id || '.webp', 'catalog_fullpage', NULL, 'image/webp', 0, id || '.webp', name, 'public', 'pending', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000
FROM templates
WHERE id IN (
  '44deae86-d256-438d-953b-08634f43f579', 'eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57',
  'ae71ea8f-04b9-4af0-9af8-654bb09536ae', 'be56fc48-f365-4a34-88b7-f4b66ba0c675',
  'a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8', '289f08c3-1024-42a7-b437-adf7ed7911bb',
  '5a13b180-bd5a-414f-a489-58596e89c42a', '9e93d16e-f13d-494a-b67b-fa475232de64',
  'c1328fd2-218a-49e6-8e07-aa5b824c758d', 'ab6b5944-69d8-45c8-9923-679f6bfe967d',
  'ed0ccd4a-e6e0-49a5-b720-a38908dff7bf', '414508f9-80a7-405c-8fcc-909e6f3da129'
)
ON CONFLICT(id) DO UPDATE SET
  object_key = excluded.object_key, purpose = excluded.purpose,
  mime_type = excluded.mime_type, original_filename = excluded.original_filename,
  alt_text = excluded.alt_text, visibility = excluded.visibility, updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT OR IGNORE INTO template_screenshots (id, template_id, media_asset_id, variant, position, watermark_version, created_at, updated_at)
SELECT 'shot-' || id || '-thumbnail', id, 'media-' || id, 'thumbnail', 0, 'dearlove-v1', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000
FROM templates
WHERE id IN (
  '44deae86-d256-438d-953b-08634f43f579', 'eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57',
  'ae71ea8f-04b9-4af0-9af8-654bb09536ae', 'be56fc48-f365-4a34-88b7-f4b66ba0c675',
  'a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8', '289f08c3-1024-42a7-b437-adf7ed7911bb',
  '5a13b180-bd5a-414f-a489-58596e89c42a', '9e93d16e-f13d-494a-b67b-fa475232de64',
  'c1328fd2-218a-49e6-8e07-aa5b824c758d', 'ab6b5944-69d8-45c8-9923-679f6bfe967d',
  'ed0ccd4a-e6e0-49a5-b720-a38908dff7bf', '414508f9-80a7-405c-8fcc-909e6f3da129'
);
--> statement-breakpoint
INSERT OR IGNORE INTO template_screenshots (id, template_id, media_asset_id, variant, position, watermark_version, created_at, updated_at)
SELECT 'shot-' || id || '-fullpage', id, 'media-' || id, 'fullpage', 0, 'dearlove-v1', CAST(strftime('%s','now') AS INTEGER) * 1000, CAST(strftime('%s','now') AS INTEGER) * 1000
FROM templates
WHERE id IN (
  '44deae86-d256-438d-953b-08634f43f579', 'eacdb4ad-cbaf-455e-96ba-ddd1d82d9d57',
  'ae71ea8f-04b9-4af0-9af8-654bb09536ae', 'be56fc48-f365-4a34-88b7-f4b66ba0c675',
  'a8b6ea72-3877-40db-9c75-d1a7c0ae7fe8', '289f08c3-1024-42a7-b437-adf7ed7911bb',
  '5a13b180-bd5a-414f-a489-58596e89c42a', '9e93d16e-f13d-494a-b67b-fa475232de64',
  'c1328fd2-218a-49e6-8e07-aa5b824c758d', 'ab6b5944-69d8-45c8-9923-679f6bfe967d',
  'ed0ccd4a-e6e0-49a5-b720-a38908dff7bf', '414508f9-80a7-405c-8fcc-909e6f3da129'
);
