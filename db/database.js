const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'streamflow.db');

let db;
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  console.log('Connected to SQLite database successfully');
  createTables();
} catch (err) {
  console.error('Error connecting to database:', err.message);
}

function createTables() {
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar_path TEXT,
      gdrive_api_key TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      filepath TEXT NOT NULL,
      thumbnail_path TEXT,
      file_size INTEGER,
      duration REAL,
      format TEXT,
      resolution TEXT,
      bitrate INTEGER,
      fps TEXT,
      user_id TEXT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS streams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      video_id TEXT,
      rtmp_url TEXT NOT NULL,
      stream_key TEXT NOT NULL,
      platform TEXT,
      platform_icon TEXT,
      bitrate INTEGER DEFAULT 2500,
      resolution TEXT,
      fps INTEGER DEFAULT 30,
      orientation TEXT DEFAULT 'horizontal',
      loop_video BOOLEAN DEFAULT 1,
      schedule_time TIMESTAMP,
      duration INTEGER,
      status TEXT DEFAULT 'offline',
      status_updated_at TIMESTAMP,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      use_advanced_settings BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (video_id) REFERENCES videos(id)
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS stream_history (
      id TEXT PRIMARY KEY,
      stream_id TEXT,
      title TEXT NOT NULL,
      platform TEXT,
      platform_icon TEXT,
      video_id TEXT,
      video_title TEXT,
      resolution TEXT,
      bitrate INTEGER,
      fps INTEGER,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      duration INTEGER,
      use_advanced_settings BOOLEAN DEFAULT 0,
      stream_key TEXT,
      rtmp_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (stream_id) REFERENCES streams(id),
      FOREIGN KEY (video_id) REFERENCES videos(id)
    )`);

    try {
      db.exec(`ALTER TABLE stream_history ADD COLUMN stream_key TEXT`);
    } catch (err) {
    }
    
    try {
      db.exec(`ALTER TABLE stream_history ADD COLUMN rtmp_url TEXT`);
    } catch (err) {
    }

    db.exec(`CREATE TABLE IF NOT EXISTS video_analytics (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      thumbnail TEXT,
      channel_name TEXT,
      upload_date TEXT,
      view_count INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      current_viewers INTEGER DEFAULT 0,
      is_live BOOLEAN DEFAULT 0,
      analytics_data TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(video_id, user_id)
    )`);

    migrateVideoAnalyticsTable();
    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
}

function migrateVideoAnalyticsTable() {
  const newColumns = [
    'view_count INTEGER DEFAULT 0',
    'likes INTEGER DEFAULT 0', 
    'dislikes INTEGER DEFAULT 0',
    'current_viewers INTEGER DEFAULT 0',
    'is_live BOOLEAN DEFAULT 0',
    'analytics_data TEXT',
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  ];

  newColumns.forEach(columnDef => {
    const columnName = columnDef.split(' ')[0];
    try {
      db.exec(`ALTER TABLE video_analytics ADD COLUMN ${columnDef}`);
    } catch (err) {
      if (!err.message.includes('duplicate column name')) {
        console.error(`Error adding column ${columnName}:`, err.message);
      }
    }
  });
}

function checkIfUsersExist() {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
    return result.count > 0;
  } catch (err) {
    console.error('Error checking users:', err.message);
    return false;
  }
}

module.exports = {
  db,
  checkIfUsersExist,
  
  addVideoToAnalytics: (userId, videoData) => {
    try {
      const { videoId, title, thumbnail, channelName, uploadDate, analytics, isLive } = videoData;
      const id = require('crypto').randomUUID();
      
      const analyticsJson = JSON.stringify(analytics || {});
      
      const stmt = db.prepare(`INSERT OR REPLACE INTO video_analytics 
         (id, video_id, user_id, title, thumbnail, channel_name, upload_date, 
          view_count, likes, dislikes, current_viewers, is_live, analytics_data, last_updated) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`);
      
      stmt.run(
        id, 
        videoId, 
        userId, 
        title, 
        thumbnail, 
        channelName, 
        uploadDate,
        analytics?.viewCount || 0,
        analytics?.likes || 0,
        analytics?.dislikes || 0,
        analytics?.currentViewers || 0,
        isLive ? 1 : 0,
        analyticsJson
      );

      return Promise.resolve({ 
        id, 
        videoId, 
        title, 
        thumbnail, 
        channelName, 
        uploadDate, 
        analytics: analytics || {},
        isLive: isLive || false
      });
    } catch (err) {
      return Promise.reject(err);
    }
  },

  getUserAnalyticsVideos: (userId) => {
    try {
      const stmt = db.prepare(`SELECT video_id, title, thumbnail, channel_name, upload_date, 
              view_count, likes, dislikes, current_viewers, is_live, 
              analytics_data, added_at 
       FROM video_analytics 
       WHERE user_id = ? 
       ORDER BY added_at DESC`);
      
      const rows = stmt.all(userId);
      
      const videos = rows.map(row => ({
        videoId: row.video_id,
        title: row.title,
        thumbnail: row.thumbnail,
        channelName: row.channel_name,
        uploadDate: row.upload_date,
        isLive: Boolean(row.is_live),
        analytics: {
          viewCount: row.view_count || 0,
          likes: row.likes || 0,
          dislikes: row.dislikes || 0,
          currentViewers: row.current_viewers || 0,
          ...JSON.parse(row.analytics_data || '{}')
        },
        addedAt: row.added_at
      }));
      
      return Promise.resolve(videos);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  
  removeVideoFromAnalytics: (userId, videoId) => {
    try {
      const stmt = db.prepare(`DELETE FROM video_analytics WHERE user_id = ? AND video_id = ?`);
      const result = stmt.run(userId, videoId);
      return Promise.resolve(result.changes > 0);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  updateVideoAnalyticsData: (userId, videoId, videoData) => {
    try {
      const { title, thumbnail, channelName, uploadDate, analytics, isLive } = videoData;
      const analyticsJson = JSON.stringify(analytics || {});
      
      const stmt = db.prepare(`UPDATE video_analytics 
         SET title = ?, thumbnail = ?, channel_name = ?, upload_date = ?,
             view_count = ?, likes = ?, dislikes = ?, current_viewers = ?,
             is_live = ?, analytics_data = ?, last_updated = CURRENT_TIMESTAMP
         WHERE user_id = ? AND video_id = ?`);
      
      const result = stmt.run(
        title, 
        thumbnail, 
        channelName, 
        uploadDate,
        analytics?.viewCount || 0,
        analytics?.likes || 0,
        analytics?.dislikes || 0,
        analytics?.currentViewers || 0,
        isLive ? 1 : 0,
        analyticsJson,
        userId, 
        videoId
      );
      
      return Promise.resolve(result.changes > 0);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  getVideoAnalytics: (userId, videoId) => {
    try {
      const stmt = db.prepare(`SELECT video_id, title, thumbnail, channel_name, upload_date, 
              view_count, likes, dislikes, current_viewers, is_live, 
              analytics_data, added_at 
       FROM video_analytics 
       WHERE user_id = ? AND video_id = ?`);
      
      const row = stmt.get(userId, videoId);
      
      if (!row) {
        return Promise.resolve(null);
      }
      
      const video = {
        videoId: row.video_id,
        title: row.title,
        thumbnail: row.thumbnail,
        channelName: row.channel_name,
        uploadDate: row.upload_date,
        isLive: Boolean(row.is_live),
        analytics: {
          viewCount: row.view_count || 0,
          likes: row.likes || 0,
          dislikes: row.dislikes || 0,
          currentViewers: row.current_viewers || 0,
          ...JSON.parse(row.analytics_data || '{}')
        },
        addedAt: row.added_at
      };
      
      return Promise.resolve(video);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
