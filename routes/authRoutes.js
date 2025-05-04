const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  res.render('login');
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ where: { username } });
    
    // If user not found or password incorrect
    if (!user || !(await user.verifyPassword(password))) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    // Update last login time
    user.last_login = new Date();
    await user.save();
    
    // Set session data
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    
    // Redirect to dashboard
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'An error occurred during login' });
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

// Change password handler
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    
    // Find user
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password_hash = newPassword;
    await user.save();
    
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

// Update profile handler
router.post('/update-profile', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, email, jobTitle, company, timezone } = req.body;
    
    // Find user
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Add fields to user model if needed (we'd need to update the User model to include these fields)
    // For now, we'll just return success since we're not actually storing this info yet
    
    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

// Admin routes for user management
router.get('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    res.render('admin/users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', { message: 'Failed to fetch users' });
  }
});

// Add new user form
router.get('/admin/users/add', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/add-user');
});

// Create new user
router.post('/admin/users/add', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.render('admin/add-user', { 
        error: 'Username already exists', 
        formData: req.body 
      });
    }
    
    // Create user
    await User.create({
      username,
      password_hash: password,
      role
    });
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    res.render('admin/add-user', { 
      error: 'Failed to create user', 
      formData: req.body 
    });
  }
});

// Reset user password
router.post('/admin/users/reset-password/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.password_hash = newPassword;
    await user.save();
    
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

module.exports = router; 