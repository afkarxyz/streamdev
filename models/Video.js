const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');
class Video {
  static async create(data) {
    return new Promise((resolve, reject) => {
      try {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        const stmt = db.prepare(`
          INSERT INTO videos (
            id, title, filepath, thumbnail_path, file_size, 
            duration, format, resolution, bitrate, fps, user_id, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          id, data.title, data.filepath, data.thumbnail_path, data.file_size,
          data.duration, data.format, data.resolution, data.bitrate, data.fps, data.user_id,
          now, now
        );
        
        resolve({ id, ...data, created_at: now, updated_at: now });
      } catch (err) {
        console.error('Error creating video:', err.message);
        reject(err);
      }
    });
  }
  
  static findById(id) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
        const row = stmt.get(id);
        resolve(row);
      } catch (err) {
        console.error('Error finding video:', err.message);
        reject(err);
      }
    });
  }
  
  static findAll(userId = null) {
    return new Promise((resolve, reject) => {
      try {
        let stmt, rows;
        
        if (userId) {
          stmt = db.prepare('SELECT * FROM videos WHERE user_id = ? ORDER BY upload_date DESC');
          rows = stmt.all(userId);
        } else {
          stmt = db.prepare('SELECT * FROM videos ORDER BY upload_date DESC');
          rows = stmt.all();
        }
        
        resolve(rows || []);
      } catch (err) {
        console.error('Error finding videos:', err.message);
        reject(err);
      }
    });
  }
  
  static update(id, videoData) {
    return new Promise((resolve, reject) => {
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
        
        resolve({ id, ...videoData });
      } catch (err) {
        console.error('Error updating video:', err.message);
        reject(err);
      }
    });
  }
  
  static delete(id) {
    return new Promise((resolve, reject) => {
      Video.findById(id)
        .then(video => {
          if (!video) {
            return reject(new Error('Video not found'));
          }
          
          try {
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
            
            resolve({ success: true, id });
          } catch (err) {
            console.error('Error deleting video from database:', err.message);
            reject(err);
          }
        })
        .catch(err => reject(err));
    });
  }
}
module.exports = Video;