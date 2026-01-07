-- Yogi Samaj Sambandh Database Schema

-- Families table - stores family registration info
CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  head_name TEXT NOT NULL,
  sub_surname TEXT NOT NULL,
  gol TEXT NOT NULL,
  village TEXT,
  taluko TEXT,
  district TEXT,
  current_residence TEXT,
  encrypted_yw_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
) STRICT;

-- Family members table - stores individual family members
CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  member_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
) STRICT;
