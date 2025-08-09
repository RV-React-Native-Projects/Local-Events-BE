import { Hono } from "hono";
// Middleware imports - these are built into Hono
import { users } from "./routes/users";
import { events } from "./routes/events";
import { groups } from "./routes/groups";
import { auth } from "./routes/auth";
import { social } from "./routes/social";
import { notifications } from "./routes/notifications";
import { verification } from "./routes/verification";

const app = new Hono();

// Middleware - CORS headers
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  await next();
});

// Health check
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "LocalEve API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      events: "/api/events",
      groups: "/api/groups",
      social: "/api/social",
      notifications: "/api/notifications",
      verification: "/api/verification",
    },
  });
});

// API routes
app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/events", events);
app.route("/api/groups", groups);
app.route("/api/social", social);
app.route("/api/notifications", notifications);
app.route("/api/verification", verification);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Endpoint not found",
      message: "The requested endpoint does not exist",
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      success: false,
      error: "Internal server error",
      message: "Something went wrong on our end",
    },
    500
  );
});

export default {
  port: 3080,
  fetch: app.fetch,
};
