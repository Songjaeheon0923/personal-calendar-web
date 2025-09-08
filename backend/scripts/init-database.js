/**
 * Database Initialization Script
 * Run this to set up the database with initial data
 */

import { initDatabase } from '../database/database.js';

async function main() {
  try {
    console.log('🗄️  Initializing Personal Calendar Database...');
    
    await initDatabase();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('📍 Database location: backend/data/calendar.db');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();