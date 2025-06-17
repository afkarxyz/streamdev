const { db } = require('../db/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
class User {
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email);
        resolve(row);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const row = stmt.get(username);
        resolve(row);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  static findById(id) {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const row = stmt.get(id);
        resolve(row);
      } catch (err) {
        console.error('Database error in findById:', err);
        reject(err);
      }
    });
  }
  
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userId = uuidv4();
      
      const stmt = db.prepare('INSERT INTO users (id, username, password, avatar_path) VALUES (?, ?, ?, ?)');
      stmt.run(userId, userData.username, hashedPassword, userData.avatar_path);
      
      console.log("User created successfully with ID:", userId);
      return { id: userId, username: userData.username };
    } catch (error) {
      console.error("Error in User.create:", error);
      throw error;
    }
  }
  
  static update(userId, userData) {
    return new Promise((resolve, reject) => {
      try {
        const fields = [];
        const values = [];
        
        Object.entries(userData).forEach(([key, value]) => {
          fields.push(`${key} = ?`);
          values.push(value);
        });
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const stmt = db.prepare(query);
        stmt.run(...values);
        
        resolve({ id: userId, ...userData });
      } catch (err) {
        reject(err);
      }
    });
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
module.exports = User;