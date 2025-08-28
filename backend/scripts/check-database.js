const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'job_analytics'
    });

    console.log('Checking database structure...\n');

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Existing tables:');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });

    console.log('\n');

    // Check scheduled_work_days table structure
    try {
      const [columns] = await connection.execute('DESCRIBE scheduled_work_days');
      console.log('scheduled_work_days table structure:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('scheduled_work_days table does not exist:', error.message);
    }

    console.log('\n');

    // Check skipped_work_days table structure
    try {
      const [columns] = await connection.execute('DESCRIBE skipped_work_days');
      console.log('skipped_work_days table structure:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('skipped_work_days table does not exist:', error.message);
    }

    console.log('\n');

    // Check work_days table structure
    try {
      const [columns] = await connection.execute('DESCRIBE work_days');
      console.log('work_days table structure:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('work_days table does not exist:', error.message);
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
