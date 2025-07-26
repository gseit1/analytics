// Migration script to enhance the 'goals' table for multiple goals
const db = require('../config/database');

async function enhanceGoalsTable() {
  try {
    // Drop existing goals table to recreate with new structure
    await db.query(`DROP TABLE IF EXISTS goals`);
    
    // Create enhanced goals table
    await db.query(`
      CREATE TABLE goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category ENUM('savings', 'equipment', 'vacation', 'emergency', 'investment', 'debt', 'other') DEFAULT 'savings',
        goal_type ENUM('short-term', 'long-term') DEFAULT 'short-term',
        target_amount DECIMAL(12,2) NOT NULL,
        current_amount DECIMAL(12,2) DEFAULT 0,
        target_date DATE NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        color VARCHAR(7) DEFAULT '#4338ca',
        is_active BOOLEAN DEFAULT true,
        is_shared BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Create goal milestones table
    await db.query(`
      CREATE TABLE goal_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        achieved_at TIMESTAMP NULL,
        reward_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Create goal progress history table
    await db.query(`
      CREATE TABLE goal_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('Enhanced goals tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error enhancing goals tables:', error);
    process.exit(1);
  }
}

enhanceGoalsTable();
