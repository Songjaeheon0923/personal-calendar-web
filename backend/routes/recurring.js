/**
 * Recurring Events API Routes
 */

import express from 'express';
import { getDatabase, generateId } from '../database/database.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const db = getDatabase();
    const { 
      event_data, 
      recurrence_rule,
      user_id = 'default-user' 
    } = req.body;

    if (!event_data || !recurrence_rule) {
      return res.status(400).json({ error: 'Event data and recurrence rule are required' });
    }

    const parentEventId = generateId();
    const recurrenceId = generateId();

    // Create parent event
    db.prepare(`
      INSERT INTO events (
        id, user_id, calendar_id, title, description, location,
        start_datetime, end_datetime, timezone, is_all_day, color,
        recurrence_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parentEventId,
      user_id,
      event_data.calendar_id,
      event_data.title,
      event_data.description || '',
      event_data.location || '',
      event_data.start_datetime,
      event_data.end_datetime,
      event_data.timezone || 'Asia/Seoul',
      event_data.is_all_day ? 1 : 0,
      event_data.color || '#3b82f6',
      recurrenceId
    );

    // Create recurrence rule
    db.prepare(`
      INSERT INTO recurrence_rules (
        id, parent_event_id, frequency, interval_value, end_type,
        until_date, count_limit, by_week_day, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      recurrenceId,
      parentEventId,
      recurrence_rule.frequency,
      recurrence_rule.interval || 1,
      recurrence_rule.end_type || 'never',
      recurrence_rule.until || null,
      recurrence_rule.count || null,
      JSON.stringify(recurrence_rule.by_week_day || []),
      recurrence_rule.timezone || 'Asia/Seoul'
    );

    res.status(201).json({ 
      parent_event_id: parentEventId, 
      recurrence_id: recurrenceId 
    });
  } catch (error) {
    console.error('Error creating recurring event:', error);
    res.status(500).json({ error: 'Failed to create recurring event' });
  }
});

export default router;