CREATE TABLE IF NOT EXISTS order_requests (
  id TEXT PRIMARY KEY NOT NULL,
  idempotency_key TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(customer_id, idempotency_key),
  FOREIGN KEY (customer_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_order_requests_created
  ON order_requests(created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_orders_payment_created
  ON orders(payment_status, created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_orders_deadline
  ON orders(requested_deadline, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_order_assignments_active_admin
  ON order_assignments(admin_id, unassigned_at, assigned_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_status
  ON contact_submissions(assigned_to, status, created_at);
