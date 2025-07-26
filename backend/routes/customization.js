const express = require('express');
const db = require('../config/database');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;

const router = express.Router();

// Get user's dashboard settings
router.get('/dashboard-settings', authenticateToken, async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM dashboard_settings WHERE user_id = ?', 
      [req.user.userId]
    );
    
    if (!settings) {
      // Create default settings
      await db.query(`
        INSERT INTO dashboard_settings (user_id) VALUES (?)
      `, [req.user.userId]);
      
      const [newSettings] = await db.query(
        'SELECT * FROM dashboard_settings WHERE user_id = ?', 
        [req.user.userId]
      );
      res.json(newSettings);
    } else {
      res.json(settings);
    }
  } catch (error) {
    console.error('Get dashboard settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update dashboard settings
router.put('/dashboard-settings', authenticateToken, async (req, res) => {
  try {
    const {
      layout_type,
      theme,
      primary_color,
      secondary_color,
      show_goals,
      show_stats,
      show_schedule,
      show_recent_work,
      show_expenses,
      widget_order,
      goals_widget_size,
      stats_widget_size,
      schedule_widget_size,
      work_widget_size,
      expenses_widget_size
    } = req.body;

    await db.query(`
      UPDATE dashboard_settings SET 
        layout_type = ?,
        theme = ?,
        primary_color = ?,
        secondary_color = ?,
        show_goals = ?,
        show_stats = ?,
        show_schedule = ?,
        show_recent_work = ?,
        show_expenses = ?,
        widget_order = ?,
        goals_widget_size = ?,
        stats_widget_size = ?,
        schedule_widget_size = ?,
        work_widget_size = ?,
        expenses_widget_size = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [
      layout_type,
      theme,
      primary_color,
      secondary_color,
      show_goals,
      show_stats,
      show_schedule,
      show_recent_work,
      show_expenses,
      JSON.stringify(widget_order),
      goals_widget_size,
      stats_widget_size,
      schedule_widget_size,
      work_widget_size,
      expenses_widget_size,
      req.user.userId
    ]);

    res.json({ message: 'Dashboard settings updated successfully' });
  } catch (error) {
    console.error('Update dashboard settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get custom fields
router.get('/custom-fields', authenticateToken, async (req, res) => {
  try {
    const { applies_to = 'work' } = req.query;
    
    const fields = await db.query(`
      SELECT * FROM custom_fields 
      WHERE user_id = ? AND applies_to = ? AND is_active = true 
      ORDER BY display_order, id
    `, [req.user.userId, applies_to]);
    
    res.json(fields);
  } catch (error) {
    console.error('Get custom fields error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create custom field
router.post('/custom-fields', authenticateToken, async (req, res) => {
  try {
    const {
      field_name,
      field_type,
      field_label,
      field_options,
      is_required,
      applies_to,
      display_order
    } = req.body;

    const result = await db.query(`
      INSERT INTO custom_fields (
        user_id, field_name, field_type, field_label, field_options, 
        is_required, applies_to, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.userId,
      field_name,
      field_type,
      field_label,
      field_options ? JSON.stringify(field_options) : null,
      is_required,
      applies_to,
      display_order || 0
    ]);

    res.json({ id: result.insertId, message: 'Custom field created successfully' });
  } catch (error) {
    console.error('Create custom field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update custom field
router.put('/custom-fields/:id', authenticateToken, async (req, res) => {
  try {
    const {
      field_name,
      field_type,
      field_label,
      field_options,
      is_required,
      is_active,
      display_order
    } = req.body;

    await db.query(`
      UPDATE custom_fields SET 
        field_name = ?, field_type = ?, field_label = ?, field_options = ?,
        is_required = ?, is_active = ?, display_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      field_name,
      field_type,
      field_label,
      field_options ? JSON.stringify(field_options) : null,
      is_required,
      is_active,
      display_order,
      req.params.id,
      req.user.userId
    ]);

    res.json({ message: 'Custom field updated successfully' });
  } catch (error) {
    console.error('Update custom field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete custom field
router.delete('/custom-fields/:id', authenticateToken, async (req, res) => {
  try {
    await db.query(`
      UPDATE custom_fields SET is_active = false 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.userId]);

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Delete custom field error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get custom field values for a record
router.get('/custom-field-values/:recordType/:recordId', authenticateToken, async (req, res) => {
  try {
    const { recordType, recordId } = req.params;
    
    const values = await db.query(`
      SELECT cfv.*, cf.field_name, cf.field_type, cf.field_label, cf.field_options
      FROM custom_field_values cfv
      JOIN custom_fields cf ON cfv.custom_field_id = cf.id
      WHERE cfv.record_type = ? AND cfv.record_id = ? AND cf.user_id = ?
    `, [recordType, recordId, req.user.userId]);
    
    res.json(values);
  } catch (error) {
    console.error('Get custom field values error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save custom field values
router.post('/custom-field-values', authenticateToken, async (req, res) => {
  try {
    const { custom_field_id, record_id, record_type, field_value } = req.body;

    // Verify the custom field belongs to the user
    const [field] = await db.query(
      'SELECT id FROM custom_fields WHERE id = ? AND user_id = ?',
      [custom_field_id, req.user.userId]
    );

    if (!field) {
      return res.status(404).json({ message: 'Custom field not found' });
    }

    await db.query(`
      INSERT INTO custom_field_values (custom_field_id, record_id, record_type, field_value)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE field_value = ?, updated_at = CURRENT_TIMESTAMP
    `, [custom_field_id, record_id, record_type, field_value, field_value]);

    res.json({ message: 'Custom field value saved successfully' });
  } catch (error) {
    console.error('Save custom field value error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await db.query(
      'SELECT preference_key, preference_value FROM user_preferences WHERE user_id = ?',
      [req.user.userId]
    );
    
    // Convert to key-value object
    const prefs = {};
    preferences.forEach(pref => {
      try {
        prefs[pref.preference_key] = JSON.parse(pref.preference_value);
      } catch {
        prefs[pref.preference_key] = pref.preference_value;
      }
    });
    
    res.json(prefs);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set user preference
router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preference_key, preference_value } = req.body;
    
    const valueToStore = typeof preference_value === 'object' 
      ? JSON.stringify(preference_value) 
      : preference_value;

    await db.query(`
      INSERT INTO user_preferences (user_id, preference_key, preference_value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE preference_value = ?, updated_at = CURRENT_TIMESTAMP
    `, [req.user.userId, preference_key, valueToStore, valueToStore]);

    res.json({ message: 'Preference saved successfully' });
  } catch (error) {
    console.error('Set preference error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get dashboard widgets
router.get('/dashboard-widgets', authenticateToken, async (req, res) => {
  try {
    const widgets = await db.query(
      'SELECT * FROM dashboard_widgets WHERE user_id = ? ORDER BY position_y, position_x',
      [req.user.userId]
    );
    
    res.json(widgets.map(widget => ({
      ...widget,
      widget_config: widget.widget_config ? JSON.parse(widget.widget_config) : {}
    })));
  } catch (error) {
    console.error('Get dashboard widgets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create/Update dashboard widget
router.post('/dashboard-widgets', authenticateToken, async (req, res) => {
  try {
    const {
      id,
      widget_type,
      widget_title,
      widget_config,
      position_x,
      position_y,
      width,
      height,
      is_visible
    } = req.body;

    if (id) {
      // Update existing widget
      await db.query(`
        UPDATE dashboard_widgets SET 
          widget_title = ?, widget_config = ?, position_x = ?, position_y = ?,
          width = ?, height = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `, [
        widget_title,
        JSON.stringify(widget_config || {}),
        position_x,
        position_y,
        width,
        height,
        is_visible,
        id,
        req.user.userId
      ]);
      
      res.json({ message: 'Widget updated successfully' });
    } else {
      // Create new widget
      const result = await db.query(`
        INSERT INTO dashboard_widgets 
        (user_id, widget_type, widget_title, widget_config, position_x, position_y, width, height, is_visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.user.userId,
        widget_type,
        widget_title,
        JSON.stringify(widget_config || {}),
        position_x || 0,
        position_y || 0,
        width || 1,
        height || 1,
        is_visible !== false
      ]);
      
      res.json({ id: result.insertId, message: 'Widget created successfully' });
    }
  } catch (error) {
    console.error('Save dashboard widget error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete dashboard widget
router.delete('/dashboard-widgets/:id', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM dashboard_widgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard widget error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
