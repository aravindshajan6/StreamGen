import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controllers.js";

const router = express.Router();

router.get("/token", protectedRoute, getStreamToken);

export default router;