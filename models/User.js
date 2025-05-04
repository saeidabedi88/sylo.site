const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const crypto = require('crypto');

class User extends Model {
    async checkPassword(password) {
        const isMatch = await bcrypt.compare(password, this.password);

        // Update login attempts
        if (!isMatch) {
            this.loginAttempts = (this.loginAttempts || 0) + 1;
            if (this.loginAttempts >= 5) {
                this.isActive = false;
                this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
            }
            await this.save();
        }

        return isMatch;
    }

    async generatePasswordResetToken() {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await this.save();
        return resetToken;
    }

    async resetPassword(password) {
        // Check password history
        const passwordHistory = JSON.parse(this.passwordHistory || '[]');
        for (const oldPassword of passwordHistory) {
            if (await bcrypt.compare(password, oldPassword)) {
                throw new Error('Cannot reuse any of your last 5 passwords');
            }
        }

        // Update password and history
        const hashedPassword = await bcrypt.hash(password, 10);
        passwordHistory.unshift(hashedPassword);
        if (passwordHistory.length > 5) {
            passwordHistory.pop();
        }

        this.password = password; // Will be hashed by hook
        this.passwordHistory = JSON.stringify(passwordHistory);
        this.passwordResetToken = null;
        this.passwordResetExpires = null;
        this.tokenVersion = (this.tokenVersion || 0) + 1;
        this.passwordChangedAt = new Date();

        await this.save();
    }

    async incrementTokenVersion() {
        this.tokenVersion = (this.tokenVersion || 0) + 1;
        await this.save();
    }

    isLocked() {
        return this.lockUntil && this.lockUntil > new Date();
=======

class User extends Model {
    // Method to check password
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password);
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
        validate: { isEmail: true }
=======
        validate: {
            isEmail: true
        }
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
<<<<<<< HEAD
        unique: true,
        validate: {
            len: [3, 30],
            is: /^[a-zA-Z0-9_-]+$/
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100]
        }
=======
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tokenVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    passwordHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]'
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
=======
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'If set, this user belongs to a specific customer'
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
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
<<<<<<< HEAD
        },
        beforeSave: async (user) => {
            // Check if account should be unlocked
            if (user.lockUntil && user.lockUntil < new Date()) {
                user.lockUntil = null;
                user.loginAttempts = 0;
                user.isActive = true;
            }
=======
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        }
    }
});

// Sync model with database
const syncModel = async () => {
    try {
<<<<<<< HEAD
        await User.sync({ alter: true }); // Use alter:true to add new columns
=======
        await User.sync();
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
        console.log('User model synchronized with database.');

        // Create default admin user if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            await User.create({
<<<<<<< HEAD
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                username: 'admin',
                password: process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex'),
=======
                email: 'saeid@tirojnet.ca',
                username: 'saeid',
                password: 'Said@123', // This will be hashed by the beforeCreate hook
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Failed to synchronize User model:', error);
    }
};

<<<<<<< HEAD
// Only run sync in development
if (process.env.NODE_ENV !== 'production') {
    syncModel();
}
=======
// Call sync function
syncModel();
>>>>>>> 40e52c36d7674d99ed2aff405555ac7dc6bbc08e

module.exports = User; 