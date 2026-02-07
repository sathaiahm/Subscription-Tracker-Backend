// Add these test endpoints to your app.js or create a new test router

import express from 'express';
import { sendReminderEmail, testEmailConnection } from '../utils/email.sender.js';
import Subscription from '../modules/subscription.model.js';
import { authorize } from '../middleware/auth.middleware.js';
import { accountEmail } from '../config/nodemailer.js';

const testRouter = express.Router();

// 1. Test email connection/configuration
testRouter.get('/email-connection', async (req, res) => {
    try {
        const isConnected = await testEmailConnection();
        res.json({
            success: isConnected,
            message: isConnected ? 'Email connection verified successfully' : 'Email connection failed',
            emailAccount: 'sathaiah85@gmail.com'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            advice: 'Check your Gmail App Password and environment variables'
        });
    }
});

// 2. Send test email to yourself
testRouter.post('/send-test-email', async (req, res) => {
    try {
        const { email } = req.body; // Email address to send test to

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        // Create a mock subscription for testing
        const mockSubscription = {
            name: 'Test Netflix Subscription',
            price: 15.99,
            currency: 'USD',
            frequency: 'monthly',
            paymentMethod: 'Credit Card (**** 1234)',
            renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            user: {
                name: 'Test User',
                email: email
            }
        };

        await sendReminderEmail({
            to: email,
            type: '7-day reminder',
            subscription: mockSubscription
        });

        res.json({
            success: true,
            message: `Test email sent successfully to ${email}`,
            emailType: '7-day reminder'
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 3. Send reminder for existing subscription
testRouter.post('/send-reminder/:subscriptionId', authorize, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { type = '7-day reminder' } = req.body;

        const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check if user owns this subscription
        if (subscription.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only test your own subscriptions'
            });
        }

        await sendReminderEmail({
            to: subscription.user.email,
            type: type,
            subscription
        });

        res.json({
            success: true,
            message: `${type} sent successfully to ${subscription.user.email}`,
            subscription: {
                name: subscription.name,
                renewalDate: subscription.renewalDate
            }
        });

    } catch (error) {
        console.error('Send reminder error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 4. Send all reminder types for a subscription
testRouter.post('/send-all-reminders/:subscriptionId', authorize, async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        if (subscription.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const reminderTypes = ['7-day reminder', '5-day reminder', '2-day reminder', '1-day reminder'];
        const results = [];

        for (const type of reminderTypes) {
            try {
                await sendReminderEmail({
                    to: subscription.user.email,
                    type,
                    subscription
                });
                results.push({ type, success: true });

                // Add small delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                results.push({ type, success: false, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `All reminders sent to ${subscription.user.email}`,
            results,
            subscription: {
                name: subscription.name,
                renewalDate: subscription.renewalDate
            }
        });

    } catch (error) {
        console.error('Send all reminders error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Create test subscription with near renewal date
testRouter.post('/create-test-subscription', authorize, async (req, res) => {
    try {
        // Create subscription that renews in 8 days (so all reminders will trigger)
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 8);

        const testSubscription = await Subscription.create({
            name: 'Test Email Subscription',
            price: 12.99,
            currency: 'USD',
            frequency: 'monthly',
            category: 'technology',
            paymentMethod: 'Test Credit Card (**** 9999)',
            renewalDate: renewalDate,
            user: req.user._id
        });

        await testSubscription.populate('user', 'name email');

        res.json({
            success: true,
            data: testSubscription,
            message: 'Test subscription created - renews in 8 days (perfect for testing reminders)',
            testInstructions: `Use POST /api/test/send-reminder/${testSubscription._id} to test emails`
        });

    } catch (error) {
        console.error('Create test subscription error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add to your test.router.js
testRouter.get('/debug-email', async (req, res) => {
    try {
        console.log('=== EMAIL DEBUG ===');
        console.log('Account Email:', accountEmail);
        console.log('Password Set:', !!process.env.EMAIL_PASSWORD);
        console.log('Password Length:', process.env.EMAIL_PASSWORD?.length);

        // Test transporter configuration
        const isConnected = await testEmailConnection();

        res.json({
            success: isConnected,
            accountEmail,
            passwordConfigured: !!process.env.EMAIL_PASSWORD,
            passwordLength: process.env.EMAIL_PASSWORD?.length,
            message: isConnected ? 'Email configured correctly' : 'Email configuration failed'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            accountEmail,
            troubleshooting: [
                'Check Gmail 2FA is enabled',
                'Verify App Password is correct',
                'Ensure EMAIL_PASSWORD environment variable is set',
                'Try generating a new App Password'
            ]
        });
    }
});

export default testRouter;