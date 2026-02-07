import Subscription from "../modules/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
    try {
        // Create subscription first
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id
        });

        console.log('Subscription created:', subscription._id);

        // Ensure SERVER_URL is defined and valid
        if (!SERVER_URL) {
            throw new Error("SERVER_URL is not defined in the environment variables");
        }

        try {
            // Populate user data for the workflow
            await subscription.populate('user', 'name email');

            // Trigger workflow and get the run ID
            const workflowRun = await workflowClient.trigger({
                url: `${SERVER_URL}/api/workflow/subscription/remainder`,
                body: {
                    subscriptionId: subscription._id.toString(),
                }
            });

            console.log('Workflow triggered successfully with ID:', workflowRun.workflowRunId);

            res.status(201).json({
                success: true,
                data: subscription,
                workflowRunId: workflowRun.workflowRunId
            });

        } catch (workflowError) {
            console.error('Error triggering workflow:', workflowError);

            // Still return success for subscription creation, but log workflow error
            res.status(201).json({
                success: true,
                data: subscription,
                warning: "Subscription created but email reminders may not work properly"
            });
        }

    } catch (error) {
        console.error('Error creating subscription:', error);
        next(error);
    }
};

export const getUserSubscription = async (req, res, next) => {
    try {
        // Fixed logic - should compare strings properly
        if (req.user._id.toString() !== req.params.id) {
            const error = new Error("You are not the owner of this account");
            error.statusCode = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id }).populate('user', 'name email');

        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id }).populate('user', 'name email');
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const getSubscriptionById = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('user', 'name email');

        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: 'cancelled' },
            { new: true }
        ).populate('user', 'name email');

        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully",
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const subscriptions = await Subscription.find({
            user: req.user._id,
            renewalDate: { $lte: sevenDaysFromNow },
            status: 'active'
        }).populate('user', 'name email');

        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

// Add a test endpoint to manually trigger workflow for testing
export const testWorkflow = async (req, res, next) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');

        if (!subscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        const workflowRun = await workflowClient.trigger({
            url: `${SERVER_URL}/api/workflow/subscription/remainder`,
            body: {
                subscriptionId: subscription._id.toString(),
            }
        });

        res.status(200).json({
            success: true,
            message: "Test workflow triggered",
            workflowRunId: workflowRun.workflowRunId
        });

    } catch (error) {
        console.error('Error testing workflow:', error);
        next(error);
    }
};