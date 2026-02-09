import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public: get subscribers of a channel
router.route("/c/:channelId/subscribers").get(getUserChannelSubscribers);

// Private routes
router.use(verifyJWT);

// Subscribe / unsubscribe
router.route("/c/:channelId").post(toggleSubscription);

// Get channels I subscribed to
router.route("/me").get(getSubscribedChannels);

export default router;
