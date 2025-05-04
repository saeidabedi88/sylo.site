const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import routes
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import database connection and models
const sequelize = require('./config/database');
const models = require('./models');

// Import middleware
const { authenticateToken, customerFilter } = require('./middleware/auth');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 