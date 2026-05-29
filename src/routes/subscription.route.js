import { Router } from "express";
import {
  toggleSubcription,
  getUserChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subscription.controllers.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJwt);

router.route("/c/:channelId")
  .get(getUserChannelSubscribers)
  .post(toggleSubcription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router