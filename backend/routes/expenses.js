const express = require('express');
const { body, validationResult } = require('express-validator');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;
const db = require('../config/database');

const router = express.Router();

// Get expenses with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 30, type, category, month, year } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.userId];

    if (type && ['income', 'expense'].includes(type)) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (month && year) {
      whereClause += ' AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?';
      params.push(month, year);
    }

    const expenses = await db.query(
      `SELECT * FROM expenses ${whereClause} ORDER BY expense_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM expenses ${whereClause}`,
      params
    );

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add expense/income
router.post('/', authenticateToken, [
  body('category').notEmpty().trim().isLength({ max: 100 }),
  body('description').notEmpty().trim().isLength({ max: 255 }),
  body('amount').isFloat({ min: 0 }),
  body('expenseDate').isISO8601().toDate(),
  body('type').isIn(['income', 'expense'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, description, amount, expenseDate, type } = req.body;

    const result = await db.query(
      'INSERT INTO expenses (user_id, category, description, amount, expense_date, type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.userId, category, description, amount, expenseDate, type]
    );

    const insertedExpense = await db.query(
      'SELECT * FROM expenses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully`,
      expense: insertedExpense[0]
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update expense/income
router.put('/:id', authenticateToken, [
  body('category').notEmpty().trim().isLength({ max: 100 }),
  body('description').notEmpty().trim().isLength({ max: 255 }),
  body('amount').isFloat({ min: 0 }),
  body('expenseDate').isISO8601().toDate(),
  body('type').isIn(['income', 'expense'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { category, description, amount, expenseDate, type } = req.body;

    const result = await db.query(
      'UPDATE expenses SET category = ?, description = ?, amount = ?, expense_date = ?, type = ? WHERE id = ? AND user_id = ?',
      [category, description, amount, expenseDate, type, id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete expense/income
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category',
      [req.user.userId]
    );

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get monthly expense/income summary
router.get('/summary/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlySummary = await db.query(`
      SELECT 
        MONTH(expense_date) as month,
        YEAR(expense_date) as year,
        type,
        ROUND(SUM(amount), 2) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses 
      WHERE user_id = ? AND YEAR(expense_date) = ?
      GROUP BY YEAR(expense_date), MONTH(expense_date), type
      ORDER BY month, type
    `, [req.user.userId, year]);

    // Format the data for easier frontend consumption
    const formattedData = {};
    monthlySummary.forEach(row => {
      const monthKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
      if (!formattedData[monthKey]) {
        formattedData[monthKey] = { income: 0, expense: 0, net: 0 };
      }
      formattedData[monthKey][row.type] = row.total_amount;
    });

    // Calculate net for each month
    Object.keys(formattedData).forEach(month => {
      formattedData[month].net = formattedData[month].income - formattedData[month].expense;
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get expense/income by category
router.get('/summary/category', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const categoryData = await db.query(`
      SELECT 
        category,
        type,
        ROUND(SUM(amount), 2) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses 
      WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?
      GROUP BY category, type
      ORDER BY total_amount DESC
    `, [req.user.userId, targetMonth, targetYear]);

    res.json(categoryData);
  } catch (error) {
    console.error('Get category summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
