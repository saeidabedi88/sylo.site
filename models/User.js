const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User extends Model {
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    generatePasswordResetToken() {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        return resetToken;
    }

    async resetPassword(password) {
        this.password = password;
        this.passwordResetToken = null;
        this.passwordResetExpires = null;
        await this.save();
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
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
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
                email: 'admin@example.com',
                username: 'admin',
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Failed to synchronize User model:', error);
    }
};
syncModel();

module.exports = User; 