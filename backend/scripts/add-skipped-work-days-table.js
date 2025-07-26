const db = require('../config/database');

async function addSkippedWorkDaysTable() {
  try {
    console.log('Creating skipped_work_days table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS skipped_work_days (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        skipped_date DATE NOT NULL,
        reason VARCHAR(255) DEFAULT 'User skipped',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_skip_date (user_id, skipped_date),
        INDEX idx_user_skip_date (user_id, skipped_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('skipped_work_days table created successfully');
  } catch (error) {
    console.error('Error creating skipped_work_days table:', error);
    throw error;
  }
}

if (require.main === module) {
  addSkippedWorkDaysTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addSkippedWorkDaysTable };
