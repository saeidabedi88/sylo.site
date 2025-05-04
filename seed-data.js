const Client = require('./models/Client');

// Seed initial client data
async function seedClients() {
  try {
    // Check if the default client already exists
    const existingClient = await Client.findOne({ where: { name: 'Acetec.ca' } });
    
    if (!existingClient) {
      // Create default client profile
      await Client.create({
        name: 'Acetec.ca',
        config: {
          tone: 'professional, trustworthy, and supportive',
          audience: 'general public, families, and caregivers',
          cta: 'Learn more at acetec.ca',
          hashtags: ['#acetec', '#independentliving', '#sharedservices', '#securitysolutions']
        },
        isActive: true
      });
      
      console.log('Default client profile created successfully');
    } else {
      console.log('Default client profile already exists');
    }
  } catch (error) {
    console.error('Error seeding client data:', error);
  }
}

// Run the seed function
seedClients();

module.exports = {
  seedClients
}; 