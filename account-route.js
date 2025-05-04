// Account settings route
app.get('/account', isAuthenticated, async (req, res) => {
  try {
    // Fetch user data
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }
    
    // Render account page with user data
    res.render('account', {
      title: 'Account Settings',
      username: user.username,
      role: user.role,
      // We don't have these fields in our basic User model yet, but they could be added later
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: 'Content Manager',
      company: 'Acetec Security Solutions',
      timezone: 'America/New_York'
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.render('account', {
      title: 'Account Settings',
      error: 'Failed to load user data'
    });
  }
}); 