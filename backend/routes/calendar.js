const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authRouter = require('./auth');

const router = express.Router();
const authenticateToken = authRouter.authenticateToken;

// Get calendar events for a specific month
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.userId;

    let query = `
      SELECT 
        id,
        title,
        description,
        event_type,
        start_date,
        end_date,
        start_time,
        end_time,
        is_all_day,
        priority,
        status,
        reminder_minutes,
        location,
        attendees,
        color,
        created_at,
        updated_at
      FROM calendar_events 
      WHERE user_id = ?
    `;
    
    const params = [userId];
    
    if (month && year) {
      query += ` AND MONTH(start_date) = ? AND YEAR(start_date) = ?`;
      params.push(month, year);
    }
    
    query += ` ORDER BY start_date ASC, start_time ASC`;
    
    const events = await db.query(query, params);
    
    res.json({
      events: events.map(event => ({
        ...event,
        attendees: event.attendees ? JSON.parse(event.attendees) : []
      }))
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});

// Get events for a specific date
router.get('/events/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const events = await db.query(`
      SELECT 
        id,
        title,
        description,
        event_type,
        start_date,
        end_date,
        start_time,
        end_time,
        is_all_day,
        priority,
        status,
        reminder_minutes,
        location,
        attendees,
        color,
        created_at,
        updated_at
      FROM calendar_events 
      WHERE user_id = ? AND start_date = ?
      ORDER BY start_time ASC
    `, [userId, date]);
    
    res.json({
      events: events.map(event => ({
        ...event,
        attendees: event.attendees ? JSON.parse(event.attendees) : []
      }))
    });
  } catch (error) {
    console.error('Error fetching events for date:', error);
    res.status(500).json({ message: 'Failed to fetch events for date' });
  }
});

// Create a new calendar event
router.post('/events', authenticateToken, [
  body('title').notEmpty().trim(),
  body('event_type').isIn(['todo', 'meeting', 'reminder', 'work', 'personal', 'appointment']),
  body('start_date').isDate(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day = false,
      priority = 'medium',
      status = 'pending',
      reminder_minutes,
      location,
      attendees = [],
      color
    } = req.body;

    const result = await db.query(`
      INSERT INTO calendar_events (
        user_id, title, description, event_type, start_date, end_date,
        start_time, end_time, is_all_day, priority, status, reminder_minutes,
        location, attendees, color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, title, description, event_type, start_date, end_date || start_date,
      start_time, end_time, is_all_day, priority, status, reminder_minutes,
      location, JSON.stringify(attendees), color
    ]);

    const newEvent = await db.query(
      'SELECT * FROM calendar_events WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        ...newEvent[0],
        attendees: newEvent[0].attendees ? JSON.parse(newEvent[0].attendees) : []
      }
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Failed to create calendar event' });
  }
});

// Update a calendar event
router.put('/events/:id', authenticateToken, [
  body('title').optional().notEmpty().trim(),
  body('event_type').optional().isIn(['todo', 'meeting', 'reminder', 'work', 'personal', 'appointment']),
  body('start_date').optional().isDate(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Convert attendees to JSON if present
    if (updateData.attendees) {
      updateData.attendees = JSON.stringify(updateData.attendees);
    }

    // Build dynamic update query
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    updateValues.push(userId, id);

    await db.query(`
      UPDATE calendar_events 
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND id = ?
    `, updateValues);

    const updatedEvent = await db.query(
      'SELECT * FROM calendar_events WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (updatedEvent.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event: {
        ...updatedEvent[0],
        attendees: updatedEvent[0].attendees ? JSON.parse(updatedEvent[0].attendees) : []
      }
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ message: 'Failed to update calendar event' });
  }
});

// Delete a calendar event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ message: 'Failed to delete calendar event' });
  }
});

// Update event status (for todos and tasks)
router.patch('/events/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    await db.query(
      'UPDATE calendar_events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, id, userId]
    );

    res.json({ message: 'Event status updated successfully' });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ message: 'Failed to update event status' });
  }
});

// Get calendar statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.userId;

    let dateFilter = '';
    const params = [userId];
    
    if (month && year) {
      dateFilter = 'AND MONTH(start_date) = ? AND YEAR(start_date) = ?';
      params.push(month, year);
    }

    const stats = await db.query(`
      SELECT 
        event_type,
        status,
        priority,
        COUNT(*) as count
      FROM calendar_events 
      WHERE user_id = ? ${dateFilter}
      GROUP BY event_type, status, priority
    `, params);

    const totalEvents = await db.query(`
      SELECT COUNT(*) as total FROM calendar_events WHERE user_id = ? ${dateFilter}
    `, params);

    const completedTodos = await db.query(`
      SELECT COUNT(*) as completed FROM calendar_events 
      WHERE user_id = ? AND event_type = 'todo' AND status = 'completed' ${dateFilter}
    `, params);

    const upcomingDeadlines = await db.query(`
      SELECT COUNT(*) as upcoming FROM calendar_events 
      WHERE user_id = ? AND start_date >= CURDATE() AND start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) ${dateFilter}
    `, params);

    res.json({
      stats,
      summary: {
        total_events: totalEvents[0].total,
        completed_todos: completedTodos[0].completed,
        upcoming_deadlines: upcomingDeadlines[0].upcoming
      }
    });
  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    res.status(500).json({ message: 'Failed to fetch calendar statistics' });
  }
});

module.exports = router;
