import { Router } from "express";
import { meHandler } from "./users.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, meHandler);
