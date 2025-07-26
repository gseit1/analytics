const db = require('../config/database');

async function addScheduledWorkDaysTable() {
  try {
    console.log('Creating scheduled_work_days table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS scheduled_work_days (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        scheduled_date DATE NOT NULL,
        planned_hours DECIMAL(4,2) NOT NULL DEFAULT 8.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, scheduled_date),
        INDEX idx_user_date (user_id, scheduled_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('scheduled_work_days table created successfully');
  } catch (error) {
    console.error('Error creating scheduled_work_days table:', error);
    throw error;
  }
}

if (require.main === module) {
  addScheduledWorkDaysTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addScheduledWorkDaysTable };
