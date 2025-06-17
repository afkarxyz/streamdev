const { Store } = require('express-session');
const Database = require('better-sqlite3');
const path = require('path');

class BetterSQLiteStore extends Store {
  constructor(options = {}) {
    super(options);
    
    this.db = options.db || new Database(options.filename || path.join(__dirname, 'sessions.db'));
    this.tableName = options.table || 'sessions';
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expired INTEGER NOT NULL
      )
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expired 
      ON ${this.tableName} (expired)
    `);
    
    this.getStmt = this.db.prepare(`SELECT sess FROM ${this.tableName} WHERE sid = ? AND expired > ?`);
    this.setStmt = this.db.prepare(`INSERT OR REPLACE INTO ${this.tableName} (sid, sess, expired) VALUES (?, ?, ?)`);
    this.destroyStmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE sid = ?`);
    this.clearStmt = this.db.prepare(`DELETE FROM ${this.tableName}`);
    this.lengthStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE expired > ?`);
    this.cleanupStmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE expired <= ?`);
    
    if (options.autoCleanup !== false) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, options.cleanupInterval || 3600000);
    }
  }
  
  get(sid, callback) {
    try {
      const now = Date.now();
      const row = this.getStmt.get(sid, now);
      
      if (!row) {
        return callback();
      }
      
      const session = JSON.parse(row.sess);
      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }
  
  set(sid, session, callback) {
    try {
      const maxAge = session.cookie && session.cookie.maxAge;
      const expired = Date.now() + (maxAge || 86400000);
      
      this.setStmt.run(sid, JSON.stringify(session), expired);
      callback && callback();
    } catch (err) {
      callback && callback(err);
    }
  }
  
  destroy(sid, callback) {
    try {
      this.destroyStmt.run(sid);
      callback && callback();
    } catch (err) {
      callback && callback(err);
    }
  }
  
  clear(callback) {
    try {
      this.clearStmt.run();
      callback && callback();
    } catch (err) {
      callback && callback(err);
    }
  }
  
  length(callback) {
    try {
      const now = Date.now();
      const row = this.lengthStmt.get(now);
      callback(null, row.count);
    } catch (err) {
      callback(err);
    }
  }
  
  cleanup() {
    try {
      const now = Date.now();
      const result = this.cleanupStmt.run(now);
      console.log(`Cleaned up ${result.changes} expired sessions`);
    } catch (err) {
      console.error('Session cleanup error:', err);
    }
  }
  
  close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.db.close();
  }
}

module.exports = BetterSQLiteStore;
