import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { freelancersRouter } from "./modules/freelancers/freelancers.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/freelancers", freelancersRouter);
app.use("/api/projects", projectsRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_ORIGIN,
  },
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    // Socket lifecycle placeholder for upcoming project chat events.
  });
});

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${env.PORT}`);
});
