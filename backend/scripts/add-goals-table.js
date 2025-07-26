// Migration script to create the 'goals' table
const db = require('../config/database');

async function createGoalsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) DEFAULT 'My Goal',
        target_amount DECIMAL(12,2) NOT NULL,
        current_amount DECIMAL(12,2) DEFAULT 0,
        target_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Goals table created or already exists.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating goals table:', error);
    process.exit(1);
  }
}

createGoalsTable();
