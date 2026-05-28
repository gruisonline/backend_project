import { Router } from "express";
import { 
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from "../controllers/tweet.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJwt)

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId")
  .patch(updateTweet)
  .delete(deleteTweet);

export default router