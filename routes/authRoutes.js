const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');

// Login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !await user.checkPassword(password)) {
            return res.render('login', { title: 'Login', error: 'Invalid email or password' });
        }
        if (!user.isActive) {
            return res.render('login', { title: 'Login', error: 'Account deactivated.' });
        }
        const token = generateToken(user);
        await user.update({ lastLogin: new Date() });
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { title: 'Login', error: 'An error occurred. Please try again.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Forgot Password
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password', error: null });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render('auth/forgot-password', {
                title: 'Forgot Password',
                error: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        await emailService.sendPasswordResetEmail(email, resetToken);

        res.render('auth/forgot-password-success', {
            title: 'Check Your Email',
            message: 'If an account exists with this email, you will receive a password reset link.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.render('auth/forgot-password', {
            title: 'Forgot Password',
            error: 'Failed to process password reset request'
        });
    }
});

// Reset Password
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.render('auth/reset-password', {
                title: 'Reset Password',
                error: 'Password reset token is invalid or has expired',
                token: null
            });
        }

        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: null,
            token
        });
    } catch (error) {
        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: 'An error occurred',
            token: null
        });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('auth/reset-password', {
                title: 'Reset Password',
                error: 'Passwords do not match',
                token
            });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.render('auth/reset-password', {
                title: 'Reset Password',
                error: 'Password reset token is invalid or has expired',
                token: null
            });
        }

        await user.resetPassword(password);
        res.redirect('/auth/login?message=Password reset successful. Please login with your new password.');
    } catch (error) {
        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: 'Failed to reset password',
            token: req.params.token
        });
    }
});

module.exports = router; 