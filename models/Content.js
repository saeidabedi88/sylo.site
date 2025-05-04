const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

<<<<<<< HEAD
class Content extends Model {}
=======
class Content extends Model { }
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

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
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
<<<<<<< HEAD
=======
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Foreign key to customer this content belongs to'
  },
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
    await Content.sync();
    console.log('Content model synchronized with database.');
  } catch (error) {
    console.error('Failed to synchronize Content model:', error);
  }
};

// Call sync function
syncModel();

module.exports = Content; 