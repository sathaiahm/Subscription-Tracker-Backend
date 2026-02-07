import { createRequire } from "module";
import Subscription from "../modules/subscription.model.js";
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import dayjs from 'dayjs';
import { sendReminderEmail } from "../utils/email.sender.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminder = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    console.log(`Starting workflow for subscription: ${subscriptionId}`);
    
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') {
        console.log(`Subscription ${subscriptionId} is not active or not found. Stopping workflow.`);
        return;
    }

    const renewalDate = dayjs(subscription.renewalDate);
    console.log(`Renewal date: ${renewalDate.format('YYYY-MM-DD')}`);

    // Check if renewal date has passed
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    // Process reminders in sequence
    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        
        console.log(`Processing ${daysBefore}-day reminder. Reminder date: ${reminderDate.format('YYYY-MM-DD')}`);

        // Only set reminder if the reminder date is in the future
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
            
            // Re-fetch subscription to ensure it's still active
            const currentSubscription = await fetchSubscription(context, subscriptionId);
            if (!currentSubscription || currentSubscription.status !== 'active') {
                console.log(`Subscription ${subscriptionId} is no longer active. Stopping workflow.`);
                return;
            }
            
            // After waking up, trigger the actual reminder
            await triggerReminder(
                context, 
                `${daysBefore}-day reminder`, 
                currentSubscription
            );
        } else {
            console.log(`Reminder for ${daysBefore} days before has already passed, skipping.`);
        }
    }

    console.log(`All reminders processed for subscription ${subscriptionId}`);
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        try {
            const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');
            if (!subscription) {
                console.log(`Subscription with ID ${subscriptionId} not found`);
                return null;
            }
            console.log(`Fetched subscription: ${subscription.name} for user: ${subscription.user.email}`);
            return subscription;
        } catch (error) {
            console.error(`Error fetching subscription ${subscriptionId}:`, error);
            return null;
        }
    });
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} at ${date.format('YYYY-MM-DD HH:mm:ss')}`);
    await context.sleepUntil(label, date.toDate());
    console.log(`Woke up for ${label}`);
};

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} for subscription: ${subscription.name}`);
        
        try {
            await sendReminderEmail({ 
                to: subscription.user.email,
                type: label,
                subscription
            });
            
            console.log(`Successfully sent ${label} to ${subscription.user.email}`);
            return { reminderSent: true, timestamp: new Date() };
        } catch (error) {
            console.error(`Error sending ${label}:`, error);
            // Don't throw error - continue workflow
            return { reminderSent: false, error: error.message, timestamp: new Date() };
        }
    });
};