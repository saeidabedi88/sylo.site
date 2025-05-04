const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

class User extends Model {
    // Method to check password
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'editor', 'viewer'),
        defaultValue: 'viewer'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'If set, this user belongs to a specific customer'
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
    modelName: 'user',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Sync model with database
const syncModel = async () => {
    try {
        await User.sync();
        console.log('User model synchronized with database.');

        // Create default admin user if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            await User.create({
                email: 'saeid@tirojnet.ca',
                username: 'saeid',
                password: 'Said@123', // This will be hashed by the beforeCreate hook
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Failed to synchronize User model:', error);
    }
};

// Call sync function
syncModel();

module.exports = User; 