const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

class Stream {
  static create(streamData) {
    try {
      const id = uuidv4();
      const {
        title,
        video_id,
        rtmp_url,
        stream_key,
        platform,
        platform_icon,
        bitrate = 2500,
        resolution,
        fps = 30,
        orientation = 'horizontal',
        loop_video = true,
        schedule_time = null,
        duration = null,
        use_advanced_settings = false,
        user_id
      } = streamData;

      const loop_video_int = loop_video ? 1 : 0;
      const use_advanced_settings_int = use_advanced_settings ? 1 : 0;
      const status = schedule_time ? 'scheduled' : 'offline';
      const status_updated_at = new Date().toISOString();

      const stmt = db.prepare(`INSERT INTO streams (
        id, title, video_id, rtmp_url, stream_key, platform, platform_icon,
        bitrate, resolution, fps, orientation, loop_video,
        schedule_time, duration, status, status_updated_at, use_advanced_settings, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      stmt.run(
        id, title, video_id, rtmp_url, stream_key, platform, platform_icon,
        bitrate, resolution, fps, orientation, loop_video_int,
        schedule_time, duration, status, status_updated_at, use_advanced_settings_int, user_id
      );

      return Promise.resolve({ id, ...streamData, status, status_updated_at });
    } catch (err) {
      console.error('Error creating stream:', err.message);
      return Promise.reject(err);
    }
  }

  static findById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM streams WHERE id = ?');
      const row = stmt.get(id);
      
      if (row) {
        row.loop_video = row.loop_video === 1;
        row.use_advanced_settings = row.use_advanced_settings === 1;
      }
      
      return Promise.resolve(row);
    } catch (err) {
      console.error('Error finding stream:', err.message);
      return Promise.reject(err);
    }
  }

  static findAll(userId = null, filter = null) {
    try {
      let query = `
        SELECT s.*, 
               v.title AS video_title, 
               v.filepath AS video_filepath,
               v.thumbnail_path AS video_thumbnail, 
               v.duration AS video_duration,
               v.resolution AS video_resolution,  
               v.bitrate AS video_bitrate,        
               v.fps AS video_fps                 
        FROM streams s
        LEFT JOIN videos v ON s.video_id = v.id
      `;
      const params = [];
      
      if (userId) {
        query += ' WHERE s.user_id = ?';
        params.push(userId);
        
        if (filter) {
          if (filter === 'live') {
            query += " AND s.status = 'live'";
          } else if (filter === 'scheduled') {
            query += " AND s.status = 'scheduled'";
          } else if (filter === 'offline') {
            query += " AND s.status = 'offline'";
          }
        }
      }
      
      query += ' ORDER BY s.created_at DESC';
      
      const stmt = db.prepare(query);
      const rows = stmt.all(...params);
      
      if (rows) {
        rows.forEach(row => {
          row.loop_video = row.loop_video === 1;
          row.use_advanced_settings = row.use_advanced_settings === 1;
        });
      }
      
      return Promise.resolve(rows || []);
    } catch (err) {
      console.error('Error finding streams:', err.message);
      return Promise.reject(err);
    }
  }

  static update(id, streamData) {
    try {
      const fields = [];
      const values = [];
      
      Object.entries(streamData).forEach(([key, value]) => {
        if (key === 'loop_video' && typeof value === 'boolean') {
          fields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE streams SET ${fields.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...values);
      
      return Promise.resolve({ id, ...streamData });
    } catch (err) {
      console.error('Error updating stream:', err.message);
      return Promise.reject(err);
    }
  }

  static delete(id, userId) {
    try {
      const stmt = db.prepare('DELETE FROM streams WHERE id = ? AND user_id = ?');
      const result = stmt.run(id, userId);
      
      return Promise.resolve({ success: true, deleted: result.changes > 0 });
    } catch (err) {
      console.error('Error deleting stream:', err.message);
      return Promise.reject(err);
    }
  }

  static updateStatus(id, status, userId) {
    try {
      const status_updated_at = new Date().toISOString();
      let start_time = null;
      let end_time = null;
      
      if (status === 'live') {
        start_time = new Date().toISOString();
      } else if (status === 'offline') {
        end_time = new Date().toISOString();
      }

      const stmt = db.prepare(`UPDATE streams SET 
        status = ?, 
        status_updated_at = ?, 
        start_time = COALESCE(?, start_time), 
        end_time = COALESCE(?, end_time),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`);
      
      const result = stmt.run(status, status_updated_at, start_time, end_time, id, userId);
      
      return Promise.resolve({
        id,
        status,
        status_updated_at,
        start_time,
        end_time,
        updated: result.changes > 0
      });
    } catch (err) {
      console.error('Error updating stream status:', err.message);
      return Promise.reject(err);
    }
  }

  static async getStreamWithVideo(id) {
    try {
      const stmt = db.prepare(`SELECT s.*, v.title AS video_title, v.filepath AS video_filepath, 
              v.thumbnail_path AS video_thumbnail, v.duration AS video_duration
       FROM streams s
       LEFT JOIN videos v ON s.video_id = v.id
       WHERE s.id = ?`);
      
      const row = stmt.get(id);
      
      if (row) {
        row.loop_video = row.loop_video === 1;
        row.use_advanced_settings = row.use_advanced_settings === 1;
      }
      
      return Promise.resolve(row);
    } catch (err) {
      console.error('Error fetching stream with video:', err.message);
      return Promise.reject(err);
    }
  }

  static async isStreamKeyInUse(streamKey, userId, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM streams WHERE stream_key = ? AND user_id = ?';
      const params = [streamKey, userId];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const stmt = db.prepare(query);
      const row = stmt.get(...params);
      
      return Promise.resolve(row.count > 0);
    } catch (err) {
      console.error('Error checking stream key:', err.message);
      return Promise.reject(err);
    }
  }

  static findScheduledInRange(startTime, endTime) {
    try {
      const startTimeStr = startTime.toISOString();
      const endTimeStr = endTime.toISOString();
      
      const stmt = db.prepare(`
        SELECT s.*, 
               v.title AS video_title, 
               v.filepath AS video_filepath,
               v.thumbnail_path AS video_thumbnail, 
               v.duration AS video_duration,
               v.resolution AS video_resolution,
               v.bitrate AS video_bitrate,
               v.fps AS video_fps  
        FROM streams s
        LEFT JOIN videos v ON s.video_id = v.id
        WHERE s.status = 'scheduled'
        AND s.schedule_time IS NOT NULL
        AND s.schedule_time >= ?
        AND s.schedule_time <= ?
      `);
      
      const rows = stmt.all(startTimeStr, endTimeStr);
      
      if (rows) {
        rows.forEach(row => {
          row.loop_video = row.loop_video === 1;
          row.use_advanced_settings = row.use_advanced_settings === 1;
        });
      }
      
      return Promise.resolve(rows || []);
    } catch (err) {
      console.error('Error finding scheduled streams:', err.message);
      return Promise.reject(err);
    }
  }
}

module.exports = Stream;
