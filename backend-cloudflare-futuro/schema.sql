CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  user_key TEXT NOT NULL,
  value REAL NOT NULL,
  place TEXT DEFAULT '',
  cat TEXT DEFAULT 'outros',
  type TEXT DEFAULT 'out',
  date TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS items_user ON items(user_key, date);
CREATE TABLE IF NOT EXISTS learn (
  user_key TEXT NOT NULL,
  place TEXT NOT NULL,
  cat TEXT NOT NULL,
  PRIMARY KEY (user_key, place)
);
