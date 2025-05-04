const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Client extends Model {}

Client.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'client',
  timestamps: true
});

// Sync model with database
const syncModel = async () => {
  try {
    await Client.sync();
    console.log('Client model synchronized with database.');
  } catch (error) {
    console.error('Failed to synchronize Client model:', error);
  }
};

// Call sync function
syncModel();

module.exports = Client; 