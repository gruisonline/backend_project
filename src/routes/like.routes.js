import { Router } from "express"
import {
  toggleVideoLike
} from "../controllers/like.controllers.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"

const router = Router()
router.use(verifyJwt)

router.route("/toggle/v/:videoId").post(toggleVideoLike);

export default router