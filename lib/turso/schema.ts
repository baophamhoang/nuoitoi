// SQLite schema for local development reference
// Run with: sqlite3 nuoitoi.db < schema.sql
// Or use the TURSO_DATABASE_URL=file:nuoitoi.db env var and let @libsql/client create the DB

export const schema = `
CREATE TABLE IF NOT EXISTS donations (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT    NOT NULL DEFAULT 'Ẩn danh',
  amount      INTEGER NOT NULL,
  message     TEXT,
  verified    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id          TEXT    PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  category    TEXT    NOT NULL,
  label       TEXT    NOT NULL,
  description TEXT,
  percentage  REAL    NOT NULL,
  spent       INTEGER NOT NULL DEFAULT 0,
  budget      INTEGER NOT NULL,
  color       TEXT,
  chart_color TEXT,
  month       TEXT,
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
`;
