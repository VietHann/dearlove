CREATE TABLE IF NOT EXISTS request_deduplication (
  id TEXT PRIMARY KEY NOT NULL,
  scope TEXT NOT NULL,
  request_key TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(scope, request_key)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_request_deduplication_created
  ON request_deduplication(created_at);
