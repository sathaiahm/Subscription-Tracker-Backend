import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';

export const accountEmail = 'sathaiahm85@gmail.com';

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: accountEmail,
        pass: EMAIL_PASSWORD // This should be your App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Enhanced connection test
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Enable 2FA on Gmail');
        console.log('2. Generate App Password');
        console.log('3. Use App Password in EMAIL_PASSWORD (not regular password)');
        console.log('4. Check account email is correct');
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

export default transporter;