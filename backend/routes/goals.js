const express = require('express');
const db = require('../config/database');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;

const router = express.Router();

// Get all user goals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const goals = await db.query(`
      SELECT g.*, 
             COUNT(gm.id) as milestone_count,
             COUNT(CASE WHEN gm.achieved_at IS NOT NULL THEN 1 END) as achieved_milestones
      FROM goals g 
      LEFT JOIN goal_milestones gm ON g.id = gm.goal_id 
      WHERE g.user_id = ? AND g.is_active = true 
      GROUP BY g.id 
      ORDER BY g.priority DESC, g.created_at DESC
    `, [req.user.userId]);
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single goal with milestones and progress
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [goal] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    const milestones = await db.query('SELECT * FROM goal_milestones WHERE goal_id = ? ORDER BY target_amount', [req.params.id]);
    const progress = await db.query('SELECT * FROM goal_progress WHERE goal_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
    
    res.json({ ...goal, milestones, progress });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, goal_type, target_amount, target_date, priority, color } = req.body;
    
    const result = await db.query(`
      INSERT INTO goals (user_id, title, description, category, goal_type, target_amount, target_date, priority, color) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.userId, title, description, category, goal_type, target_amount, target_date, priority, color]);
    
    res.json({ message: 'Goal created successfully', goalId: result.insertId });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, goal_type, target_amount, target_date, priority, color } = req.body;
    
    await db.query(`
      UPDATE goals SET title=?, description=?, category=?, goal_type=?, target_amount=?, target_date=?, priority=?, color=? 
      WHERE id=? AND user_id=?
    `, [title, description, category, goal_type, target_amount, target_date, priority, color, req.params.id, req.user.userId]);
    
    res.json({ message: 'Goal updated successfully' });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE goals SET is_active = false WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add progress to specific goal
router.post('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { amount, note } = req.body;
    console.log('Add progress request:', { goalId: req.params.id, userId: req.user.userId, amount, note });
    
    if (!amount || isNaN(amount)) {
      console.log('Invalid amount provided:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // First verify the goal exists and belongs to the user
    const [goal] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ? AND is_active = true', [req.params.id, req.user.userId]);
    if (!goal) {
      console.log('Goal not found or not owned by user:', { goalId: req.params.id, userId: req.user.userId });
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    console.log('Found goal:', goal);
    
    // Add to goal progress history
    const progressResult = await db.query('INSERT INTO goal_progress (goal_id, amount, note) VALUES (?, ?, ?)', [req.params.id, amount, note || null]);
    console.log('Progress added to history:', progressResult);
    
    // Update goal current amount
    const updateResult = await db.query('UPDATE goals SET current_amount = current_amount + ?, updated_at = NOW() WHERE id = ? AND user_id = ?', [amount, req.params.id, req.user.userId]);
    console.log('Goal amount updated:', updateResult);
    
    // Check for milestone achievements
    const milestones = await db.query(`
      SELECT gm.* FROM goal_milestones gm 
      JOIN goals g ON gm.goal_id = g.id 
      WHERE gm.goal_id = ? AND gm.achieved_at IS NULL AND (g.current_amount + ?) >= gm.target_amount
    `, [req.params.id, amount]);
    
    console.log('Milestones to achieve:', milestones);
    
    for (const milestone of milestones) {
      await db.query('UPDATE goal_milestones SET achieved_at = NOW() WHERE id = ?', [milestone.id]);
    }
    
    res.json({ message: 'Progress added successfully', achievedMilestones: milestones.length });
  } catch (error) {
    console.error('Add progress error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Add milestone to goal
router.post('/:id/milestones', authenticateToken, async (req, res) => {
  try {
    const { title, target_amount, reward_description } = req.body;
    
    await db.query(`
      INSERT INTO goal_milestones (goal_id, title, target_amount, reward_description) 
      VALUES (?, ?, ?, ?)
    `, [req.params.id, title, target_amount, reward_description]);
    
    res.json({ message: 'Milestone added successfully' });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete milestone
router.delete('/milestones/:milestoneId', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM goal_milestones WHERE id = ?', [req.params.milestoneId]);
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get goal statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN current_amount >= target_amount THEN 1 END) as completed_goals,
        SUM(target_amount) as total_target,
        SUM(current_amount) as total_progress,
        AVG(CASE WHEN current_amount > 0 THEN (current_amount / target_amount) * 100 END) as avg_progress
      FROM goals 
      WHERE user_id = ? AND is_active = true
    `, [req.user.userId]);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Share goal with others
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { email, message } = req.body;
    const [goal] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    // Create share record
    await db.query(`
      INSERT INTO goal_shares (goal_id, shared_with_email, message, shared_by_user_id) 
      VALUES (?, ?, ?, ?)
    `, [req.params.id, email, message, req.user.userId]);
    
    // Here you would typically send an email notification
    // For now, we'll just return success
    
    res.json({ message: 'Goal shared successfully' });
  } catch (error) {
    console.error('Share goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get shared goals (goals shared with current user)
router.get('/shared', authenticateToken, async (req, res) => {
  try {
    const sharedGoals = await db.query(`
      SELECT g.*, u.username as owner_name, gs.message, gs.created_at as shared_at
      FROM goals g
      JOIN goal_shares gs ON g.id = gs.goal_id
      JOIN user u ON g.user_id = u.id
      WHERE gs.shared_with_email = ? AND g.is_active = true
      ORDER BY gs.created_at DESC
    `, [req.user.email]);
    
    res.json(sharedGoals);
  } catch (error) {
    console.error('Get shared goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Support/encourage someone's goal
router.post('/:id/support', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Check if goal exists and is shared with user
    const [sharedGoal] = await db.query(`
      SELECT g.* FROM goals g
      JOIN goal_shares gs ON g.id = gs.goal_id
      WHERE g.id = ? AND gs.shared_with_email = ?
    `, [req.params.id, req.user.email]);
    
    if (!sharedGoal) return res.status(404).json({ message: 'Goal not found or not shared with you' });
    
    // Add support message
    await db.query(`
      INSERT INTO goal_support (goal_id, supporter_email, message) 
      VALUES (?, ?, ?)
    `, [req.params.id, req.user.email, message]);
    
    res.json({ message: 'Support added successfully' });
  } catch (error) {
    console.error('Add support error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get support messages for a goal
router.get('/:id/support', authenticateToken, async (req, res) => {
  try {
    const support = await db.query(`
      SELECT gs.*, u.username as supporter_name
      FROM goal_support gs
      LEFT JOIN user u ON gs.supporter_email = u.email
      WHERE gs.goal_id = ?
      ORDER BY gs.created_at DESC
    `, [req.params.id]);
    
    res.json(support);
  } catch (error) {
    console.error('Get goal support error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
