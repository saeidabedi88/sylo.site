const express = require('express');
<<<<<<< HEAD
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
=======
const { User, Customer } = require('../models');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(checkRole('admin'));

// List all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Customer }],
            order: [['createdAt', 'DESC']]
        });

        res.render('admin/users', {
            title: 'User Management',
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('admin/users', {
            title: 'User Management',
            users: [],
            error: 'Failed to fetch users'
        });
    }
});

// User creation form
router.get('/create', async (req, res) => {
    try {
        const customers = await Customer.findAll({ where: { isActive: true } });

        res.render('admin/user-form', {
            title: 'Create User',
            user: null,
            customers,
            mode: 'create'
        });
    } catch (error) {
        console.error('Error loading create user form:', error);
        res.redirect('/users');
    }
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
});

// Create user
router.post('/create', async (req, res) => {
    try {
<<<<<<< HEAD
        const { email, username, password, role } = req.body;
        await User.create({ email, username, password, role });
        res.redirect('/users');
    } catch (error) {
        res.render('user-form', { title: 'Create User', user: req.body, mode: 'create', error: 'Failed to create user.' });
=======
        const { email, username, password, role, customer_id } = req.body;

        // Create new user
        await User.create({
            email,
            username,
            password,
            role,
            customer_id: customer_id || null
        });

        res.redirect('/users');
    } catch (error) {
        console.error('Error creating user:', error);

        const customers = await Customer.findAll({ where: { isActive: true } });

        res.render('admin/user-form', {
            title: 'Create User',
            user: req.body,
            customers,
            mode: 'create',
            error: 'Failed to create user. Please check the form and try again.'
        });
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    }
});

// Edit user form
router.get('/edit/:id', async (req, res) => {
<<<<<<< HEAD
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
=======
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.redirect('/users');
        }

        const customers = await Customer.findAll({ where: { isActive: true } });

        res.render('admin/user-form', {
            title: 'Edit User',
            user,
            customers,
            mode: 'edit'
        });
    } catch (error) {
        console.error('Error loading edit user form:', error);
        res.redirect('/users');
    }
});

// Update user
router.post('/edit/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.redirect('/users');
        }

        const { email, username, role, customer_id, isActive } = req.body;

        // Update user
        await user.update({
            email,
            username,
            role,
            customer_id: customer_id || null,
            isActive: isActive === 'on'
        });

        // Update password only if provided
        if (req.body.password && req.body.password.trim() !== '') {
            await user.update({ password: req.body.password });
        }

        res.redirect('/users');
    } catch (error) {
        console.error('Error updating user:', error);

        const customers = await Customer.findAll({ where: { isActive: true } });

        res.render('admin/user-form', {
            title: 'Edit User',
            user: { ...req.body, id: req.params.id },
            customers,
            mode: 'edit',
            error: 'Failed to update user. Please check the form and try again.'
        });
    }
});

// Delete user
router.post('/delete/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            // Don't actually delete, just deactivate
            await user.update({ isActive: false });
        }

        res.redirect('/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.redirect('/users');
    }
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
});

module.exports = router; 