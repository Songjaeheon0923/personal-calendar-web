/**
 * Categories API Routes - Simplified
 */

import express from 'express';
import { getDatabase, generateId } from '../database/database.js';

const router = express.Router();

/**
 * GET /api/categories
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const categories = db.prepare(`
      SELECT * FROM categories 
      ORDER BY sort_order ASC, name ASC
    `).all();
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * POST /api/categories
 */
router.post('/', (req, res) => {
  try {
    const db = getDatabase();
    const { name, color = '#6b7280', icon = '', sort_order = 0 } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, color, icon, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertCategory.run(id, name, color, icon, sort_order, now);
    
    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;