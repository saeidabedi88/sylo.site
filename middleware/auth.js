const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user || !user.isActive) {
            return res.redirect('/login');
        }
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/login');
    }
};

const checkRole = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        if (!req.user) return res.redirect('/login');
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).render('error', { message: 'Access denied.' });
        }
        next();
    };
};

module.exports = {
    generateToken,
    authenticateToken,
    checkRole
}; 