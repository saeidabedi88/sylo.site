const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Customer extends Model { }

Customer.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: true
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
    modelName: 'customer',
    timestamps: true
});

// Sync model with database
const syncModel = async () => {
    try {
        await Customer.sync();
        console.log('Customer model synchronized with database.');

        // Create a default customer if none exist
        const customerCount = await Customer.count();
        if (customerCount === 0) {
            await Customer.create({
                name: 'Default Customer',
                contactEmail: 'customer@example.com',
                contactPhone: '555-1234'
            });
            console.log('Default customer created');
        }
    } catch (error) {
        console.error('Failed to synchronize Customer model:', error);
    }
};

// Call sync function
syncModel();

module.exports = Customer; 