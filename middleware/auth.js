/**
 * Authentication and authorization middleware
 */

// Check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  // If not logged in, redirect to login page
  res.redirect('/login');
};

// Check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  
  // If not an admin, return forbidden
  res.status(403).render('error', { 
    message: 'Access denied. Admin privileges required.' 
  });
};

// Check if the user is a client
const isClient = (req, res, next) => {
  if (req.session && (req.session.userRole === 'client' || req.session.userRole === 'admin')) {
    return next();
  }
  
  // If not a client or admin, return forbidden
  res.status(403).render('error', { 
    message: 'Access denied. Client privileges required.' 
  });
};

// Add user info to locals for all views
const addUserToLocals = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.isAuthenticated = true;
    res.locals.username = req.session.username;
    res.locals.userRole = req.session.userRole;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isClient,
  addUserToLocals
}; 