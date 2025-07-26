const db = require('../config/database');

async function createCustomizationTables() {
  try {
    console.log('Creating customization tables...');

    // Dashboard customization settings
    await db.query(`
      CREATE TABLE IF NOT EXISTS dashboard_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        layout_type ENUM('grid', 'list', 'compact', 'minimal') DEFAULT 'grid',
        theme ENUM('light', 'dark', 'auto', 'corporate', 'modern') DEFAULT 'light',
        primary_color VARCHAR(7) DEFAULT '#4338ca',
        secondary_color VARCHAR(7) DEFAULT '#64748b',
        show_goals BOOLEAN DEFAULT true,
        show_stats BOOLEAN DEFAULT true,
        show_schedule BOOLEAN DEFAULT true,
        show_recent_work BOOLEAN DEFAULT true,
        show_expenses BOOLEAN DEFAULT true,
        widget_order JSON DEFAULT '["goals", "stats", "schedule", "work", "expenses"]',
        goals_widget_size ENUM('small', 'medium', 'large') DEFAULT 'large',
        stats_widget_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
        schedule_widget_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
        work_widget_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
        expenses_widget_size ENUM('small', 'medium', 'large') DEFAULT 'small',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_settings (user_id)
      )
    `);

    // Custom fields for work entries
    await db.query(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        field_type ENUM('text', 'number', 'date', 'select', 'textarea', 'checkbox', 'url', 'email') NOT NULL,
        field_label VARCHAR(200) NOT NULL,
        field_options JSON NULL, -- For select type fields
        is_required BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        applies_to ENUM('work', 'expense', 'goal', 'global') DEFAULT 'work',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    // Custom field values for work entries
    await db.query(`
      CREATE TABLE IF NOT EXISTS custom_field_values (
        id INT AUTO_INCREMENT PRIMARY KEY,
        custom_field_id INT NOT NULL,
        record_id INT NOT NULL,
        record_type ENUM('work', 'expense', 'goal') NOT NULL,
        field_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (custom_field_id) REFERENCES custom_fields(id) ON DELETE CASCADE,
        UNIQUE KEY unique_field_record (custom_field_id, record_id, record_type)
      )
    `);

    // Dashboard widgets configuration
    await db.query(`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        widget_type VARCHAR(50) NOT NULL,
        widget_title VARCHAR(200),
        widget_config JSON,
        position_x INT DEFAULT 0,
        position_y INT DEFAULT 0,
        width INT DEFAULT 1,
        height INT DEFAULT 1,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    // User preferences
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        preference_key VARCHAR(100) NOT NULL,
        preference_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preference (user_id, preference_key)
      )
    `);

    console.log('✅ Customization tables created successfully!');
    
    // Insert default dashboard settings for existing users
    const users = await db.query('SELECT id FROM user');
    for (const user of users) {
      await db.query(`
        INSERT IGNORE INTO dashboard_settings (user_id) VALUES (?)
      `, [user.id]);
    }
    
    console.log('✅ Default settings created for existing users!');
    
  } catch (error) {
    console.error('❌ Error creating customization tables:', error);
    throw error;
  }
}

if (require.main === module) {
  createCustomizationTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createCustomizationTables };
