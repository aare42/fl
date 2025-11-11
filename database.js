const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Organizations table
      db.run(`
        CREATE TABLE IF NOT EXISTS organizations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          logo_url TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Cases table
      db.run(`
        CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          file_path TEXT NOT NULL,
          file_type TEXT NOT NULL,
          organization_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organization_id) REFERENCES organizations(id)
        )
      `);

      // Case-Tag relationship table
      db.run(`
        CREATE TABLE IF NOT EXISTS case_tags (
          case_id INTEGER,
          tag_id INTEGER,
          PRIMARY KEY (case_id, tag_id),
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);

      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create default admin if none exists
        db.get('SELECT COUNT(*) as count FROM admins', [], (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (row.count === 0) {
            const defaultPassword = 'admin123'; // Change this in production!
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
              if (err) {
                reject(err);
                return;
              }

              db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)',
                ['admin', hash],
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log('Default admin created: username=admin, password=admin123');
                    resolve();
                  }
                }
              );
            });
          } else {
            resolve();
          }
        });
      });
    });
  });
};

module.exports = {
  db,
  initialize
};
