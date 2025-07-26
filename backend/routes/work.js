const express = require('express');
const { body, validationResult } = require('express-validator');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;
const db = require('../config/database');

const router = express.Router();

// Get work schedule
router.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const schedule = await db.query(
      'SELECT * FROM work_schedule WHERE user_id = ? ORDER BY day_of_week',
      [req.user.userId]
    );
    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update work schedule
router.put('/schedule', authenticateToken, async (req, res) => {
  try {
    const { schedule } = req.body; // Array of {day_of_week, is_work_day, default_hours}
    
    const updatePromises = schedule.map(day => 
      db.query(
        'UPDATE work_schedule SET is_work_day = ?, default_hours = ? WHERE user_id = ? AND day_of_week = ?',
        [day.is_work_day, day.default_hours, req.user.userId, day.day_of_week]
      )
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Schedule a specific work day
router.post('/schedule', authenticateToken, [
  body('date').isISO8601().toDate(),
  body('hours').isFloat({ min: 0.5, max: 24 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, hours } = req.body;
    
    // Check if a work day already exists for this date
    const existingWork = await db.query(
      'SELECT id FROM work_days WHERE user_id = ? AND work_date = ?',
      [req.user.userId, date]
    );

    if (existingWork.length > 0) {
      return res.status(400).json({ message: 'Work day already logged for this date' });
    }

    // Check if already scheduled
    const existingSchedule = await db.query(
      'SELECT id FROM scheduled_work_days WHERE user_id = ? AND scheduled_date = ?',
      [req.user.userId, date]
    );

    if (existingSchedule.length > 0) {
      return res.status(400).json({ message: 'Day already scheduled' });
    }

    // Add to scheduled work days
    await db.query(
      'INSERT INTO scheduled_work_days (user_id, scheduled_date, planned_hours) VALUES (?, ?, ?)',
      [req.user.userId, date, hours]
    );

    res.status(201).json({ message: 'Work day scheduled successfully' });
  } catch (error) {
    console.error('Schedule work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a scheduled work day
router.delete('/schedule/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    console.log('DELETE /schedule/:date called with:', { date, userId: req.user.userId });
    
    const result = await db.query(
      'DELETE FROM scheduled_work_days WHERE user_id = ? AND scheduled_date = ?',
      [req.user.userId, date]
    );

    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      console.log('No scheduled work day found for date:', date);
      return res.status(404).json({ message: 'Scheduled work day not found' });
    }

    console.log('Successfully removed scheduled work day for date:', date);
    res.json({ message: 'Scheduled work day removed successfully' });
  } catch (error) {
    console.error('Remove scheduled work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Skip a recurring scheduled work day
router.post('/schedule/skip/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    console.log('POST /schedule/skip/:date called with:', { date, userId: req.user.userId });
    
    // Check if already skipped
    const existingSkip = await db.query(
      'SELECT id FROM skipped_work_days WHERE user_id = ? AND skipped_date = ?',
      [req.user.userId, date]
    );

    if (existingSkip.length > 0) {
      return res.status(400).json({ message: 'Day already marked as skipped' });
    }

    // Add to skipped work days
    await db.query(
      'INSERT INTO skipped_work_days (user_id, skipped_date, reason) VALUES (?, ?, ?)',
      [req.user.userId, date, 'User skipped']
    );

    console.log('Successfully marked day as skipped:', date);
    res.status(201).json({ message: 'Day marked as skipped successfully' });
  } catch (error) {
    console.error('Skip scheduled work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove skip from a day (un-skip)
router.delete('/schedule/skip/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    console.log('DELETE /schedule/skip/:date called with:', { date, userId: req.user.userId });
    
    const result = await db.query(
      'DELETE FROM skipped_work_days WHERE user_id = ? AND skipped_date = ?',
      [req.user.userId, date]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Skipped day not found' });
    }

    console.log('Successfully removed skip for date:', date);
    res.json({ message: 'Skip removed successfully' });
  } catch (error) {
    console.error('Remove skip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk schedule management
router.post('/schedule/bulk', authenticateToken, [
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2030 }),
  body('scheduledDays').isArray(),
  body('defaultHours').isFloat({ min: 0.5, max: 24 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { month, year, scheduledDays, defaultHours } = req.body;
    console.log('Bulk schedule update:', { month, year, scheduledDays: scheduledDays.length, defaultHours, userId: req.user.userId });

    // Use transaction
    await db.transaction(async (connection) => {
      // First, remove all existing scheduled days for the month
      const [deleteResult] = await connection.execute(
        'DELETE FROM scheduled_work_days WHERE user_id = ? AND MONTH(scheduled_date) = ? AND YEAR(scheduled_date) = ?',
        [req.user.userId, month, year]
      );
      console.log('Deleted existing scheduled days:', deleteResult.affectedRows);

      // Then, add the new scheduled days
      if (scheduledDays.length > 0) {
        for (const day of scheduledDays) {
          const [insertResult] = await connection.execute(
            'INSERT INTO scheduled_work_days (user_id, scheduled_date, planned_hours) VALUES (?, ?, ?)',
            [req.user.userId, day.date, day.hours || defaultHours]
          );
          console.log('Inserted scheduled day:', day.date, insertResult.affectedRows);
        }
      }
    });

    console.log('Schedule update committed successfully');
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Bulk schedule update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get work days with pagination
router.get('/days', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 30, month, year } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.userId];

    if (month && year) {
      whereClause += ' AND MONTH(work_date) = ? AND YEAR(work_date) = ?';
      params.push(month, year);
    }

    const workDays = await db.query(
      `SELECT wd.*, u.hourly_rate, 
             ROUND(wd.hours_worked * u.hourly_rate, 2) as calculated_payment,
             ROUND(IFNULL(wd.tips_amount, 0), 2) as tips_amount,
             wd.payment_status,
             wd.payment_date
       FROM work_days wd 
       JOIN user u ON wd.user_id = u.id 
       ${whereClause} 
       ORDER BY work_date DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM work_days ${whereClause}`,
      params
    );

    res.json({
      workDays,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get work days error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add work day
router.post('/days', authenticateToken, [
  body('workDate').isISO8601().toDate(),
  body('startTime').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  }),
  body('endTime').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  }),
  body('hoursWorked').isFloat({ min: 0, max: 24 }),
  body('tipsAmount').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
  }),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workDate, startTime, endTime, hoursWorked, tipsAmount = 0, notes = '' } = req.body;

    // Debug logging
    console.log('Received work day data:', {
      workDate,
      startTime,
      endTime,
      hoursWorked,
      tipsAmount,
      notes
    });

    // Convert empty strings to null for time fields
    const processedStartTime = startTime === '' ? null : startTime;
    const processedEndTime = endTime === '' ? null : endTime;
    const processedTipsAmount = tipsAmount === '' || isNaN(tipsAmount) ? 0 : parseFloat(tipsAmount);

    console.log('Processed data:', {
      processedStartTime,
      processedEndTime,
      processedTipsAmount
    });

    const result = await db.query(
      'INSERT INTO work_days (user_id, work_date, start_time, end_time, hours_worked, tips_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, workDate, processedStartTime, processedEndTime, hoursWorked, processedTipsAmount, notes]
    );

    // Get the inserted record with calculated payment
    const insertedDay = await db.query(
      `SELECT wd.*, u.hourly_rate, 
             ROUND(wd.hours_worked * u.hourly_rate, 2) as calculated_payment,
             ROUND(IFNULL(wd.tips_amount, 0), 2) as tips_amount,
             wd.payment_status,
             wd.payment_date
       FROM work_days wd 
       JOIN user u ON wd.user_id = u.id 
       WHERE wd.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Work day added successfully',
      workDay: insertedDay[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Work day for this date already exists' });
    }
    console.error('Add work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update work day
router.put('/days/:id', authenticateToken, [
  body('startTime').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  }),
  body('endTime').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  }),
  body('hoursWorked').isFloat({ min: 0, max: 24 }),
  body('tipsAmount').optional({ nullable: true }).custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
  }),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { startTime, endTime, hoursWorked, tipsAmount = 0, notes = '' } = req.body;

    // Convert empty strings to null for time fields
    const processedStartTime = startTime === '' ? null : startTime;
    const processedEndTime = endTime === '' ? null : endTime;
    const processedTipsAmount = tipsAmount === '' || isNaN(tipsAmount) ? 0 : parseFloat(tipsAmount);

    const result = await db.query(
      'UPDATE work_days SET start_time = ?, end_time = ?, hours_worked = ?, tips_amount = ?, notes = ? WHERE id = ? AND user_id = ?',
      [processedStartTime, processedEndTime, hoursWorked, processedTipsAmount, notes, id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Work day not found' });
    }

    res.json({ message: 'Work day updated successfully' });
  } catch (error) {
    console.error('Update work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update payment status
router.patch('/days/:id/payment', authenticateToken, [
  body('paymentStatus').isIn(['pending', 'paid']),
  body('paymentDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { paymentStatus, paymentDate } = req.body;

    // If marking as paid and no payment date provided, use current date
    const finalPaymentDate = paymentStatus === 'paid' 
      ? (paymentDate || new Date().toISOString().split('T')[0])
      : null;

    const result = await db.query(
      'UPDATE work_days SET payment_status = ?, payment_date = ? WHERE id = ? AND user_id = ?',
      [paymentStatus, finalPaymentDate, id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Work day not found' });
    }

    res.json({ 
      message: `Payment status updated to ${paymentStatus}`,
      paymentStatus,
      paymentDate: finalPaymentDate
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete work day
router.delete('/days/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM work_days WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Work day not found' });
    }

    res.json({ message: 'Work day deleted successfully' });
  } catch (error) {
    console.error('Delete work day error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get monthly statistics
router.get('/stats/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyStats = await db.query(`
      SELECT 
        MONTH(work_date) as month,
        YEAR(work_date) as year,
        COUNT(*) as days_worked,
        SUM(hours_worked) as total_hours,
        AVG(hours_worked) as avg_hours_per_day,
        ROUND(SUM(hours_worked * (SELECT hourly_rate FROM user WHERE id = ?)), 2) as total_earnings,
        ROUND(SUM(IFNULL(tips_amount, 0), 2) as total_tips
      FROM work_days 
      WHERE user_id = ? AND YEAR(work_date) = ?
      GROUP BY YEAR(work_date), MONTH(work_date)
      ORDER BY month
    `, [req.user.userId, req.user.userId, year]);

    res.json(monthlyStats);
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tips summary
router.get('/tips/summary', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const tipsSummary = await db.query(`
      SELECT 
        COUNT(*) as days_with_tips,
        ROUND(SUM(IFNULL(tips_amount, 0)), 2) as total_tips,
        ROUND(AVG(IFNULL(tips_amount, 0)), 2) as avg_tips_per_day,
        ROUND(MAX(IFNULL(tips_amount, 0)), 2) as max_tips_day,
        ROUND(MIN(CASE WHEN tips_amount > 0 THEN tips_amount END), 2) as min_tips_day
      FROM work_days 
      WHERE user_id = ? AND MONTH(work_date) = ? AND YEAR(work_date) = ?
    `, [req.user.userId, currentMonth, currentYear]);

    res.json(tipsSummary[0]);
  } catch (error) {
    console.error('Get tips summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment summary
router.get('/payment/summary', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const paymentSummary = await db.query(`
      SELECT 
        payment_status,
        COUNT(*) as days_count,
        ROUND(SUM(hours_worked * (SELECT hourly_rate FROM user WHERE id = ?)), 2) as total_earnings,
        ROUND(SUM(IFNULL(tips_amount, 0)), 2) as total_tips
      FROM work_days 
      WHERE user_id = ? AND MONTH(work_date) = ? AND YEAR(work_date) = ?
      GROUP BY payment_status
    `, [req.user.userId, req.user.userId, currentMonth, currentYear]);

    // Format the response
    const summary = {
      pending: { days_count: 0, total_earnings: 0, total_tips: 0 },
      paid: { days_count: 0, total_earnings: 0, total_tips: 0 }
    };

    paymentSummary.forEach(row => {
      summary[row.payment_status] = {
        days_count: row.days_count,
        total_earnings: row.total_earnings || 0,
        total_tips: row.total_tips || 0
      };
    });

    res.json(summary);
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get monthly calendar data
router.get('/calendar/monthly', authenticateToken, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    
    // Get user's work schedule
    const schedule = await db.query(`
      SELECT * FROM work_schedule WHERE user_id = ? ORDER BY day_of_week
    `, [req.user.userId]);
    
    // Get user's hourly rate
    const userInfo = await db.query(`
      SELECT hourly_rate FROM user WHERE id = ?
    `, [req.user.userId]);
    
    const hourlyRate = userInfo[0]?.hourly_rate || 0;
    
    // Get all work days for the month
    const workDays = await db.query(`
      SELECT 
        work_date,
        hours_worked,
        tips_amount,
        payment_status,
        start_time,
        end_time,
        notes,
        ROUND(hours_worked * ?, 2) as calculated_earnings
      FROM work_days 
      WHERE user_id = ? AND MONTH(work_date) = ? AND YEAR(work_date) = ?
    `, [hourlyRate, req.user.userId, month, year]);
    
    // Get scheduled work days for the month
    const scheduledWorkDays = await db.query(`
      SELECT 
        scheduled_date,
        planned_hours
      FROM scheduled_work_days
      WHERE user_id = ? AND MONTH(scheduled_date) = ? AND YEAR(scheduled_date) = ?
    `, [req.user.userId, month, year]);

    // Get skipped work days for the month
    const skippedWorkDays = await db.query(`
      SELECT 
        skipped_date,
        reason
      FROM skipped_work_days
      WHERE user_id = ? AND MONTH(skipped_date) = ? AND YEAR(skipped_date) = ?
    `, [req.user.userId, month, year]);
    
    // Generate calendar data
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    const calendarData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Find schedule for this day of week
      const scheduleDay = schedule.find(s => s.day_of_week === dayOfWeek);
      
      // Find work day data
      const workDay = workDays.find(w => w.work_date.toISOString().split('T')[0] === dateString);
      
      // Find scheduled work day data
      const scheduledWorkDay = scheduledWorkDays.find(s => s.scheduled_date.toISOString().split('T')[0] === dateString);
      
      // Find skipped work day data
      const skippedWorkDay = skippedWorkDays.find(s => s.skipped_date.toISOString().split('T')[0] === dateString);
      
      const dayData = {
        date: dateString,
        day: day,
        dayOfWeek: dayOfWeek,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        isScheduledWorkDay: scheduleDay ? scheduleDay.is_work_day : false,
        defaultHours: scheduleDay ? scheduleDay.default_hours : 0,
        status: 'day-off', // Default status
        worked: false,
        hours: 0,
        earnings: 0,
        tips: 0,
        paymentStatus: null,
        startTime: null,
        endTime: null,
        notes: null,
        isSpecificallyScheduled: false, // Flag to distinguish specific vs. weekly schedule
        canRemoveFromSchedule: false, // Flag to determine if "Remove" button should show
        isSkipped: false, // Flag to indicate if day was skipped
        skipReason: null
      };
      
      if (workDay) {
        // Actually worked
        dayData.worked = true;
        dayData.status = 'worked';
        dayData.hours = parseFloat(workDay.hours_worked);
        dayData.earnings = parseFloat(workDay.calculated_earnings);
        dayData.tips = parseFloat(workDay.tips_amount) || 0;
        dayData.paymentStatus = workDay.payment_status;
        dayData.startTime = workDay.start_time;
        dayData.endTime = workDay.end_time;
        dayData.notes = workDay.notes;
      } else if (scheduledWorkDay) {
        // Specifically scheduled for this date
        const today = new Date();
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        dayData.isSpecificallyScheduled = true;
        dayData.canRemoveFromSchedule = true;
        
        if (currentDateOnly < todayOnly) {
          dayData.status = 'missed'; // Past scheduled day not worked
        } else {
          dayData.status = 'scheduled'; // Future scheduled day
          dayData.hours = parseFloat(scheduledWorkDay.planned_hours);
          dayData.earnings = parseFloat(scheduledWorkDay.planned_hours) * hourlyRate;
        }
      } else if (skippedWorkDay) {
        // Day was skipped
        dayData.status = 'skipped';
        dayData.isSkipped = true;
        dayData.skipReason = skippedWorkDay.reason;
        dayData.canRemoveFromSchedule = true; // Allow un-skipping
      } else if (scheduleDay && scheduleDay.is_work_day) {
        // Scheduled to work based on weekly schedule but not specifically scheduled
        const today = new Date();
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        dayData.isSpecificallyScheduled = false;
        dayData.canRemoveFromSchedule = false; // Can't remove weekly recurring schedule from individual day
        
        if (currentDateOnly < todayOnly) {
          dayData.status = 'missed'; // Past scheduled day not worked
        } else {
          dayData.status = 'scheduled'; // Future scheduled day
          dayData.hours = parseFloat(scheduleDay.default_hours);
          dayData.earnings = parseFloat(scheduleDay.default_hours) * hourlyRate;
        }
      }
      
      calendarData.push(dayData);
    }
    
    // Calculate summary stats
    const workedDays = calendarData.filter(d => d.worked);
    const scheduledDays = calendarData.filter(d => d.status === 'scheduled' || d.isScheduledWorkDay);
    const missedDays = calendarData.filter(d => d.status === 'missed');
    
    const summary = {
      totalDays: daysInMonth,
      scheduledWorkDays: scheduledDays.length,
      workedDays: workedDays.length,
      missedDays: missedDays.length,
      totalHours: workedDays.reduce((sum, d) => sum + d.hours, 0),
      totalEarnings: workedDays.reduce((sum, d) => sum + d.earnings, 0),
      totalTips: workedDays.reduce((sum, d) => sum + d.tips, 0),
      avgHoursPerDay: workedDays.length > 0 ? workedDays.reduce((sum, d) => sum + d.hours, 0) / workedDays.length : 0,
      attendanceRate: scheduledDays.length > 0 ? (workedDays.length / scheduledDays.length) * 100 : 0
    };
    
    res.json({
      month: parseInt(month),
      year: parseInt(year),
      summary,
      days: calendarData
    });
    
  } catch (error) {
    console.error('Get monthly calendar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming work days
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const { limit = 7 } = req.query;
    const currentDate = new Date();
    
    // Get upcoming scheduled work days
    const upcomingDays = await db.query(`
      SELECT 
        DATE(DATE_ADD(CURDATE(), INTERVAL seq.seq DAY)) as date,
        ws.default_hours,
        ws.is_work_day,
        wd.id as work_day_id,
        wd.hours_worked as loggedHours,
        CASE WHEN wd.id IS NOT NULL THEN 1 ELSE 0 END as isLogged
      FROM (
        SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 
        UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
      ) seq
      LEFT JOIN work_schedule ws ON ws.user_id = ? 
        AND ws.day_of_week = DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL seq.seq DAY)) - 1
        AND ws.is_work_day = 1
      LEFT JOIN work_days wd ON wd.user_id = ? 
        AND wd.work_date = DATE(DATE_ADD(CURDATE(), INTERVAL seq.seq DAY))
      WHERE ws.is_work_day = 1 OR wd.id IS NOT NULL
      ORDER BY date
      LIMIT ?
    `, [req.user.userId, req.user.userId, parseInt(limit)]);

    res.json(upcomingDays);
  } catch (error) {
    console.error('Get upcoming work days error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
