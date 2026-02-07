import { Router } from "express";
import { getUser, getUsers, getProfile, updateProfile } from "../controller/user.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.get('/', getUsers);

// Protected routes
userRouter.get('/me', authorize, getProfile);
userRouter.put('/me', authorize, updateProfile);
userRouter.get('/:id', authorize, getUser);
userRouter.put('/:id', authorize, (req, res) => res.send({ title: 'Update user data' }));
userRouter.delete('/:id', authorize, (req, res) => res.send({ title: 'Delete user data' }));

export default userRouter;