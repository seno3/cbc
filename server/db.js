const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'rankhacker.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS hackathons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    theme TEXT,
    end_date TEXT,
    judge_code TEXT NOT NULL DEFAULT 'judge',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hackathon_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    readme TEXT,
    tags TEXT,
    author_name TEXT NOT NULL,
    elo INTEGER NOT NULL DEFAULT 1000,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    judge_elo INTEGER NOT NULL DEFAULT 1000,
    judge_wins INTEGER NOT NULL DEFAULT 0,
    judge_losses INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
  );

  CREATE TABLE IF NOT EXISTS comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hackathon_id INTEGER NOT NULL,
    winner_id INTEGER NOT NULL,
    loser_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    is_judge INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (hackathon_id) REFERENCES hackathons(id),
    FOREIGN KEY (winner_id) REFERENCES projects(id),
    FOREIGN KEY (loser_id) REFERENCES projects(id)
  );
`);

// Migrate existing DBs — ignore errors if columns already exist
['judge_elo INTEGER NOT NULL DEFAULT 1000',
 'judge_wins INTEGER NOT NULL DEFAULT 0',
 'judge_losses INTEGER NOT NULL DEFAULT 0'].forEach(col => {
  try { db.exec(`ALTER TABLE projects ADD COLUMN ${col}`); } catch (_) {}
});

module.exports = db;
