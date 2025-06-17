const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');

class Video {
  static async create(data) {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const stmt = db.prepare(`INSERT INTO videos (
        id, title, filepath, thumbnail_path, file_size, 
        duration, format, resolution, bitrate, fps, user_id, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run(
        id, data.title, data.filepath, data.thumbnail_path, data.file_size,
        data.duration, data.format, data.resolution, data.bitrate, data.fps, data.user_id,
        now, now
      );
      
      return Promise.resolve({ id, ...data, created_at: now, updated_at: now });
    } catch (err) {
      console.error('Error creating video:', err.message);
      return Promise.reject(err);
    }
  }

  static findById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
      const row = stmt.get(id);
      return Promise.resolve(row);
    } catch (err) {
      console.error('Error finding video:', err.message);
      return Promise.reject(err);
    }
  }

  static findAll(userId = null) {
    try {
      let stmt;
      let rows;
      
      if (userId) {
        stmt = db.prepare('SELECT * FROM videos WHERE user_id = ? ORDER BY upload_date DESC');
        rows = stmt.all(userId);
      } else {
        stmt = db.prepare('SELECT * FROM videos ORDER BY upload_date DESC');
        rows = stmt.all();
      }
      
      return Promise.resolve(rows || []);
    } catch (err) {
      console.error('Error finding videos:', err.message);
      return Promise.reject(err);
    }
  }

  static update(id, videoData) {
    try {
      const fields = [];
      const values = [];
      
      Object.entries(videoData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE videos SET ${fields.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...values);
      
      return Promise.resolve({ id, ...videoData });
    } catch (err) {
      console.error('Error updating video:', err.message);
      return Promise.reject(err);
    }
  }

  static async delete(id) {
    try {
      const video = await Video.findById(id);
      
      if (!video) {
        return Promise.reject(new Error('Video not found'));
      }

      const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
      stmt.run(id);

      if (video.filepath) {
        const fullPath = path.join(process.cwd(), 'public', video.filepath);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (fileErr) {
          console.error('Error deleting video file:', fileErr);
        }
      }

      if (video.thumbnail_path) {
        const thumbnailPath = path.join(process.cwd(), 'public', video.thumbnail_path);
        try {
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        } catch (thumbErr) {
          console.error('Error deleting thumbnail:', thumbErr);
        }
      }

      return Promise.resolve({ success: true, id });
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Video;
