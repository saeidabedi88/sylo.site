const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
<<<<<<< HEAD
=======
const cookieParser = require('cookie-parser');
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

// Load environment variables
dotenv.config();

// Import routes
const contentRoutes = require('./routes/contentRoutes');
<<<<<<< HEAD
const profileRoutes = require('./routes/profileRoutes');

// Import database connection
const sequelize = require('./config/database');
=======
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import database connection and models
const sequelize = require('./config/database');
const models = require('./models');

// Import middleware
const { authenticateToken, customerFilter } = require('./middleware/auth');
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
<<<<<<< HEAD
=======
app.use(cookieParser());
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

<<<<<<< HEAD
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/content', contentRoutes);
app.use('/profile', profileRoutes);

// Frontend Routes
app.get('/', async (req, res) => {
  try {
    const filter = {};
    const platform = req.query.platform && req.query.platform !== 'all' ? req.query.platform : null;

    // Add platform filter if provided
    if (platform) {
      filter.platform = platform;
    }

    // Fetch content directly here to avoid additional API call
    const Content = require('./models/Content');
    const content = await Content.findAll({
      where: filter,
      order: [['publishDate', 'ASC']]
    });

    res.render('index', {
      title: 'Content Management System',
      content: content,
      platform: platform
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.render('index', {
      title: 'Content Management System',
      content: [],
      platform: null,
      error: 'Failed to fetch content'
    });
  }
});

// Content detail route
app.get('/content/:id', async (req, res) => {
  try {
    const Content = require('./models/Content');
    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).send('Content not found');
    }

    res.render('content', {
      content: content
    });
  } catch (error) {
    console.error('Error fetching content details:', error);
    res.status(500).send('Error loading content details');
  }
});

=======
// Auth Routes (no auth required)
app.use('/', authRoutes);

// Protected Routes
app.use('/api/content', contentRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', userRoutes);

// Frontend Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Content detail route (protected)
app.get('/content/:id', authenticateToken, customerFilter, async (req, res) => {
  try {
    // Add customer filter if needed
    const filter = { id: req.params.id, ...req.customerFilter };

    const content = await models.Content.findOne({ where: filter });

    if (!content) {
      return res.status(404).render('error', {
        message: 'Content not found or you do not have permission to view it'
      });
    }

    res.render('content', {
      content: content,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching content details:', error);
    res.status(500).render('error', {
      message: 'Error loading content details'
    });
  }
});

// Error page
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 