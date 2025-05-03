const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Show profile page
router.get('/', authenticateToken, async (req, res) => {
    const user = await User.findByPk(req.user.id);
    res.render('profile', {
        title: 'Your Profile',
        user,
        success: req.query.success,
        error: null
    });
});

// Update profile
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const { email, username, password } = req.body;
        user.email = email;
        user.username = username;
        if (password && password.trim() !== '') {
            user.password = password;
        }
        await user.save();
        res.redirect('/profile?success=1');
    } catch (error) {
        console.error('Profile update error:', error);
        res.render('profile', {
            title: 'Your Profile',
            user: req.body,
            success: null,
            error: 'Failed to update profile. Please try again.'
        });
    }
});

module.exports = router; 