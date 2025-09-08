/**
 * SQLite Database Connection and Setup
 * Using better-sqlite3 for synchronous operations
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, '..', 'data', 'calendar.db');

let db = null;

/**
 * Initialize database connection and create tables
 */
export async function initDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create database connection
    db = new Database(DB_PATH);
    
    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    
    // Create tables
    createTables();
    
    // Create default data
    createDefaultData();
    
    console.log(`SQLite database initialized at: ${DB_PATH}`);
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create database tables based on schema
 */
function createTables() {
  // Simple categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6b7280',
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Simple events table - only essential fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_datetime DATETIME NOT NULL,
      end_datetime DATETIME NOT NULL,
      is_all_day BOOLEAN DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create simple indexes for performance
  createIndexes();
  
  console.log('Database tables created successfully');
}

/**
 * Create database indexes for better performance
 */
function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_datetime)',
    'CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_datetime)',
    'CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(sort_order)'
  ];

  indexes.forEach(indexSQL => {
    db.exec(indexSQL);
  });

  console.log('Database indexes created successfully');
}

/**
 * Create default data for new installations
 */
function createDefaultData() {
  // Check if categories exist
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  
  if (existingCategories.count === 0) {
    // Create default categories
    const categories = [
      { name: '업무', color: '#ef4444', icon: '💼', order: 1 },
      { name: '개인', color: '#3b82f6', icon: '🏠', order: 2 },
      { name: '학습', color: '#10b981', icon: '📚', order: 3 },
      { name: '운동', color: '#f59e0b', icon: '🏃', order: 4 },
      { name: '약속', color: '#8b5cf6', icon: '🤝', order: 5 },
      { name: '기타', color: '#6b7280', icon: '📌', order: 6 }
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, color, icon, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    categories.forEach(cat => {
      insertCategory.run(generateId(), cat.name, cat.color, cat.icon, cat.order);
    });

    console.log('Default data created successfully');
  }
}

/**
 * Generate UUID v4
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Execute a transaction
 */
export function transaction(callback) {
  const db = getDatabase();
  const transaction = db.transaction(callback);
  return transaction;
}

export { generateId };