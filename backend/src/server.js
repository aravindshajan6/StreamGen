import express from "express";
import dotenv from "dotenv/config";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

//routes import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// env variables
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => 
    // console.log("Server is running on 5001"),
    res.send("Hello from the backend")
);

app.listen(5001, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
