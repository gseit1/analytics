const db = require('../config/database');

async function createCalendarTables() {
  try {
    console.log('Creating calendar events table...');
    
    // Create calendar_events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type ENUM('todo', 'meeting', 'reminder', 'work', 'personal', 'appointment') NOT NULL DEFAULT 'todo',
        start_date DATE NOT NULL,
        end_date DATE,
        start_time TIME,
        end_time TIME,
        is_all_day BOOLEAN DEFAULT FALSE,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        reminder_minutes INT DEFAULT NULL,
        location VARCHAR(255),
        attendees JSON,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, start_date),
        INDEX idx_event_type (event_type),
        INDEX idx_status (status)
      )
    `);

    console.log('Calendar events table created successfully');

    // Insert some sample data
    console.log('Inserting sample calendar events...');
    
    // Get first user ID for sample data
    const users = await db.query('SELECT id FROM user LIMIT 1');
    if (users.length > 0) {
      const userId = users[0].id;
      
      const sampleEvents = [
        {
          title: 'Team Meeting',
          description: 'Weekly team standup meeting',
          event_type: 'meeting',
          start_date: '2025-07-18',
          start_time: '09:00:00',
          end_time: '10:00:00',
          priority: 'medium',
          location: 'Conference Room A',
          reminder_minutes: null,
          color: '#EF4444'
        },
        {
          title: 'Complete project proposal',
          description: 'Finish the Q3 project proposal document',
          event_type: 'todo',
          start_date: '2025-07-18',
          start_time: null,
          end_time: null,
          priority: 'high',
          location: null,
          reminder_minutes: null,
          color: '#F59E0B'
        },
        {
          title: 'Doctor Appointment',
          description: 'Annual checkup',
          event_type: 'appointment',
          start_date: '2025-07-19',
          start_time: '14:30:00',
          end_time: '15:30:00',
          priority: 'medium',
          location: 'Medical Center',
          reminder_minutes: 60,
          color: '#10B981'
        },
        {
          title: 'Pay bills reminder',
          description: 'Monthly bills due',
          event_type: 'reminder',
          start_date: '2025-07-20',
          start_time: null,
          end_time: null,
          priority: 'medium',
          location: null,
          reminder_minutes: null,
          color: '#8B5CF6'
        },
        {
          title: 'Work Day',
          description: 'Regular work day',
          event_type: 'work',
          start_date: '2025-07-21',
          start_time: '08:00:00',
          end_time: '17:00:00',
          priority: 'medium',
          location: null,
          reminder_minutes: null,
          color: '#3B82F6'
        }
      ];

      for (const event of sampleEvents) {
        await db.query(`
          INSERT INTO calendar_events (
            user_id, title, description, event_type, start_date, end_date,
            start_time, end_time, priority, location, reminder_minutes, color
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId, event.title, event.description, event.event_type, 
          event.start_date, event.start_date, event.start_time, event.end_time,
          event.priority, event.location, event.reminder_minutes, event.color
        ]);
      }
      
      console.log('Sample calendar events inserted successfully');
    }

    console.log('Calendar tables setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up calendar tables:', error);
    process.exit(1);
  }
}

createCalendarTables();
