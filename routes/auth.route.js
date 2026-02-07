import { Router } from "express";
import { signUp, signOut, signIn } from "../controller/auth.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Public routes
authRouter.post('/signup', signUp);
authRouter.post('/login', signIn);

// Protected routes
authRouter.post('/signout', authorize, signOut);

export default authRouter;