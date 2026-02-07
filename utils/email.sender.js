import { emailTemplates } from './email.template.js'
import dayjs from 'dayjs'
import transporter, { accountEmail } from '../config/nodemailer.js'

export const sendReminderEmail = async ({ to, type, subscription }) => {
    if (!to || !type || !subscription) {
        throw new Error('Missing required parameters: to, type, and subscription are required');
    }

    console.log(`Attempting to send email of type: ${type} to: ${to}`);

    // Find the correct template based on the type
    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {
        console.error(`Template not found for type: ${type}`);
        console.log('Available templates:', emailTemplates.map(t => t.label));
        throw new Error(`Invalid email type: ${type}`);
    }

    // Prepare email data
    const mailInfo = {
        userName: subscription.user?.name || 'User',
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price}`,
        frequency: subscription.frequency,
        paymentMethod: subscription.paymentMethod || 'Not specified',
        accountSettingsLink: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/account` : '#',
        supportLink: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/support` : '#'
    };

    console.log('Email data prepared:', {
        to,
        userName: mailInfo.userName,
        subscriptionName: mailInfo.subscriptionName,
        renewalDate: mailInfo.renewalDate
    });

    try {
        const message = template.generateBody(mailInfo);
        const subject = template.generateSubject(mailInfo);

        const mailOptions = {
            from: accountEmail,
            to: to,
            subject: subject,
            html: message,
        };

        console.log(`Sending email with subject: ${subject}`);

        // Use async/await instead of callback for better error handling
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', info.response);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email:', {
            error: error.message,
            to,
            type,
            subscriptionName: subscription.name
        });
        throw error;
    }
};

// Helper function to test email configuration
export const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email server connection verified successfully');
        return true;
    } catch (error) {
        console.error('Email server connection failed:', error.message);
        return false;
    }
};