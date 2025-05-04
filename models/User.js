const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
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
        validate: { isEmail: true }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
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
        },
        beforeSave: async (user) => {
            // Check if account should be unlocked
            if (user.lockUntil && user.lockUntil < new Date()) {
                user.lockUntil = null;
                user.loginAttempts = 0;
                user.isActive = true;
            }
        }
    }
});

// Sync model with database
const syncModel = async () => {
    try {
        await User.sync({ alter: true }); // Use alter:true to add new columns
        console.log('User model synchronized with database.');

        // Create default admin user if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            await User.create({
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                username: 'admin',
                password: process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex'),
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Failed to synchronize User model:', error);
    }
};

// Only run sync in development
if (process.env.NODE_ENV !== 'production') {
    syncModel();
}

module.exports = User; 