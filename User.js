const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'client'),
    allowNull: false,
    defaultValue: 'client'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  hooks: {
    // Don't store plain text passwords
    beforeSave: async (user) => {
      if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// Instance method to verify password
User.prototype.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

// Create admin user if none exists
User.createAdminIfNone = async function() {
  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount === 0) {
    await User.create({
      username: 'admin',
      password_hash: 'password123', // Will be hashed by the beforeSave hook
      role: 'admin'
    });
    console.log('Default admin user created');
  }
};

module.exports = User; 