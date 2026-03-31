import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { verifyJwt } from "./lib/jwt.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { freelancersRouter } from "./modules/freelancers/freelancers.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { canAccessProject, createProjectMessage } from "./modules/projects/projects.service.js";
import { submissionsRouter } from "./modules/submissions/submissions.routes.js";
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
app.use("/api/submissions", submissionsRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_ORIGIN,
  },
});

io.use((socket, next) => {
  const authToken = typeof socket.handshake.auth?.token === "string" ? socket.handshake.auth.token : "";
  const header = socket.handshake.headers.authorization;
  const bearerToken =
    typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : "";
  const token = authToken || bearerToken;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = verifyJwt(token);
    socket.data.auth = {
      userId: payload.userId,
      role: payload.role,
    };
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.on("project:join", async (projectId: string, ack?: (result: { ok: boolean; message?: string }) => void) => {
    const auth = socket.data.auth as { userId: string; role: string } | undefined;
    if (!auth || !projectId) {
      ack?.({ ok: false, message: "Unauthorized" });
      return;
    }

    const hasAccess = await canAccessProject(projectId, auth.userId, auth.role);
    if (!hasAccess) {
      ack?.({ ok: false, message: "Project not found or inaccessible" });
      return;
    }

    socket.join(`project:${projectId}`);
    ack?.({ ok: true });
  });

  socket.on(
    "project:message:send",
    async (
      payload: { projectId: string; content: string; fileUrl?: string },
      ack?: (result: { ok: boolean; message?: string }) => void,
    ) => {
      const auth = socket.data.auth as { userId: string; role: string } | undefined;

      if (!auth || !payload?.projectId || !payload?.content?.trim()) {
        ack?.({ ok: false, message: "Validation failed" });
        return;
      }

      try {
        const message = await createProjectMessage(payload.projectId, auth.userId, auth.role, {
          content: payload.content,
          fileUrl: payload.fileUrl,
        });

        io.to(`project:${payload.projectId}`).emit("project:message:new", message);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, message: (error as Error).message });
      }
    },
  );

  socket.on("disconnect", () => {
    // Connection cleanup handled by Socket.io room lifecycle.
  });
});

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${env.PORT}`);
});
