import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendRequests, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controllers.js";

const router = express.Router();

router.use(protectedRoute);

//get recommended users
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/accept-friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;
