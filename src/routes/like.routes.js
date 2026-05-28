import { Router } from "express"
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetlike,
  getLikedVideos
} from "../controllers/like.controllers.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"

const router = Router()
router.use(verifyJwt)

router.route("/toggle/:videoId").post(toggleVideoLike);
router.route("/toggle/:commentId").post(toggleCommentLike);
router.route("/toggle/:tweetId").post(toggleTweetlike);
router.route("/videos").get(getLikedVideos)

export default router