import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import userRouter from './routes/user.router.js';
import authRouter from './routes/auth.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import analyticsRouter from './routes/analytics.route.js';
import connectToDatabase from './Database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import { arcjectMiddleware } from './middleware/arject.middleware.js';
import workfloRouter from './routes/workflow.router.js';
import testRouter from './testRouter/test.router.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/workflow',workfloRouter);
app.use('/api/test', testRouter);

// Apply Arcjet protection BEFORE routes
app.use(arcjectMiddleware);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Subscription Tracker API');
});

// Error handling middleware (must be last)
app.use(errorMiddleware);



// Start server
connectToDatabase().then(() => {
  app.listen(PORT, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
    } else {
      console.log(`Server is running successfully on http://localhost:${PORT}`);
    }
  });
});

// Add this to your app.js or create a debug file
console.log('Email Debug Info:');
console.log('Email Account:', 'sathaiah85@gmail.com');
console.log('Password Length:', process.env.EMAIL_PASSWORD?.length);
console.log('Password Preview:', process.env.EMAIL_PASSWORD?.substring(0, 4) + '****');

export default app;