const express = require('express');
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

// All routes require admin
router.use(authenticateToken);
router.use(checkRole('admin'));

// List users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['createdAt', 'DESC']] });
        res.render('users', { title: 'User Management', users });
    } catch (error) {
        res.render('users', { title: 'User Management', users: [], error: 'Failed to fetch users' });
    }
});

// Create user form
router.get('/create', (req, res) => {
    res.render('user-form', { title: 'Create User', user: null, mode: 'create', error: null });
});

// Create user
router.post('/create', async (req, res) => {
    try {
        const { email, username, password, role } = req.body;
        await User.create({ email, username, password, role });
        res.redirect('/users');
    } catch (error) {
        res.render('user-form', { title: 'Create User', user: req.body, mode: 'create', error: 'Failed to create user.' });
    }
});

// Edit user form
router.get('/edit/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect('/users');
    res.render('user-form', { title: 'Edit User', user, mode: 'edit', error: null });
});

// Edit user
router.post('/edit/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.redirect('/users');
        const { email, username, role, isActive, password } = req.body;
        await user.update({ email, username, role, isActive: isActive === 'on' });
        if (password && password.trim() !== '') {
            await user.update({ password });
        }
        res.redirect('/users');
    } catch (error) {
        res.render('user-form', { title: 'Edit User', user: { ...req.body, id: req.params.id }, mode: 'edit', error: 'Failed to update user.' });
    }
});

// Deactivate user
router.post('/delete/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) await user.update({ isActive: false });
    res.redirect('/users');
});

module.exports = router; 