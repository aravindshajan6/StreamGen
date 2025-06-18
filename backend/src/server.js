import express from "express";
import dotenv from "dotenv/config";
import { connectDB } from "./lib/db.js";

//routes import
import authRoutes from "./routes/auth.routes.js";

// env variables
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => 
    // console.log("Server is running on 5001"),
    res.send("Hello from the backend")
);

app.listen(5001, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
