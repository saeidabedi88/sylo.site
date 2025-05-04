const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const User = require('../models/User');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production environment');
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : null);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

=======
const { User } = require('../models');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Generate JWT token for user
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
<<<<<<< HEAD
            tokenVersion: user.tokenVersion
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

=======
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
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
<<<<<<< HEAD
            tokenVersion: user.tokenVersion
        };
        next();
    } catch (error) {
        console.error('Authentication error:', error.name, error.message);
        res.clearCookie('token');
=======
            customer_id: user.customer_id
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        return res.redirect('/login');
    }
};

<<<<<<< HEAD
const checkRole = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        if (!req.user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                message: 'You do not have permission to access this resource.',
                title: 'Access Denied'
            });
        }
=======
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

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        next();
    };
};

<<<<<<< HEAD
module.exports = {
    generateToken,
    authenticateToken,
    checkRole
=======
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
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
}; 