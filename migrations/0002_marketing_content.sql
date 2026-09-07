CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_json TEXT NOT NULL,
  category_id TEXT REFERENCES blog_categories(id),
  author_id TEXT NOT NULL REFERENCES user(id),
  cover_asset_id TEXT REFERENCES media_assets(id),
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
  ON blog_posts(status, published_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_status
  ON blog_posts(category_id, status, published_at);
