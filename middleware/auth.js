const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Generate JWT token for user
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            customer_id: user.customer_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user
        const user = await User.findByPk(decoded.id);

        if (!user || !user.isActive) {
            return res.redirect('/login');
        }

        // Attach user object to request
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            customer_id: user.customer_id
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/login');
    }
};

// Middleware to check role permissions
const checkRole = (roles = []) => {
    // Convert string to array if only one role
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                message: 'Access denied. You do not have permission to view this page.'
            });
        }

        next();
    };
};

// Customer data isolation middleware
const customerFilter = (req, res, next) => {
    // Skip for admin users - they can see all data
    if (req.user.role === 'admin') {
        return next();
    }

    // For non-admin users, attach customer filter to request
    req.customerFilter = { customer_id: req.user.customer_id };
    next();
};

module.exports = {
    generateToken,
    authenticateToken,
    checkRole,
    customerFilter
}; 