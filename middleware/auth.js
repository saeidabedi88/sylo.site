const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production environment');
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : null);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
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

        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            tokenVersion: user.tokenVersion
        };
        next();
    } catch (error) {
        console.error('Authentication error:', error.name, error.message);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

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
        next();
    };
};

module.exports = {
    generateToken,
    authenticateToken,
    checkRole
}; 