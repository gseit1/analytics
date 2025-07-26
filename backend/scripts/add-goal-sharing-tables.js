const db = require('../config/database');

async function addGoalSharingTables() {
  try {
    console.log('Creating goal sharing and collaboration tables...');

    // Goal sharing table
    await db.query(`
      CREATE TABLE IF NOT EXISTS goal_shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        shared_with_email VARCHAR(255) NOT NULL,
        message TEXT,
        shared_by_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by_user_id) REFERENCES user(id) ON DELETE CASCADE,
        INDEX idx_shared_email (shared_with_email),
        INDEX idx_goal_id (goal_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Goal support/encouragement table
    await db.query(`
      CREATE TABLE IF NOT EXISTS goal_support (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        supporter_email VARCHAR(255) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        INDEX idx_goal_id (goal_id),
        INDEX idx_supporter_email (supporter_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Goal collaboration table (for family members/friends to contribute)
    await db.query(`
      CREATE TABLE IF NOT EXISTS goal_collaborators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        collaborator_email VARCHAR(255) NOT NULL,
        permission_level ENUM('view', 'contribute', 'manage') DEFAULT 'view',
        invited_by_user_id INT NOT NULL,
        accepted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by_user_id) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE KEY unique_goal_collaborator (goal_id, collaborator_email),
        INDEX idx_collaborator_email (collaborator_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Goal contributions table (when collaborators contribute money)
    await db.query(`
      CREATE TABLE IF NOT EXISTS goal_contributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        contributor_email VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        message TEXT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        INDEX idx_goal_id (goal_id),
        INDEX idx_contributor_email (contributor_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Goal sharing and collaboration tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating goal sharing tables:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addGoalSharingTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addGoalSharingTables;
