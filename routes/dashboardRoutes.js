const express = require('express');
const { Content } = require('../models');
const { authenticateToken, customerFilter } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);
router.use(customerFilter);

// Dashboard home
router.get('/', async (req, res) => {
    try {
        // Default empty filter
        const filter = { ...req.customerFilter || {} };

        // Add platform filter if provided
        const platform = req.query.platform && req.query.platform !== 'all' ? req.query.platform : null;
        if (platform) {
            filter.platform = platform;
        }

        // Add status filter if provided
        const status = req.query.status && req.query.status !== 'all' ? req.query.status : null;
        if (status) {
            filter.status = status;
        }

        // Fetch content with filters
        const content = await Content.findAll({
            where: filter,
            order: [['publishDate', 'ASC']]
        });

        // Get counts for stats
        const totalCount = await Content.count({ where: req.customerFilter || {} });
        const plannedCount = await Content.count({
            where: { ...req.customerFilter || {}, status: 'planned' }
        });
        const publishedCount = await Content.count({
            where: { ...req.customerFilter || {}, status: 'published' }
        });

        res.render('dashboard/index', {
            title: 'Dashboard',
            content,
            platform,
            status,
            user: req.user,
            stats: {
                total: totalCount,
                planned: plannedCount,
                published: publishedCount
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('dashboard/index', {
            title: 'Dashboard',
            content: [],
            platform: null,
            status: null,
            user: req.user,
            stats: {
                total: 0,
                planned: 0,
                published: 0
            },
            error: 'Failed to fetch dashboard data'
        });
    }
});

module.exports = router; 