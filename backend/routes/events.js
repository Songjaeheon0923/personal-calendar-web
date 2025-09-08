/**
 * Events API Routes - Simplified
 */

import express from 'express';
import { getDatabase, generateId } from '../database/database.js';

const router = express.Router();

/**
 * GET /api/events
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { start, end } = req.query;

    let query = `SELECT * FROM events WHERE 1=1`;
    const params = [];

    if (start && end) {
      query += ` AND start_datetime <= ? AND end_datetime >= ?`;
      params.push(end, start);
    }

    query += ` ORDER BY start_datetime ASC`;

    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/events/:id
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const event = db.prepare(`
      SELECT * FROM events WHERE id = ?
    `).get(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * POST /api/events
 */
router.post('/', (req, res) => {
  try {
    const db = getDatabase();
    const {
      title,
      description = '',
      start_datetime,
      end_datetime,
      is_all_day = false,
      color = '#3b82f6'
    } = req.body;

    const id = generateId();
    const now = new Date().toISOString();

    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, title, description, start_datetime, end_datetime, 
        is_all_day, color, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertEvent.run(
      id, title, description, start_datetime, end_datetime,
      is_all_day ? 1 : 0, color, now, now
    );

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 */
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const {
      title,
      description = '',
      start_datetime,
      end_datetime,
      is_all_day = false,
      color = '#3b82f6'
    } = req.body;

    const updateEvent = db.prepare(`
      UPDATE events SET
        title = ?, description = ?, start_datetime = ?, end_datetime = ?,
        is_all_day = ?, color = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = updateEvent.run(
      title, description, start_datetime, end_datetime,
      is_all_day ? 1 : 0, color, new Date().toISOString(), id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const deleteEvent = db.prepare('DELETE FROM events WHERE id = ?');
    const result = deleteEvent.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;