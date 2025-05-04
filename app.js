const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const contentRoutes = require('./routes/contentRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Import database connection
const sequelize = require('./config/database');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 