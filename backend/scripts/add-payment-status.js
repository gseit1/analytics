const db = require('../config/database');

async function addPaymentStatusColumn() {
  try {
    console.log('Adding payment_status column to work_days table...');
    
    // Add payment_status column
    await db.query(`
      ALTER TABLE work_days 
      ADD COLUMN payment_status ENUM('pending', 'paid') DEFAULT 'pending' AFTER tips_amount
    `);
    
    // Add payment_date column to track when payment was received
    await db.query(`
      ALTER TABLE work_days 
      ADD COLUMN payment_date DATE NULL AFTER payment_status
    `);
    
    console.log('✅ Payment status columns added successfully!');
    
    // Show updated table structure
    const tableStructure = await db.query('DESCRIBE work_days');
    console.log('\nUpdated table structure:');
    console.table(tableStructure);
    
  } catch (error) {
    console.error('❌ Error adding payment status columns:', error);
  } finally {
    process.exit();
  }
}

addPaymentStatusColumn();
