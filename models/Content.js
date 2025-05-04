const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Content extends Model {}

Content.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  keywords: {
    type: DataTypes.STRING,
    allowNull: true
  },
  platform: {
    type: DataTypes.ENUM('wordpress', 'facebook', 'instagram'),
    allowNull: false
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planned', 'generated', 'approved', 'published'),
    defaultValue: 'planned'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contentJson: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Structured JSON content for different platforms'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    }
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
  modelName: 'content',
  timestamps: true
});

// Sync model with database
const syncModel = async () => {
  try {
    await Content.sync({ alter: true });
    console.log('Content model synchronized with database.');
  } catch (error) {
    console.error('Failed to synchronize Content model:', error);
  }
};

// Call sync function
syncModel();

module.exports = Content; 