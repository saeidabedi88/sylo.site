const express = require('express');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login', error: null });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user || !await user.checkPassword(password)) {
            return res.render('auth/login', {
                title: 'Login',
                error: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.render('auth/login', {
                title: 'Login',
                error: 'This account has been deactivated. Please contact an administrator.'
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Update last login time
        await user.update({ lastLogin: new Date() });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Redirect to dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', {
            title: 'Login',
            error: 'An error occurred during login. Please try again.'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router; 