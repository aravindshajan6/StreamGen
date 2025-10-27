import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env file from backend root
dotenv.config();

import { connectDB } from "./src/lib/db.js";

// routes import
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";

// load .env

const app = express();
const PORT = process.env.PORT || 5002;
// const __dirname = path.resolve();

// connect database
connectDB();

// ✅ CORS (must come before routes)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies
  })
);

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Base route
app.get("/", (req, res) => {
  res.send("Hello from the backend");
});

// ✅ Production block BEFORE listen()
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// ✅ Start server (must be last)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
