import {Router} from 'express';
import { sendReminder } from '../controller/workflow.controller.js';

const workfloRouter = Router();

workfloRouter.post("/subscription/remainder",sendReminder)

export default workfloRouter;