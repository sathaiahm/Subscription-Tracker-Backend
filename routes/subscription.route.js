import { Router } from "express";
import { 
    createSubscription, 
    getUserSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    deleteSubscription,
    cancelSubscription,
    getUpcomingRenewals,
    testWorkflow
} from "../controller/subscription.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const subscriptionRouter = Router();

// All subscription routes require authentication
subscriptionRouter.use(authorize);

// Get all subscriptions for logged-in user
subscriptionRouter.get('/', getAllSubscriptions);

// Get upcoming renewals
subscriptionRouter.get('/upcoming-renewals', getUpcomingRenewals);

// Test workflow endpoint (for debugging)
subscriptionRouter.post('/:subscriptionId/test-workflow', testWorkflow);

// Get specific subscription
subscriptionRouter.get('/:id', getSubscriptionById);

// Create new subscription
subscriptionRouter.post('/', createSubscription);

// Cancel subscription
subscriptionRouter.patch('/:id/cancel', cancelSubscription);

// Delete subscription
subscriptionRouter.delete('/:id', deleteSubscription);

// Get subscriptions for specific user (admin feature)
subscriptionRouter.get('/user/:id', getUserSubscription);

export default subscriptionRouter;