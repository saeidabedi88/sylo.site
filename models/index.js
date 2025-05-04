const User = require('./User');
const Customer = require('./Customer');
const Content = require('./Content');

// Define relationships between models
// A customer can have many users
Customer.hasMany(User, { foreignKey: 'customer_id' });
User.belongsTo(Customer, { foreignKey: 'customer_id' });

// A customer can have many content items
Customer.hasMany(Content, { foreignKey: 'customer_id' });
Content.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = {
    User,
    Customer,
    Content
}; 