const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('./config');

let db;

function initDatabase() {
  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sick_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_text TEXT NOT NULL,
      triggered_phrase TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_triggers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      triggered_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_user_triggers_user_id_triggered_at
      ON user_triggers (user_id, triggered_at);
  `);
}

function canReply(userId) {
  const stmt = db.prepare(`
    SELECT COUNT(*) AS count FROM user_triggers
    WHERE user_id = ?
      AND triggered_at > datetime('now', ? || ' hours')
  `);
  const row = stmt.get(userId, `-${config.cooldownHours}`);
  return row.count === 0;
}

function recordTrigger(userId) {
  const stmt = db.prepare('INSERT INTO user_triggers (user_id) VALUES (?)');
  stmt.run(userId);
}

function logSickEvent({ userId, channelId, messageText, triggeredPhrase }) {
  const stmt = db.prepare(`
    INSERT INTO sick_events (user_id, channel_id, message_text, triggered_phrase)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(userId, channelId, messageText, triggeredPhrase);
}

function close() {
  if (db) {
    db.close();
  }
}

module.exports = {
  initDatabase,
  canReply,
  recordTrigger,
  logSickEvent,
  close,
};
