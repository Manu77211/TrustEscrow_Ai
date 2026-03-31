import { Router } from "express";
import { listFreelancersHandler } from "./freelancers.controller.js";

export const freelancersRouter = Router();

freelancersRouter.get("/", listFreelancersHandler);
