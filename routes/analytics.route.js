import { Router } from "express";
import { getExpenseData, getCategoryData } from "../controller/analytics.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

// All analytics routes require authentication
analyticsRouter.use(authorize);

// Get expense data for charts
analyticsRouter.get('/expenses', getExpenseData);

// Get category data for pie charts
analyticsRouter.get('/categories', getCategoryData);

export default analyticsRouter;
