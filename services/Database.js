const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'cloud_explorer.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createTasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          operation TEXT,
          source_path TEXT NOT NULL,
          dest_path TEXT NOT NULL,
          source_remote TEXT,
          dest_remote TEXT,
          status TEXT NOT NULL DEFAULT 'queued',
          progress REAL DEFAULT 0,
          error TEXT,
          start_time TEXT,
          end_time TEXT,
          created_at TEXT NOT NULL,
          output TEXT,
          error_output TEXT
        )
      `;

      const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;

      this.db.run(createTasksTable, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.db.run(createSettingsTable, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    });
  }

  async saveTask(task) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO tasks 
        (id, type, operation, source_path, dest_path, source_remote, dest_remote, 
         status, progress, error, start_time, end_time, created_at, output, error_output)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        task.id,
        task.type,
        task.operation || null,
        task.sourcePath,
        task.destPath,
        task.sourceRemote || null,
        task.destRemote || null,
        task.status,
        task.progress,
        task.error || null,
        task.startTime || null,
        task.endTime || null,
        task.createdAt,
        task.output || null,
        task.errorOutput || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async getTask(taskId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tasks WHERE id = ?';
      this.db.get(sql, [taskId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getAllTasks() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async updateTask(taskId, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      values.push(taskId);

      const sql = `UPDATE tasks SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM tasks WHERE id = ?';
      this.db.run(sql, [taskId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT value FROM settings WHERE key = ?';
      this.db.get(sql, [key], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.value : null);
        }
      });
    });
  }

  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
      this.db.run(sql, [key, value], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;
