/**
 * Calendars API Routes
 * Handles calendar management operations
 */

import express from 'express';
import { getDatabase, generateId } from '../database/database.js';
import { validateCalendar, validateCalendarUpdate } from '../validators/calendarValidator.js';

const router = express.Router();

/**
 * GET /api/calendars
 * Get all calendars for a user
 */
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { user_id = 'default-user' } = req.query;

    const calendars = db.prepare(`
      SELECT * FROM calendars 
      WHERE user_id = ? 
      ORDER BY is_default DESC, name ASC
    `).all(user_id);

    const processedCalendars = calendars.map(calendar => ({
      ...calendar,
      is_default: Boolean(calendar.is_default),
      is_visible: Boolean(calendar.is_visible),
      is_shared: Boolean(calendar.is_shared),
      permissions: JSON.parse(calendar.permissions || '{}')
    }));

    res.json(processedCalendars);
  } catch (error) {
    console.error('Error fetching calendars:', error);
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
});

/**
 * GET /api/calendars/:id
 * Get a specific calendar by ID
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { user_id = 'default-user' } = req.query;

    const calendar = db.prepare(`
      SELECT * FROM calendars 
      WHERE id = ? AND user_id = ?
    `).get(id, user_id);

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    const processedCalendar = {
      ...calendar,
      is_default: Boolean(calendar.is_default),
      is_visible: Boolean(calendar.is_visible),
      is_shared: Boolean(calendar.is_shared),
      permissions: JSON.parse(calendar.permissions || '{}')
    };

    res.json(processedCalendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

/**
 * POST /api/calendars
 * Create a new calendar
 */
router.post('/', (req, res) => {
  try {
    // Validate input
    const { error, value } = validateCalendar(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details 
      });
    }

    const db = getDatabase();
    const calendarData = value;
    const calendarId = calendarData.id || generateId();

    // If this is marked as default, unset other default calendars
    if (calendarData.is_default) {
      db.prepare(`
        UPDATE calendars SET is_default = 0 
        WHERE user_id = ? AND is_default = 1
      `).run(calendarData.user_id);
    }

    // Insert calendar
    const insertCalendar = db.prepare(`
      INSERT INTO calendars (
        id, user_id, name, description, color, timezone,
        is_default, is_visible, is_shared, permissions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCalendar.run(
      calendarId,
      calendarData.user_id,
      calendarData.name,
      calendarData.description || '',
      calendarData.color,
      calendarData.timezone,
      calendarData.is_default ? 1 : 0,
      calendarData.is_visible ? 1 : 0,
      calendarData.is_shared ? 1 : 0,
      JSON.stringify(calendarData.permissions || {})
    );

    // Return the created calendar
    const createdCalendar = db.prepare(`
      SELECT * FROM calendars WHERE id = ?
    `).get(calendarId);

    res.status(201).json({
      ...createdCalendar,
      is_default: Boolean(createdCalendar.is_default),
      is_visible: Boolean(createdCalendar.is_visible),
      is_shared: Boolean(createdCalendar.is_shared),
      permissions: JSON.parse(createdCalendar.permissions || '{}')
    });
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(500).json({ error: 'Failed to create calendar' });
  }
});

/**
 * PUT /api/calendars/:id
 * Update an existing calendar
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { user_id = 'default-user' } = req.body;

    // Validate input
    const { error, value } = validateCalendarUpdate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details 
      });
    }

    const db = getDatabase();

    // Check if calendar exists and belongs to user
    const existingCalendar = db.prepare(
      'SELECT * FROM calendars WHERE id = ? AND user_id = ?'
    ).get(id, user_id);

    if (!existingCalendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    const updateData = value;

    // If this is being set as default, unset other default calendars
    if (updateData.is_default) {
      db.prepare(`
        UPDATE calendars SET is_default = 0 
        WHERE user_id = ? AND is_default = 1 AND id != ?
      `).run(user_id, id);
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'user_id' && updateData[key] !== undefined) {
        if (key === 'permissions') {
          updateFields.push(`${key} = ?`);
          updateValues.push(JSON.stringify(updateData[key]));
        } else if (key === 'is_default' || key === 'is_visible' || key === 'is_shared') {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key] ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
      }
    });

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id, user_id);

    const updateQuery = `
      UPDATE calendars 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND user_id = ?
    `;

    const result = db.prepare(updateQuery).run(...updateValues);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Calendar not found or no changes made' });
    }

    // Return updated calendar
    const updatedCalendar = db.prepare(`
      SELECT * FROM calendars WHERE id = ?
    `).get(id);

    res.json({
      ...updatedCalendar,
      is_default: Boolean(updatedCalendar.is_default),
      is_visible: Boolean(updatedCalendar.is_visible),
      is_shared: Boolean(updatedCalendar.is_shared),
      permissions: JSON.parse(updatedCalendar.permissions || '{}')
    });
  } catch (error) {
    console.error('Error updating calendar:', error);
    res.status(500).json({ error: 'Failed to update calendar' });
  }
});

/**
 * DELETE /api/calendars/:id
 * Delete a calendar
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { user_id = 'default-user' } = req.query;

    const db = getDatabase();

    // Check if calendar exists and is not the only default calendar
    const calendar = db.prepare(
      'SELECT * FROM calendars WHERE id = ? AND user_id = ?'
    ).get(id, user_id);

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    // Check if there are events in this calendar
    const eventCount = db.prepare(
      'SELECT COUNT(*) as count FROM events WHERE calendar_id = ?'
    ).get(id);

    if (eventCount.count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete calendar with existing events',
        message: `This calendar contains ${eventCount.count} events. Please move or delete them first.`
      });
    }

    // If this is the default calendar, make another calendar default
    if (calendar.is_default) {
      const otherCalendar = db.prepare(`
        SELECT id FROM calendars 
        WHERE user_id = ? AND id != ? 
        ORDER BY created_at ASC 
        LIMIT 1
      `).get(user_id, id);

      if (otherCalendar) {
        db.prepare(`
          UPDATE calendars SET is_default = 1 
          WHERE id = ?
        `).run(otherCalendar.id);
      }
    }

    // Delete the calendar
    const result = db.prepare(
      'DELETE FROM calendars WHERE id = ? AND user_id = ?'
    ).run(id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    res.json({ message: 'Calendar deleted successfully', id });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    res.status(500).json({ error: 'Failed to delete calendar' });
  }
});

/**
 * GET /api/calendars/:id/events
 * Get all events for a specific calendar
 */
router.get('/:id/events', (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { start, end, user_id = 'default-user' } = req.query;

    // Verify calendar belongs to user
    const calendar = db.prepare(
      'SELECT id FROM calendars WHERE id = ? AND user_id = ?'
    ).get(id, user_id);

    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }

    let query = `
      SELECT * FROM events 
      WHERE calendar_id = ? AND is_cancelled = 0
    `;
    const params = [id];

    // Add date range filtering
    if (start && end) {
      query += ` AND start_datetime <= ? AND end_datetime >= ?`;
      params.push(end, start);
    }

    query += ` ORDER BY start_datetime ASC`;

    const events = db.prepare(query).all(...params);

    // Parse JSON fields
    const processedEvents = events.map(event => ({
      ...event,
      tags: JSON.parse(event.tags || '[]'),
      reminders: JSON.parse(event.reminders || '[]'),
      attachments: JSON.parse(event.attachments || '[]'),
      is_all_day: Boolean(event.is_all_day),
      is_exception: Boolean(event.is_exception),
      is_cancelled: Boolean(event.is_cancelled)
    }));

    res.json(processedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;