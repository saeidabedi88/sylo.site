const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

// Load environment variables
dotenv.config();

// Import routes
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');

// Import middleware
const { addUserToLocals, isAuthenticated } = require('./middleware/auth');

// Import database connection
const sequelize = require('./config/database');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: __dirname
  }),
  secret: process.env.SESSION_SECRET || 'bizkit-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Add user data to all views
app.use(addUserToLocals);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth Routes
app.use('/', authRoutes);

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/clients', clientRoutes);

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

// Account settings route
app.get('/account', (req, res) => {
  // For now, we're using mock user data
  const user = {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@acetec.com',
    jobTitle: 'Content Manager',
    company: 'Acetec Security Solutions',
    timezone: 'ET'
  };
  
  res.render('account', { user: user });
});

// Clients page route
app.get('/clients', (req, res) => {
  res.render('clients');
});

// Support page route
app.get('/support', (req, res) => {
  // Mock tickets data
  const tickets = [
    {
      id: 'ACT-2453',
      subject: 'Unable to generate content with specific keywords',
      date: 'May 15, 2023',
      daysAgo: 2,
      status: 'open'
    },
    {
      id: 'ACT-2445',
      subject: 'Facebook publishing authorization issues',
      date: 'May 10, 2023',
      daysAgo: 7,
      status: 'in-progress'
    },
    {
      id: 'ACT-2398',
      subject: 'Need help setting up WordPress API connection',
      date: 'Apr 28, 2023',
      daysAgo: 19,
      status: 'resolved'
    },
    {
      id: 'ACT-2356',
      subject: 'Request for additional user accounts',
      date: 'Apr 15, 2023',
      daysAgo: 32,
      status: 'closed'
    }
  ];
  
  res.render('support', { tickets: tickets });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 