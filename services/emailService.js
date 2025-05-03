const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            // Configure based on your email provider
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 30 minutes.</p>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully');
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
}

module.exports = new EmailService(); 