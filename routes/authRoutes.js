const express = require('express');
<<<<<<< HEAD
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const { body, validationResult } = require('express-validator');

// Rate limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later.'
});

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: 'Too many password reset attempts, please try again later.'
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Validation middleware
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').trim().notEmpty()
];

const passwordValidation = [
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
];

// Login page
router.get('/login', csrfProtection, (req, res) => {
    res.render('login', {
        title: 'Login',
        error: null,
        csrfToken: req.csrfToken()
    });
});

// Login process
router.post('/login', [csrfProtection, loginLimiter, loginValidation], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', {
                title: 'Login',
                error: 'Invalid input data',
                csrfToken: req.csrfToken()
            });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !await user.checkPassword(password)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent timing attacks
            return res.render('login', {
                title: 'Login',
                error: 'Invalid email or password',
                csrfToken: req.csrfToken()
=======
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
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
            });
        }

        if (!user.isActive) {
<<<<<<< HEAD
            return res.render('login', {
                title: 'Login',
                error: 'Account is currently inactive. Please contact support.',
                csrfToken: req.csrfToken()
            });
        }

        const token = generateToken(user);
        await user.update({
            lastLogin: new Date(),
            loginAttempts: 0
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            error: 'An error occurred. Please try again.',
            csrfToken: req.csrfToken()
=======
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
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        });
    }
});

// Logout
<<<<<<< HEAD
router.post('/logout', authenticateToken, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.redirect('/login');
});

// Forgot Password
router.get('/forgot-password', csrfProtection, (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Forgot Password',
        error: null,
        csrfToken: req.csrfToken()
    });
});

router.post('/forgot-password', [csrfProtection, passwordResetLimiter], async (req, res) => {
    try {
        const { email } = req.body;

        // Always return the same response to prevent email enumeration
        const response = {
            title: 'Check Your Email',
            message: 'If an account exists with this email, you will receive a password reset link.'
        };

        const user = await User.findOne({ where: { email } });
        if (!user) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent timing attacks
            return res.render('auth/forgot-password-success', response);
        }

        const resetToken = await user.generatePasswordResetToken();
        await user.save();

        await emailService.sendPasswordResetEmail(email, resetToken);
        res.render('auth/forgot-password-success', response);
    } catch (error) {
        console.error('Password reset error:', error);
        res.render('auth/forgot-password', {
            title: 'Forgot Password',
            error: 'An error occurred. Please try again later.',
            csrfToken: req.csrfToken()
        });
    }
});

// Reset Password
router.get('/reset-password/:token', csrfProtection, async (req, res) => {
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
                error: 'Password reset link is invalid or has expired',
                token: null,
                csrfToken: req.csrfToken()
            });
        }

        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: null,
            token,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: 'An error occurred. Please try again later.',
            token: null,
            csrfToken: req.csrfToken()
        });
    }
});

router.post('/reset-password/:token', [csrfProtection, passwordValidation], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/reset-password', {
                title: 'Reset Password',
                error: errors.array()[0].msg,
                token: req.params.token,
                csrfToken: req.csrfToken()
            });
        }

        const { token } = req.params;
        const { password } = req.body;

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
                error: 'Password reset link is invalid or has expired',
                token: null,
                csrfToken: req.csrfToken()
            });
        }

        await user.resetPassword(password);
        await user.incrementTokenVersion(); // Invalidate all existing sessions

        res.redirect('/auth/login?message=Password reset successful. Please login with your new password.');
    } catch (error) {
        console.error('Reset password error:', error);
        res.render('auth/reset-password', {
            title: 'Reset Password',
            error: 'Failed to reset password. Please try again later.',
            token: req.params.token,
            csrfToken: req.csrfToken()
        });
    }
});

=======
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
module.exports = router; 