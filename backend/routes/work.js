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
        notes: null
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
      } else if (scheduleDay && scheduleDay.is_work_day) {
        // Scheduled to work but not yet worked
        const today = new Date();
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
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
    const scheduledDays = calendarData.filter(d => d.isScheduledWorkDay);
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

module.exports = router;
